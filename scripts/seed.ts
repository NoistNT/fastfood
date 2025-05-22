/* eslint-disable no-console */
import { db } from '@/db/drizzle';
import { ingredients, productIngredients, products, users } from '@/db/schema';
import {
  ingredientsSeed,
  productIngredientsSeed,
  productsSeed,
  usersSeed,
} from '@/scripts/seed-data';

async function createTables() {
  const createTablesQueries = [
    `
    CREATE TABLE IF NOT EXISTS "users" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "name" text NOT NULL,
      "email" text NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS "ingredients" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "price" double precision NOT NULL,
      "is_vegetarian" boolean DEFAULT false NOT NULL,
      "is_vegan" boolean DEFAULT false NOT NULL,
      "is_available" boolean DEFAULT true NOT NULL
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
      "total" double precision NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL,
      "status" varchar DEFAULT 'PENDING' NOT NULL
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
      "description" text NOT NULL,
      "price" double precision NOT NULL,
      "img_src" text NOT NULL,
      "img_alt" text NOT NULL,
      "is_vegetarian" boolean DEFAULT false NOT NULL,
      "is_vegan" boolean DEFAULT false NOT NULL,
      "is_available" boolean DEFAULT true NOT NULL
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS "order_status_history" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "order_id" uuid NOT NULL,
      "status" varchar NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
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
    console.log('Creating tables');
    await createTables();

    console.log('Seeding database');

    console.log('Seeding users');
    await db.insert(users).values(usersSeed).returning();
    console.log('Seeding ingredients');
    const insertedIngredients = await db.insert(ingredients).values(ingredientsSeed).returning();
    console.log('Seeding products');
    const insertedProducts = await db.insert(products).values(productsSeed).returning();

    console.log('Seeding product-ingredients');
    const productIngredientsWithIds = productIngredientsSeed.map((pi) => {
      const productId = insertedProducts.find(
        (p) => p.name === productsSeed[pi.productId - 1].name
      )?.id;
      const ingredientId = insertedIngredients.find(
        (i) => i.name === ingredientsSeed[pi.ingredientId - 1].name
      )?.id;
      if (productId === undefined || ingredientId === undefined) {
        throw new Error('Product or Ingredient not found');
      }
      return { productId, ingredientId };
    });
    await db.insert(productIngredients).values(productIngredientsWithIds);

    console.log('Database seeded!');
  } catch (error) {
    console.error(error);
    throw new Error('Failed to seed database');
  }
}

seedDatabase();
