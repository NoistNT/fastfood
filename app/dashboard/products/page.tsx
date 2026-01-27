import { ProductsDashboard } from '@/modules/dashboard/components/products-dashboard';

type ProductWithIngredients = {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  available: boolean;
  ingredients: string[];
  ingredientIds: number[];
};

interface InventoryStatsData {
  totalItems: number;
  lowStockItems: number;
  totalValue: number;
  outOfStockItems: number;
}

interface LowStockAlert {
  id: string;
  ingredientName: string;
  currentStock: number;
  minThreshold: number;
  unit: string;
}

export async function getProducts(): Promise<ProductWithIngredients[]> {
  try {
    // Use direct database query instead of API call
    const { db } = await import('@/db/drizzle');
    const { products, productIngredients, ingredients } = await import('@/db/schema');
    const { eq } = await import('drizzle-orm');

    const productsData = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        imageUrl: products.imageUrl,
        available: products.available,
        ingredients: ingredients.name,
        ingredientId: ingredients.id,
      })
      .from(products)
      .leftJoin(productIngredients, eq(products.id, productIngredients.productId))
      .leftJoin(ingredients, eq(productIngredients.ingredientId, ingredients.id))
      .orderBy(products.name);

    // Group by product
    const productMap = new Map();
    productsData.forEach((item) => {
      if (!productMap.has(item.id)) {
        productMap.set(item.id, {
          ...item,
          ingredients: item.ingredients ? [item.ingredients] : [],
          ingredientIds: item.ingredientId ? [item.ingredientId] : [],
        });
      } else {
        if (item.ingredients) {
          productMap.get(item.id).ingredients.push(item.ingredients);
        }
        if (item.ingredientId) {
          productMap.get(item.id).ingredientIds.push(item.ingredientId);
        }
      }
    });

    return Array.from(productMap.values());
  } catch (_error) {
    // Fallback to empty array if query fails
    return [];
  }
}

export async function getInventoryStats(): Promise<InventoryStatsData> {
  try {
    const { db } = await import('@/db/drizzle');
    const { inventory, ingredients } = await import('@/db/schema');
    const { desc, eq } = await import('drizzle-orm');

    const inventoryItems = await db
      .select({
        id: inventory.id,
        ingredientId: inventory.ingredientId,
        ingredientName: ingredients.name,
        quantity: inventory.quantity,
        minThreshold: inventory.minThreshold,
        unit: inventory.unit,
        lastUpdated: inventory.lastUpdated,
      })
      .from(inventory)
      .innerJoin(ingredients, eq(inventory.ingredientId, ingredients.id))
      .orderBy(desc(inventory.lastUpdated));

    // Calculate stats from inventory data
    const totalItems = inventoryItems.length;
    const lowStockItems = inventoryItems.filter(
      (item) => item.quantity <= item.minThreshold && item.quantity > 0
    ).length;
    const outOfStockItems = inventoryItems.filter((item) => item.quantity === 0).length;

    // Calculate total value (assuming we have pricing data)
    const totalValue = inventoryItems.reduce((sum: number, item) => {
      // TODO: Join with ingredient pricing when available
      return sum + item.quantity * 10; // Mock pricing
    }, 0);

    return {
      totalItems,
      lowStockItems,
      totalValue,
      outOfStockItems,
    };
  } catch (error) {
    console.error('Failed to fetch inventory stats:', error);
    // Return fallback data
    return {
      totalItems: 0,
      lowStockItems: 0,
      totalValue: 0,
      outOfStockItems: 0,
    };
  }
}

export async function getLowStockAlerts(): Promise<LowStockAlert[]> {
  try {
    const { db } = await import('@/db/drizzle');
    const { inventoryAlerts, inventory, ingredients } = await import('@/db/schema');
    const { eq, desc } = await import('drizzle-orm');

    const alerts = await db
      .select({
        id: inventoryAlerts.id,
        ingredientName: ingredients.name,
        currentStock: inventory.quantity,
        minThreshold: inventory.minThreshold,
        unit: inventory.unit,
      })
      .from(inventoryAlerts)
      .innerJoin(inventory, eq(inventoryAlerts.inventoryId, inventory.id))
      .innerJoin(ingredients, eq(inventory.ingredientId, ingredients.id))
      .where(eq(inventoryAlerts.isResolved, false))
      .orderBy(desc(inventoryAlerts.createdAt));

    return alerts;
  } catch (error) {
    console.error('Failed to fetch low stock alerts:', error);
    // Return empty array as fallback
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();
  const inventoryStats = await getInventoryStats();
  const lowStockAlerts = await getLowStockAlerts();

  return (
    <ProductsDashboard
      initialProducts={products}
      inventoryStats={inventoryStats}
      lowStockAlerts={lowStockAlerts}
    />
  );
}
