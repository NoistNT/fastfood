'use server';

import { and, count, eq, gte, inArray, lt } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';
import { revalidateTag, unstable_cache as cache } from 'next/cache';

import { db } from '@/db/drizzle';
import { orderItem, orders, orderStatusHistory, products } from '@/db/schema';
import {
  canTransition,
  getOrderSchemas,
  isValidStatus,
  validateData,
} from '@/modules/orders/helpers';
import {
  ORDER_STATUS,
  type DashboardOrderView,
  type NewOrderRequest,
  type OrderStatus,
} from '@/modules/orders/types';

const createItem = async (
  orderId: string,
  newOrder: NewOrderRequest,
  t: (key: string, values?: { orderId: string }) => string
) => {
  try {
    // Validate that all products exist
    const productIds = newOrder.items.map((item) => item.productId);
    const existingProducts = await db
      .select({ id: products.id })
      .from(products)
      .where(inArray(products.id, productIds));

    const existingProductIds = new Set(existingProducts.map((p) => p.id));
    const invalidProductIds = productIds.filter((id) => !existingProductIds.has(id));

    if (invalidProductIds.length > 0) {
      throw new Error(`Invalid product IDs: ${invalidProductIds.join(', ')}`);
    }

    await db
      .insert(orderItem)
      .values(newOrder.items.map(({ productId, quantity }) => ({ orderId, productId, quantity })));
  } catch (_error) {
    console.error('Error inserting orderItem:', _error);
    throw new Error(t('createItemError', { orderId }));
  }
};

const insertAndGetOrderId = async (newOrder: NewOrderRequest) => {
  const { items: _items, ...orderData } = newOrder;
  const result = await db.insert(orders).values(orderData).returning({ id: orders.id });
  if (result.length === 0) throw new Error('Failed to insert order');
  return result;
};

const addStatus = async (orderId: string) => {
  return await db.insert(orderStatusHistory).values({
    orderId,
    status: ORDER_STATUS.PENDING,
    createdAt: new Date(),
  });
};

export const create = async (newOrderData: NewOrderRequest) => {
  const t = await getTranslations('Orders');
  const { OrderId, CreateNewOrder } = getOrderSchemas((key) => t(`helpers.${key}`));
  try {
    const validatedNewOrder = validateData(CreateNewOrder, newOrderData);

    const [orderId] = await insertAndGetOrderId(validatedNewOrder);
    const validatedOrderId = validateData(OrderId, orderId.id);

    await addStatus(validatedOrderId);

    await createItem(validatedOrderId, validatedNewOrder, (key, values) =>
      t(`errors.${key}`, values)
    );

    revalidateTag('orders', 'max');

    // Return the created order information
    return {
      id: validatedOrderId,
      userId: validatedNewOrder.userId,
      total: validatedNewOrder.total,
      status: ORDER_STATUS.PENDING,
    };
  } catch (error) {
    console.error('Error in create order:', error);
    throw new Error(t('errors.createOrderError'));
  }
};

export async function findAll(date?: Date): Promise<DashboardOrderView[]> {
  const t = await getTranslations('Orders.errors');
  try {
    return await cachedFindAll(date);
  } catch (_error) {
    throw new Error(t('noOrders'));
  }
}

const cachedFindAll = cache(
  async (date?: Date): Promise<DashboardOrderView[]> => {
    const where = date
      ? and(
          gte(orders.createdAt, new Date(date.setHours(0, 0, 0, 0))),
          lt(orders.createdAt, new Date(date.setHours(23, 59, 59, 999)))
        )
      : undefined;

    const allOrders = await db.query.orders.findMany({
      where,
      with: {
        orderItems: {
          columns: { quantity: true },
          with: { product: { columns: { id: true, name: true, price: true } } },
        },
        statusHistory: {
          columns: { status: true, createdAt: true, id: true, orderId: true, updatedAt: true },
        },
      },
      orderBy: orders.createdAt,
    });

    return allOrders.map((order) => ({
      order: { ...order, statusHistory: order.statusHistory },
      items: order.orderItems.map(({ product: { id, name, price }, quantity }) => ({
        id,
        name,
        quantity,
        subtotal: (quantity * parseFloat(price)).toString(),
      })),
    }));
  },
  ['orders-findAll'],
  { tags: ['orders'] }
);

export const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
  const t = await getTranslations('Orders.errors');
  try {
    if (!isValidStatus(newStatus)) throw new Error(t('invalidStatus'));

    const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
    if (!order) throw new Error(t('orderNotFound'));
    if (!canTransition(order.status, newStatus)) throw new Error(t('invalidTransition'));

    await db.insert(orderStatusHistory).values({ orderId, status: newStatus });
    await db
      .update(orders)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(orders.id, orderId));

    revalidateTag('orders', 'max');

    return { success: true };
  } catch (_error) {
    throw new Error(t('errors.updateStatusError', { orderId }));
  }
};

export async function findAllWithPages(
  date?: Date,
  limit: number = 10,
  offset: number = 0
): Promise<{ orders: DashboardOrderView[]; total: number }> {
  const t = await getTranslations('Orders.errors');
  try {
    return await cachedFindAllWithPages(date, limit, offset);
  } catch (_error) {
    throw new Error(t('noOrders'));
  }
}

const cachedFindAllWithPages = cache(
  async (date?: Date, limit: number = 10, offset: number = 0) => {
    const where = date
      ? and(
          gte(orders.createdAt, new Date(date.setHours(0, 0, 0, 0))),
          lt(orders.createdAt, new Date(date.setHours(23, 59, 59, 999)))
        )
      : undefined;

    const [allOrders, totalCount] = await Promise.all([
      db.query.orders.findMany({
        where,
        limit,
        offset,
        with: {
          orderItems: {
            columns: { quantity: true },
            with: { product: { columns: { id: true, name: true, price: true } } },
          },
          statusHistory: {
            columns: { status: true, createdAt: true, id: true, orderId: true, updatedAt: true },
          },
          user: {
            columns: { name: true },
          },
        },
        orderBy: orders.createdAt,
      }),
      db.select({ count: count() }).from(orders).where(where),
    ]);

    const ordersMapped = allOrders.map((order) => {
      // Get the current status from the most recent status history entry
      const currentStatus =
        order.statusHistory.length > 0
          ? order.statusHistory.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )[0].status
          : ORDER_STATUS.PENDING;

      // Ensure status history includes at least the current status
      let statusHistory = [...order.statusHistory];
      if (statusHistory.length === 0) {
        // If no status history exists, create one with the current status
        statusHistory = [
          {
            status: currentStatus,
            createdAt: order.createdAt,
            id: '', // Will be filled by the component
            orderId: order.id,
            updatedAt: order.updatedAt,
          },
        ];
      }

      return {
        order: {
          ...order,
          status: currentStatus,
          statusHistory: statusHistory,
          userName: order.user?.name || 'Unknown',
        },
        items: order.orderItems.map(({ product: { id, name, price }, quantity }) => ({
          id,
          name,
          quantity,
          subtotal: (quantity * parseFloat(price)).toString(),
        })),
      };
    });

    return { orders: ordersMapped, total: totalCount[0].count };
  },
  ['orders-findAllWithPages'],
  { tags: ['orders'] }
);

export const revalidateOrders = async () => revalidateTag('orders', 'max');
