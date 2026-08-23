import { inArray } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { orderItem, orderStatusHistory, orders, products } from '@/db/schema';
import { isUniqueViolation } from '@/lib/db-errors';
import { generateTrackingCode } from '@/lib/tracking-code';
import { findOrCreatePerson } from '@/modules/users/persons';
import {
  ORDER_STATUS,
  ORDER_TYPE,
  type OrderType,
  type PaymentMethod,
} from '@/modules/orders/types';

export interface IntakePersonInput {
  name: string;
  phoneNumber?: string | null;
}

export interface IntakeItemInput {
  productId: number;
  quantity: number;
}

export interface IntakeOrderInput {
  person: IntakePersonInput;
  items: IntakeItemInput[];
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  deliveryAddress?: string | null;
  deliveryNotes?: string | null;
}

export interface IntakeOrderResult {
  id: string;
  userId: string;
  total: string;
  status: typeof ORDER_STATUS.PENDING;
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  trackingCode: string;
}

const MAX_TRACKING_ATTEMPTS = 5;

/**
 * Creates an order transcribed by operational staff (WhatsApp intake):
 * resolves/creates the customer through the shared dedupe path, computes the
 * total server-side from catalog prices (never trusting the client), stamps
 * the immutable contact snapshot, and generates a collision-safe tracking
 * code.
 */
export async function createIntakeOrder(input: IntakeOrderInput): Promise<IntakeOrderResult> {
  const person = await findOrCreatePerson(input.person);

  const productIds = input.items.map((item) => item.productId);
  const catalog = await db
    .select({ id: products.id, price: products.price })
    .from(products)
    .where(inArray(products.id, productIds));

  const priceById = new Map(catalog.map((product) => [product.id, parseFloat(product.price)]));
  const invalidProductIds = [...new Set(productIds)].filter((id) => !priceById.has(id));
  if (invalidProductIds.length > 0) {
    throw new Error(`Invalid product IDs: ${invalidProductIds.join(', ')}`);
  }

  const total = input.items
    .reduce((sum, item) => sum + priceById.get(item.productId)! * item.quantity, 0)
    .toFixed(2);

  const isDelivery = input.orderType === ORDER_TYPE.DELIVERY;

  for (let attempt = 0; attempt < MAX_TRACKING_ATTEMPTS; attempt += 1) {
    const trackingCode = generateTrackingCode();
    try {
      const created = await db.transaction(async (tx) => {
        const [row] = await tx
          .insert(orders)
          .values({
            userId: person.id,
            total,
            orderType: input.orderType,
            paymentMethod: input.paymentMethod,
            contactName: person.name,
            contactPhone: person.phoneNumber ?? '',
            deliveryAddress: isDelivery ? (input.deliveryAddress?.trim() ?? '') : '',
            deliveryNotes: isDelivery ? (input.deliveryNotes?.trim() ?? '') : '',
            trackingCode,
          })
          .returning({
            id: orders.id,
            total: orders.total,
            orderType: orders.orderType,
            paymentMethod: orders.paymentMethod,
          });

        await tx.insert(orderStatusHistory).values({
          orderId: row.id,
          status: ORDER_STATUS.PENDING,
        });

        await tx.insert(orderItem).values(
          input.items.map(({ productId, quantity }) => ({
            orderId: row.id,
            productId,
            quantity,
          }))
        );

        return row;
      });

      return {
        id: created.id,
        userId: person.id,
        total: created.total,
        status: ORDER_STATUS.PENDING,
        orderType: created.orderType,
        paymentMethod: created.paymentMethod,
        trackingCode,
      };
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }

  console.error(`Tracking code allocation collided after ${MAX_TRACKING_ATTEMPTS} attempts`);
  throw new Error('Could not allocate a tracking code');
}
