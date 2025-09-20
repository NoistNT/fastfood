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

export const getOrderSchemas = (t: (key: string) => string) => {
  const OrderId = z.uuid(t('invalidId'));

  const CreateItem = z.object({
    orderId: OrderId,
    productId: z.number(),
    quantity: z.number().min(1, t('invalidQuantity')),
  });

  const CreateNewOrder = z.object({
    userId: z.uuid(t('invalidUserId')),
    items: z
      .array(
        z.object({
          productId: z.number(),
          quantity: z.number().min(1, t('invalidQuantity')),
        })
      )
      .nonempty(t('orderNonEmpty')),
    total: z.string().nonempty(t('totalNonEmpty')),
    statusHistory: z
      .array(
        z.object({
          status: z.enum(ORDER_STATUS),
          createdAt: z.date(),
        })
      )
      .nonempty(t('statusNonEmpty')),
  });

  return { OrderId, CreateItem, CreateNewOrder };
};

export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const { data: validatedData, error, success } = schema.safeParse(data);

  if (!success) throw new Error(error.issues[0].message, { cause: error });

  return validatedData;
};
