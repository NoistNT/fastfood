'use server';

import { eq } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { orderItem, orders, orderStatusHistory } from '@/db/schema';
import {
  canTransition,
  CreateNewOrder,
  isValidStatus,
  OrderId,
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

const createItem = async (orderId: string, newOrder: NewOrder) => {
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

    throw new Error(`Error creating item for order ${orderId}.`);
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
  try {
    // Fetch an existing user ID from the database to associate with the order.
    // This is a temporary solution until we have user authentication in place.
    const existingUser = await db.query.users.findFirst();
    if (!existingUser) {
      throw new Error('No users found in the database.');
    }

    const validatedNewOrder = validateData(CreateNewOrder, {
      ...newOrder,
      userId: existingUser.id, // Use an existing user ID
      total: newOrder.total,
    });

    const [orderId] = await insertAndGetOrderId(validatedNewOrder);
    const validatedOrderId = validateData(OrderId, orderId.id);

    await addStatus(validatedOrderId);

    return await createItem(validatedOrderId, validatedNewOrder);
  } catch (error) {
    console.error(error as Error);
    throw new Error('Order could not be created.');
  }
};

export const ordersList = async (
  orders: FindManyResponse[]
): Promise<DashboardOrderWithItems[]> => {
  return orders.map((order) => {
    if (!isValidStatus(order.status)) throw new Error('Invalid status');

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

export const findAll = async () => {
  try {
    const allOrders = await db.query.orders.findMany({
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
    throw new Error('No orders found. Please try again later or contact support.');
  }
};

export const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
  try {
    if (!isValidStatus(newStatus)) throw new Error('Invalid status');

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order) throw new Error('Order not found');

    if (!canTransition(order.status as OrderStatus, newStatus)) {
      throw new Error('Invalid transition');
    }

    await db.insert(orderStatusHistory).values({ orderId, status: newStatus });
    await db
      .update(orders)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(orders.id, orderId));

    return { success: true };
  } catch (error) {
    console.error(error as Error);
    throw new Error(`Error updating status for order ${orderId}`);
  }
};
