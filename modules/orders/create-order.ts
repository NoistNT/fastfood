import { getTranslations } from 'next-intl/server';
import { revalidateTag } from 'next/cache';

import { db } from '@/db/drizzle';
import { orderItem, orders, orderStatusHistory } from '@/db/schema';
import { getOrderSchemas, validateData } from '@/modules/orders/helpers';
import { computeOrderTotal } from '@/modules/orders/pricing';
import { ORDER_STATUS, type NewOrderRequestItem } from '@/modules/orders/types';

export interface CreateOrderInput {
  userId: string;
  items: NewOrderRequestItem[];
}

export interface CreatedOrder {
  id: string;
  userId: string;
  total: string;
  status: typeof ORDER_STATUS.PENDING;
}

/**
 * Persists a checkout order. The total is always recomputed from catalog
 * prices — callers never supply an amount. Lives outside 'use server' so it
 * cannot be invoked directly as a public server action. neon-http has no
 * interactive transactions; db.batch() makes the order / status-history /
 * items writes atomic, mirroring staff intake.
 */
export async function createOrder(input: CreateOrderInput): Promise<CreatedOrder> {
  const t = await getTranslations('Orders');
  const { CreateNewOrder } = getOrderSchemas((key) => t(`helpers.${key}`));

  try {
    const total = await computeOrderTotal(input.items);
    const validatedNewOrder = validateData(CreateNewOrder, {
      userId: input.userId,
      items: input.items,
      total,
    });

    const orderId = crypto.randomUUID();
    await db.batch([
      db.insert(orders).values({
        id: orderId,
        userId: validatedNewOrder.userId,
        total: validatedNewOrder.total,
      }),
      db.insert(orderStatusHistory).values({
        orderId,
        status: ORDER_STATUS.PENDING,
        createdAt: new Date(),
      }),
      db.insert(orderItem).values(
        validatedNewOrder.items.map(({ productId, quantity }) => ({
          orderId,
          productId,
          quantity,
        }))
      ),
    ]);

    revalidateTag('orders', 'max');

    return {
      id: orderId,
      userId: validatedNewOrder.userId,
      total: validatedNewOrder.total,
      status: ORDER_STATUS.PENDING,
    };
  } catch (error) {
    console.error('Error in create order:', error);
    throw new Error(t('errors.createOrderError'));
  }
}
