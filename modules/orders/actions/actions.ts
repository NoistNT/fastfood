'use server';

import { and, eq, gte, lt } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';
import { revalidateTag, unstable_cache as cache } from 'next/cache';

import { db } from '@/db/drizzle';
import { orderItem, orders, orderStatusHistory } from '@/db/schema';
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
    await db
      .insert(orderItem)
      .values(newOrder.items.map(({ productId, quantity }) => ({ orderId, productId, quantity })));
  } catch (_error) {
    throw new Error(t('createItemError', { orderId }));
  }
};

const insertAndGetOrderId = async (newOrder: NewOrderRequest) => {
  const { items: _items, ...orderData } = newOrder;
  return await db.insert(orders).values(orderData).returning({ id: orders.id });
};

const addStatus = async (orderId: string) => {
  return await db.insert(orderStatusHistory).values({
    orderId,
    status: ORDER_STATUS.PENDING,
    createdAt: new Date(),
  });
};

export const create = async (newOrderData: Omit<NewOrderRequest, 'userId'>) => {
  const t = await getTranslations('Orders');
  const { OrderId, CreateNewOrder } = getOrderSchemas((key) => t(`helpers.${key}`));
  try {
    const existingUser = await db.query.users.findFirst();
    if (!existingUser) throw new Error(t('errors.noUsers'));

    const newOrder: NewOrderRequest = { ...newOrderData, userId: existingUser.id };
    const validatedNewOrder = validateData(CreateNewOrder, newOrder);

    const [orderId] = await insertAndGetOrderId(validatedNewOrder);
    const validatedOrderId = validateData(OrderId, orderId.id);

    await addStatus(validatedOrderId);

    await createItem(validatedOrderId, validatedNewOrder, (key, values) =>
      t(`errors.${key}`, values)
    );

    revalidateTag('orders', 'max');
  } catch (error) {
    if (error instanceof Error && error.message.includes(t('errors.noUsers'))) throw error;
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

export const revalidateOrders = async () => revalidateTag('orders', 'max');
