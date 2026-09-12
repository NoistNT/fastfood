import type { CartItem, CheckoutDetails } from '@/modules/orders/types';

export const toFixed = (value: string) => parseFloat(value).toFixed(2);

export const calculateTotal = (items: CartItem[]) => {
  return items
    .reduce((acc, { price, quantity }) => acc + parseFloat(price) * quantity, 0)
    .toFixed(2);
};

export type SubmitOrderPayload = { items: CartItem[]; total: string } & CheckoutDetails;

// Minimal catalog snapshot for cart reconciliation (subset of GET /api/products).
export interface CatalogProductSnapshot {
  id: number;
  name: string;
  price: string;
  available: boolean;
}

export interface ReconciledCart {
  items: CartItem[];
  removedCount: number;
}

// Display-truthfulness for the persisted cart: sync name/price from the
// catalog and drop items that vanished or went unavailable. Totals stay
// server-authoritative at submit regardless (computeOrderTotal).
export const reconcileCartItems = (
  items: CartItem[],
  catalog: CatalogProductSnapshot[]
): ReconciledCart => {
  const byId = new Map(catalog.map((product) => [product.id, product]));
  const next: CartItem[] = [];
  let removedCount = 0;
  for (const item of items) {
    const product = byId.get(item.productId);
    if (!product?.available) {
      removedCount += 1;
      continue;
    }
    next.push({ ...item, name: product.name, price: product.price });
  }
  return { items: next, removedCount };
};
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
