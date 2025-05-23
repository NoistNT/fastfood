import { z } from 'zod';

import { ORDER_STATUS, type OrderStatus } from '@/modules/orders/types';

const statusTransitions: Record<OrderStatus, OrderStatus[]> = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.PROCESSING],
  [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPED],
  [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]: [],
};

export const canTransition = (currentStatus: OrderStatus, newStatus: OrderStatus) =>
  statusTransitions[currentStatus].includes(newStatus);

export const isValidStatus = (status: string): status is OrderStatus => {
  return Object.values(ORDER_STATUS).includes(status as OrderStatus);
};

export const OrderId = z.string().uuid('Invalid order ID');

export const CreateItem = z.object({
  orderId: OrderId,
  productId: z.number(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

export const CreateNewOrder = z.object({
  userId: z.string().uuid('Invalid user ID'),
  items: z
    .array(
      z.object({
        productId: z.number(),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
      })
    )
    .nonempty('Order must have at least one item'),
  total: z.string().nonempty('Total must not be empty'),
  statusHistory: z
    .array(
      z.object({
        status: z.nativeEnum(ORDER_STATUS),
        createdAt: z.date(),
      })
    )
    .nonempty('Status history must not be empty'),
});

export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const { data: validatedData, error, success } = schema.safeParse(data);

  if (!success) throw new Error(error.issues[0].message, { cause: error });

  return validatedData;
};
