import { relations } from 'drizzle-orm';
import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { ORDER_STATUS } from '@/modules/orders/types';

export const productIngredients = pgTable('product_ingredients', {
  productId: integer('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  ingredientId: integer('ingredient_id')
    .notNull()
    .references(() => ingredients.id, { onDelete: 'cascade' }),
});

export const productIngredientsRelations = relations(productIngredients, ({ one }) => ({
  product: one(products, {
    fields: [productIngredients.productId],
    references: [products.id],
  }),
  ingredient: one(ingredients, {
    fields: [productIngredients.ingredientId],
    references: [ingredients.id],
  }),
}));

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: doublePrecision('price').notNull(),
  imgSrc: text('img_src').notNull(),
  imgAlt: text('img_alt').notNull(),
  isVegetarian: boolean('is_vegetarian').notNull().default(false),
  isVegan: boolean('is_vegan').notNull().default(false),
  isAvailable: boolean('is_available').notNull().default(true),
});

export const productRelations = relations(products, ({ many }) => ({
  orders: many(orders),
  orderItems: many(orderItem),
  ingredients: many(productIngredients),
}));

export const ingredients = pgTable('ingredients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  price: doublePrecision('price').notNull(),
  isVegetarian: boolean('is_vegetarian').notNull().default(false),
  isVegan: boolean('is_vegan').notNull().default(false),
  isAvailable: boolean('is_available').notNull().default(true),
});

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  total: doublePrecision('total').notNull(),
  status: varchar('status').notNull().default(ORDER_STATUS.PENDING),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const ordersRelations = relations(orders, ({ many }) => ({
  orderItems: many(orderItem),
  statusHistory: many(orderStatusHistory),
}));

export const orderItem = pgTable('order_item', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull(),
});

export const orderItemsRelations = relations(orderItem, ({ one }) => ({
  order: one(orders, {
    fields: [orderItem.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItem.productId],
    references: [products.id],
  }),
}));

export const orderStatusHistory = pgTable('order_status_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  status: varchar('status').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, {
    fields: [orderStatusHistory.orderId],
    references: [orders.id],
  }),
}));
