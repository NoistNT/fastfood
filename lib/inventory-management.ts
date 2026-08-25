import { eq, sql } from 'drizzle-orm';

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

/**
 * Deducts the ingredients of a placed order from stock and reports any
 * shortfalls. Each ingredient deduction is one atomic statement (see
 * `deductStock`), so concurrent orders can never double-spend the same
 * units and stock never goes negative. Movements are recorded only for
 * stock that was actually removed; shortages are reported as shortfalls
 * instead of being silently clamped at zero.
 */
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
  } catch {
    console.error('Order inventory deduction failed');
    throw new Error('Inventory deduction failed');
  }
}

/**
 * Deducts stock and records the ledger movement as ONE atomic statement:
 * a data-modifying CTE feeds the conditional UPDATE's output straight into
 * the movement INSERT, so a decrement can never commit without its ledger
 * entry — neon-http has no interactive transactions, but a single statement
 * is inherently atomic on Postgres. Zero affected rows means the on-hand
 * stock was already below the requested amount; no row is inserted then.
 */
async function deductStock(
  ingredientId: number,
  quantity: number,
  type: 'in' | 'out' | 'adjustment' | 'order',
  reason: string,
  referenceId: string | null
): Promise<InventoryShortfall | null> {
  try {
    const result = await db.execute(sql`
      WITH deducted AS (
        UPDATE ${inventory}
        SET quantity = quantity - ${quantity}, last_updated = now()
        WHERE ${inventory.ingredientId} = ${ingredientId}
          AND ${inventory.quantity} >= ${quantity}
        RETURNING id
      )
      INSERT INTO ${inventoryMovements} (inventory_id, type, quantity, reason, reference_id)
      SELECT id, ${type}, ${-quantity}, ${reason}, ${referenceId} FROM deducted
      RETURNING id
    `);

    if (result.rows.length === 0) {
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

    return null;
  } catch {
    console.error('Ingredient stock deduction failed', { ingredientId });
    throw new Error('Inventory stock deduction failed');
  }
}
