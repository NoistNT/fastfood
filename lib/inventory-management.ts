import { and, eq, gte, sql } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { inventory, productIngredients, inventoryMovements, orderItem } from '@/db/schema';

export interface InventoryShortfall {
  ingredientId: number;
  requested: number;
  available: number;
}

export interface DeductInventoryResult {
  shortfalls: InventoryShortfall[];
}

// Deduct inventory when an order is placed. Each decrement is one atomic
// conditional UPDATE (`quantity >= qty`), so concurrent orders can never
// double-spend the same units and stock never goes negative. Movements are
// recorded only for stock that was actually removed; shortages are reported
// as shortfalls instead of being silently clamped at zero.
export async function deductInventoryForOrder(orderId: string): Promise<DeductInventoryResult> {
  try {
    const orderItems = await db
      .select({
        productId: orderItem.productId,
        quantity: orderItem.quantity,
      })
      .from(orderItem)
      .where(eq(orderItem.orderId, orderId));

    const shortfalls: InventoryShortfall[] = [];

    for (const item of orderItems) {
      // Get ingredients for this product
      const productIngredientsList = await db
        .select({
          ingredientId: productIngredients.ingredientId,
        })
        .from(productIngredients)
        .where(eq(productIngredients.productId, item.productId));

      // Deduct inventory for each ingredient (1 unit per ingredient per product)
      for (const { ingredientId } of productIngredientsList) {
        const shortfall = await deductStock(
          ingredientId,
          item.quantity,
          'order',
          `Order ${orderId}`,
          orderId
        );
        if (shortfall) shortfalls.push(shortfall);
      }
    }

    return { shortfalls };
  } catch (error) {
    console.error('Error deducting inventory for order:', orderId, error);
    throw error;
  }
}

async function deductStock(
  ingredientId: number,
  quantity: number,
  type: 'in' | 'out' | 'adjustment' | 'order',
  reason: string,
  referenceId?: string
): Promise<InventoryShortfall | null> {
  try {
    // Atomic conditional decrement — zero affected rows means the on-hand
    // stock was already below the requested amount.
    const deducted = await db
      .update(inventory)
      .set({ quantity: sql`${inventory.quantity} - ${quantity}`, lastUpdated: new Date() })
      .where(and(eq(inventory.ingredientId, ingredientId), gte(inventory.quantity, quantity)))
      .returning({ id: inventory.id });

    if (deducted.length === 0) {
      const current = await db
        .select({ quantity: inventory.quantity })
        .from(inventory)
        .where(eq(inventory.ingredientId, ingredientId))
        .limit(1);
      const available = current[0]?.quantity ?? 0;
      console.warn(
        `Insufficient stock for ingredient ${ingredientId}: requested ${quantity}, available ${available}`
      );
      return { ingredientId, requested: quantity, available };
    }

    // Record movement only after a successful decrement.
    await db.insert(inventoryMovements).values({
      inventoryId: deducted[0].id,
      type,
      quantity: -quantity,
      reason,
      referenceId,
    });
    return null;
  } catch (error) {
    console.error('Error deducting stock:', { ingredientId, quantity, type, reason }, error);
    throw error;
  }
}
