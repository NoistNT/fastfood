import { db } from '@/db/drizzle';
import {
  ingredients,
  inventory,
  inventoryMovements,
  inventoryAlerts,
  orders,
  orderItem,
  orderStatusHistory,
  productIngredients,
  products,
  roles,
  userRoles,
  users,
} from '@/db/schema';
import {
  ingredientsSeed,
  inventorySeed,
  orderItemsSeed,
  ordersSeed,
  productIngredientsSeed,
  productsSeed,
  rolesSeed,
  userRolesSeed,
  usersSeed,
} from '@/scripts/seed-data';
import { ORDER_STATUS } from '@/modules/orders/types';

async function createTables() {
  const createTablesQueries = [
    `
    DO $$ BEGIN
      CREATE TYPE order_status AS ENUM ('${ORDER_STATUS.PENDING}', '${ORDER_STATUS.PROCESSING}', '${ORDER_STATUS.SHIPPED}', '${ORDER_STATUS.DELIVERED}');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    `,
    `
    CREATE TABLE IF NOT EXISTS "users" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "name" text NOT NULL,
      "email" text NOT NULL,
      "password_hash" text NOT NULL,
      "phone_number" text,
      "last_login_at" timestamp,
      "deleted_at" timestamp,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS "roles" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "description" text
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS "user_roles" (
      "user_id" uuid NOT NULL,
      "role_id" integer NOT NULL
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS "ingredients" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "unit" text NOT NULL,
      "price" numeric(10, 2) NOT NULL,
      "is_available" boolean DEFAULT true NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS "order_item" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "order_id" uuid NOT NULL,
      "product_id" integer NOT NULL,
      "quantity" integer NOT NULL
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS "orders" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "user_id" uuid NOT NULL,
      "total" numeric(10, 2) NOT NULL,
      "status" order_status DEFAULT '${ORDER_STATUS.PENDING}' NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS "product_ingredients" (
      "product_id" integer NOT NULL,
      "ingredient_id" integer NOT NULL
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS "products" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "description" text,
      "price" numeric(10, 2) NOT NULL,
      "image_url" text,
      "available" boolean DEFAULT true NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS "inventory" (
      "id" serial PRIMARY KEY,
      "ingredient_id" integer NOT NULL,
      "quantity" numeric(10, 2) DEFAULT 0 NOT NULL,
      "min_threshold" numeric(10, 2) DEFAULT 0 NOT NULL,
      "last_updated" timestamp DEFAULT now() NOT NULL
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS "inventory_movements" (
      "id" serial PRIMARY KEY,
      "inventory_id" integer NOT NULL,
      "type" text NOT NULL CHECK ("type" IN ('in', 'out', 'adjustment', 'order')),
      "quantity" numeric(10, 2) NOT NULL,
      "reason" text NOT NULL,
      "reference_id" text,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS "inventory_alerts" (
      "id" serial PRIMARY KEY,
      "inventory_id" integer NOT NULL,
      "type" text NOT NULL CHECK ("type" IN ('low_stock', 'out_of_stock')),
      "message" text NOT NULL,
      "resolved" boolean DEFAULT false NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "resolved_at" timestamp
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS "order_status_history" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "order_id" uuid NOT NULL,
      "status" order_status NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
    `,
    `
    DO $$ BEGIN
      ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    `,
    `
    DO $$ BEGIN
      ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    `,
    `
    DO $$ BEGIN
      ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    `,
    `
    DO $$ BEGIN
      ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    `,
    `
    DO $$ BEGIN
      ALTER TABLE "order_item" ADD CONSTRAINT "order_item_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    `,
    `
    DO $$ BEGIN
      ALTER TABLE "product_ingredients" ADD CONSTRAINT "product_ingredients_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    `,
    `
    DO $$ BEGIN
      ALTER TABLE "product_ingredients" ADD CONSTRAINT "product_ingredients_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    `,
    `
    DO $$ BEGIN
      ALTER TABLE "inventory" ADD CONSTRAINT "inventory_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    `,
    `
    DO $$ BEGIN
      ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    `,

    `
    DO $$ BEGIN
      ALTER TABLE "inventory_alerts" ADD CONSTRAINT "inventory_alerts_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    `,
    `
    DO $$ BEGIN
      ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    `,
  ];

  for (const query of createTablesQueries) {
    await db.execute(query);
  }
}

async function seedDatabase() {
  try {
    await createTables();

    // Clear existing data first to allow re-seeding
    await db.delete(orderStatusHistory);
    await db.delete(orderItem);
    await db.delete(orders);
    await db.delete(productIngredients);
    await db.delete(products);
    await db.delete(inventory);
    await db.delete(inventoryMovements);
    await db.delete(inventoryAlerts);
    await db.delete(ingredients);
    await db.delete(userRoles);
    await db.delete(users);
    await db.delete(roles);

    const insertedRoles = await db.insert(roles).values(rolesSeed).returning();
    const insertedUsers = await db.insert(users).values(usersSeed).returning();

    const userRolesWithIds = userRolesSeed.map((ur) => {
      const user = insertedUsers.find((u) => u.email === ur.userEmail);
      const role = insertedRoles.find((r) => r.name === ur.roleName);
      if (!user || !role) {
        throw new Error('User or Role not found');
      }
      return { userId: user.id, roleId: role.id };
    });

    await db.insert(userRoles).values(userRolesWithIds);

    const insertedIngredients = await db.insert(ingredients).values(ingredientsSeed).returning();

    // Seed inventory data - map to actual ingredient IDs
    const inventoryWithIds = inventorySeed.map((inv, index) => ({
      ingredientId: insertedIngredients[index]?.id || insertedIngredients[0].id,
      quantity: parseFloat(inv.quantity),
      minThreshold: parseFloat(inv.minThreshold),
    }));
    await db.insert(inventory).values(inventoryWithIds);

    const insertedProducts = await db.insert(products).values(productsSeed).returning();

    // Map productIngredients to actual IDs
    const productIngredientsWithIds = productIngredientsSeed.map((pi) => {
      // Find product by index (assuming productsSeed order matches productIngredientsSeed productId)
      const productIndex = pi.productId - 1; // productId starts from 1
      const ingredientIndex = pi.ingredientId - 1; // ingredientId starts from 1

      const product = insertedProducts[productIndex];
      const ingredient = insertedIngredients[ingredientIndex];

      if (!product || !ingredient) {
        console.error('Product or Ingredient not found:', {
          pi,
          productIndex,
          ingredientIndex,
          product,
          ingredient,
        });
        throw new Error('Product or Ingredient not found');
      }
      return { productId: product.id, ingredientId: ingredient.id };
    });
    await db.insert(productIngredients).values(productIngredientsWithIds);

    const ordersWithUserIds = ordersSeed.map((order) => {
      const user = insertedUsers.find((u) => u.email === order.userEmail);
      if (!user) {
        throw new Error('User not found for order');
      }
      return {
        userId: user.id,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    });

    const insertedOrders = await db.insert(orders).values(ordersWithUserIds).returning();

    const orderItemsWithIds = orderItemsSeed.map((oi) => {
      const order = insertedOrders[oi.orderIndex];
      const product = insertedProducts[oi.productId - 1]; // productId starts from 1
      if (!order || !product) {
        throw new Error('Order or Product not found for order item');
      }
      return {
        orderId: order.id,
        productId: product.id,
        quantity: oi.quantity,
      };
    });

    await db.insert(orderItem).values(orderItemsWithIds);

    // Add additional status history for some orders
    if (insertedOrders.length > 0) {
      const now = Date.now();
      const firstOrder = insertedOrders[0];
      await db.insert(orderStatusHistory).values([
        {
          orderId: firstOrder.id,
          status: ORDER_STATUS.PENDING,
          createdAt: new Date(now + 60 * 60 * 1000), // 1 hour later
        },
        {
          orderId: firstOrder.id,
          status: ORDER_STATUS.PENDING,
          createdAt: new Date(now + 2 * 60 * 60 * 1000), // 2 hours later
        },
        {
          orderId: firstOrder.id,
          status: ORDER_STATUS.PENDING,
          createdAt: new Date(now + 3 * 60 * 60 * 1000), // 3 hours later
        },
      ]);

      if (insertedOrders.length > 1) {
        const secondOrder = insertedOrders[1];
        await db.insert(orderStatusHistory).values([
          {
            orderId: secondOrder.id,
            status: ORDER_STATUS.PENDING,
            createdAt: new Date(now + 30 * 60 * 1000), // 30 mins later
          },
        ]);
      }
    }
  } catch (error) {
    console.error('Seeding error:', error);
    throw new Error('Failed to seed database');
  }
}

seedDatabase();
