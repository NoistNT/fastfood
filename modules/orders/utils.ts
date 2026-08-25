import type { CartItem, CheckoutDetails } from '@/modules/orders/types';

export const toFixed = (value: string) => parseFloat(value).toFixed(2);

export const calculateTotal = (items: CartItem[]) => {
  return items
    .reduce((acc, { price, quantity }) => acc + parseFloat(price) * quantity, 0)
    .toFixed(2);
};

export type SubmitOrderPayload = { items: CartItem[]; total: string } & CheckoutDetails;

export const submitOrder = async (
  { items, total, ...checkout }: SubmitOrderPayload,
  clearOrder: () => void
) => {
  // Call the order API endpoint instead of directly calling server functions
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, total, ...checkout }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message ?? 'Failed to submit order');
  }

  const result = await response.json();
  clearOrder();
  return result.data;
};
