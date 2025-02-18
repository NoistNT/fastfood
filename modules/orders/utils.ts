import { create } from '@/modules/orders/actions/actions';
import type { Item, NewOrder } from '@/modules/orders/types';

export const toFixed = (value: string) => parseFloat(value).toFixed(2);

export const calculateTotal = (items: Item[]) => {
  return items
    .reduce((acc, { price, quantity }) => acc + parseFloat(price) * quantity, 0)
    .toString();
};

export const submitOrder = async (
  { items, total, statusHistory }: Omit<NewOrder, 'userId'>,
  clearOrder: () => void
) => {
  await create({ items, total, statusHistory });
  clearOrder();
};
