import type { CartItem, NewOrderRequestItem } from '@/modules/orders/types';

import { create } from '@/modules/orders/actions/actions';

export const toFixed = (value: string) => parseFloat(value).toFixed(2);

export const calculateTotal = (items: CartItem[]) => {
  return items
    .reduce((acc, { price, quantity }) => acc + parseFloat(price) * quantity, 0)
    .toString();
};

export const submitOrder = async (
  { items, total }: { items: CartItem[]; total: string },
  clearOrder: () => void
) => {
  const newOrderItems: NewOrderRequestItem[] = items.map(({ productId, quantity }) => ({
    productId,
    quantity,
  }));
  await create({ items: newOrderItems, total });
  clearOrder();
};
