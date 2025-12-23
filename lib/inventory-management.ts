import { eq } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { inventory, productIngredients, inventoryMovements, orderItem } from '@/db/schema';

// Deduct inventory when an order is placed
export async function deductInventoryForOrder(orderId: string): Promise<void> {
  try {
    // Get all order items for this order
    const orderItems = await db
      .select({
        productId: orderItem.productId,
        quantity: orderItem.quantity,
      })
      .from(orderItem)
      .where(eq(orderItem.orderId, orderId));

    // Process each order item
    for (const item of orderItems) {
      // Get ingredients for this product
      const productIngredientsList = await db
        .select({
          ingredientId: productIngredients.ingredientId,
        })
        .from(productIngredients)
        .where(eq(productIngredients.productId, item.productId));

      // Deduct inventory for each ingredient (1 unit per ingredient per product)
      for (const productIngredient of productIngredientsList) {
        await adjustInventory(
          productIngredient.ingredientId,
          -item.quantity, // negative for deduction
          'order',
          `Order ${orderId}`,
          orderId
        );
      }
    }
  } catch (error) {
    console.error('Error deducting inventory for order:', orderId, error);
    throw error;
  }
}

// Generic inventory adjustment function
export async function adjustInventory(
  ingredientId: number,
  quantityChange: number, // positive for addition, negative for deduction
  type: 'in' | 'out' | 'adjustment' | 'order',
  reason: string,
  referenceId?: string
): Promise<void> {
  try {
    // Get current inventory
    const currentInventory = await db
      .select()
      .from(inventory)
      .where(eq(inventory.ingredientId, ingredientId))
      .limit(1);

    if (currentInventory.length === 0) {
      throw new Error(`No inventory found for ingredient ${ingredientId}`);
    }

    const inventoryItem = currentInventory[0];
    const newQuantity = Math.max(0, inventoryItem.quantity + quantityChange);

    // Update inventory
    await db
      .update(inventory)
      .set({
        quantity: newQuantity,
        lastUpdated: new Date(),
      })
      .where(eq(inventory.id, inventoryItem.id));

    // Record movement
    await db.insert(inventoryMovements).values({
      inventoryId: inventoryItem.id,
      type,
      quantity: quantityChange,
      reason,
      referenceId,
    });
  } catch (error) {
    console.error(
      'Error adjusting inventory:',
      { ingredientId, quantityChange, type, reason },
      error
    );
    throw error;
  }
}

// Check if order can be fulfilled with current inventory
export async function validateOrderInventory(orderId: string): Promise<boolean> {
  try {
    // Get all order items
    const orderItems = await db
      .select({
        productId: orderItem.productId,
        quantity: orderItem.quantity,
      })
      .from(orderItem)
      .where(eq(orderItem.orderId, orderId));

    // Check inventory for each required ingredient
    for (const item of orderItems) {
      const ingredientsNeeded = await db
        .select({
          ingredientId: productIngredients.ingredientId,
        })
        .from(productIngredients)
        .where(eq(productIngredients.productId, item.productId));

      for (const ingredient of ingredientsNeeded) {
        const inventoryData = await db
          .select({ quantity: inventory.quantity })
          .from(inventory)
          .where(eq(inventory.ingredientId, ingredient.ingredientId))
          .limit(1);

        const availableQuantity = inventoryData.length > 0 ? inventoryData[0].quantity : 0;
        const requiredQuantity = item.quantity; // 1 unit per ingredient per product

        if (availableQuantity < requiredQuantity) {
          return false; // Insufficient inventory
        }
      }
    }

    return true; // All inventory checks passed
  } catch (error) {
    console.error('Error validating order inventory:', orderId, error);
    return false; // Fail safe - don't allow order if we can't check inventory
  }
}
