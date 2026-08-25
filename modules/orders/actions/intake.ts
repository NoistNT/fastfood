import { db } from '@/db/drizzle';
import { orderItem, orderStatusHistory, orders } from '@/db/schema';
import { isUniqueViolation } from '@/lib/db-errors';
import { generateTrackingCode } from '@/lib/tracking-code';
import { findOrCreatePerson } from '@/modules/users/persons';
import { computeOrderTotal } from '@/modules/orders/pricing';
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
  const total = await computeOrderTotal(input.items);

  const isDelivery = input.orderType === ORDER_TYPE.DELIVERY;

  for (let attempt = 0; attempt < MAX_TRACKING_ATTEMPTS; attempt += 1) {
    const trackingCode = generateTrackingCode();
    // neon-http has no interactive transactions; db.batch() is the atomic
    // unit — all three statements succeed together or none do. The order id
    // is pre-generated so dependents can be built in the same batch.
    const orderId = crypto.randomUUID();
    try {
      await db.batch([
        db.insert(orders).values({
          id: orderId,
          userId: person.id,
          total,
          orderType: input.orderType,
          paymentMethod: input.paymentMethod,
          contactName: person.name,
          contactPhone: person.phoneNumber ?? '',
          deliveryAddress: isDelivery ? (input.deliveryAddress?.trim() ?? '') : '',
          deliveryNotes: isDelivery ? (input.deliveryNotes?.trim() ?? '') : '',
          trackingCode,
        }),
        db.insert(orderStatusHistory).values({
          orderId,
          status: ORDER_STATUS.PENDING,
        }),
        db.insert(orderItem).values(
          input.items.map(({ productId, quantity }) => ({
            orderId,
            productId,
            quantity,
          }))
        ),
      ]);

      return {
        id: orderId,
        userId: person.id,
        total,
        status: ORDER_STATUS.PENDING,
        orderType: input.orderType,
        paymentMethod: input.paymentMethod,
        trackingCode,
      };
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }

  console.error(`Tracking code allocation collided after ${MAX_TRACKING_ATTEMPTS} attempts`);
  throw new Error('Could not allocate a tracking code');
}
