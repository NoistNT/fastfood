'use server';

import { and, eq, gte, lt } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';

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
  type DashboardOrderWithItems,
  type FindManyResponse,
  type NewOrder,
  type NewOrderItem,
  type OrderStatus,
} from '@/modules/orders/types';

const createItem = async (
  orderId: string,
  newOrder: NewOrder,
  t: (key: string, values?: { orderId: string }) => string
) => {
  try {
    const [newOrderItem]: NewOrderItem[] = await db
      .insert(orderItem)
      .values(
        newOrder.items.map(({ productId, quantity }) => ({
          orderId,
          productId,
          quantity,
        }))
      )
      .returning({
        orderId: orderItem.orderId,
        productId: orderItem.productId,
        quantity: orderItem.quantity,
      });

    return newOrderItem;
  } catch (error) {
    console.error(error as Error);
    throw new Error(t('createItemError', { orderId }));
  }
};

const insertAndGetOrderId = async (newOrder: NewOrder) => {
  return await db.insert(orders).values(newOrder).returning({ id: orders.id });
};

const addStatus = async (orderId: string) => {
  return await db.insert(orderStatusHistory).values({
    orderId,
    status: ORDER_STATUS.PENDING,
    createdAt: new Date(),
  });
};

export const create = async (newOrder: Omit<NewOrder, 'userId'>) => {
  const t = await getTranslations('Orders');
  const { OrderId, CreateNewOrder } = getOrderSchemas((key) => t(`helpers.${key}`));
  try {
    // Fetch an existing user ID from the database to associate with the order.
    // This is a temporary solution until we have user authentication in place.
    const existingUser = await db.query.users.findFirst();
    if (!existingUser) {
      throw new Error(t('errors.noUsers'));
    }

    const validatedNewOrder = validateData(CreateNewOrder, {
      ...newOrder,
      userId: existingUser.id, // Use an existing user ID
      total: newOrder.total,
    });

    const [orderId] = await insertAndGetOrderId(validatedNewOrder);
    const validatedOrderId = validateData(OrderId, orderId.id);

    await addStatus(validatedOrderId);

    return await createItem(validatedOrderId, validatedNewOrder, (key, values) =>
      t(`errors.${key}`, values)
    );
  } catch (error) {
    console.error(error as Error);
    if (error instanceof Error && error.message.includes(t('errors.noUsers'))) {
      throw error;
    }
    throw new Error(t('errors.createOrderError'));
  }
};

export const ordersList = async (
  orders: FindManyResponse[]
): Promise<DashboardOrderWithItems[]> => {
  const t = await getTranslations('Orders.errors');

  return orders.map((order) => {
    if (!isValidStatus(order.status)) throw new Error(t('invalidStatus'));

    return {
      order: {
        ...order,
        statusHistory: [],
        status: order.status,
        createdAt: order.createdAt,
      },
      items: order.orderItems.map(({ product: { name, price }, quantity }) => ({
        name,
        quantity,
        subtotal: (quantity * parseFloat(price)).toString(),
      })),
    };
  });
};

export const findAll = async (date: Date | undefined) => {
  const t = await getTranslations('Orders.errors');
  try {
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
          with: { product: { columns: { name: true, price: true } } },
        },
        statusHistory: { columns: { status: true, createdAt: true } },
      },
    });

    return allOrders.map((order) => ({
      order: {
        ...order,
        orderItems: order.orderItems,
        statusHistory: order.statusHistory,
      },
      items: order.orderItems.map(({ product: { name, price }, quantity }) => ({
        name,
        quantity,
        subtotal: (quantity * parseFloat(price)).toString(),
      })),
      statusHistory: order.statusHistory,
    })) as DashboardOrderWithItems[];
  } catch (error) {
    console.error(error as Error);
    throw new Error(t('noOrders'));
  }
};

export const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
  const t = await getTranslations('Orders.errors');
  try {
    if (!isValidStatus(newStatus)) throw new Error(t('invalidStatus'));

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order) throw new Error(t('orderNotFound'));

    if (!canTransition(order.status as OrderStatus, newStatus)) {
      throw new Error(t('invalidTransition'));
    }

    await db.insert(orderStatusHistory).values({ orderId, status: newStatus });
    await db
      .update(orders)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(orders.id, orderId));

    return { success: true };
  } catch (error) {
    console.error(error as Error);
    throw new Error(t('updateStatusError', { orderId }));
  }
};
