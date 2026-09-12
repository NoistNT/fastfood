import type { NewOrderRequestItem } from '@/modules/orders/types';

import { inArray } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { products } from '@/db/schema';

// Single source of truth for order totals across checkout and staff intake:
// amounts derive from catalog prices only, never from client input.
export async function computeOrderTotal(items: NewOrderRequestItem[]): Promise<string> {
  const productIds = items.map((item) => item.productId);
  const catalog = await db
    .select({ id: products.id, price: products.price })
    .from(products)
    .where(inArray(products.id, productIds));

  const priceById = new Map(catalog.map((product) => [product.id, parseFloat(product.price)]));
  const invalidProductIds = [...new Set(productIds)].filter((id) => !priceById.has(id));
  if (invalidProductIds.length > 0) {
    throw new Error(`Invalid product IDs: ${invalidProductIds.join(', ')}`);
  }

  return items
    .reduce((sum, item) => sum + priceById.get(item.productId)! * item.quantity, 0)
    .toFixed(2);
}
