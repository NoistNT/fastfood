import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { ORDER_STATUS } from '@/modules/orders/types';

export const orderStatusEnum = pgEnum('order_status', [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
]);

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    phoneNumber: text('phone_number'),
    lastLoginAt: timestamp('last_login_at'),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [index('email_idx').on(table.email)]
);

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  userRoles: many(userRoles),
}));

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
});

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
}));

export const userRoles = pgTable('user_roles', {
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  roleId: integer('role_id')
    .notNull()
    .references(() => roles.id, { onDelete: 'cascade' }),
});

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
}));

export const productIngredients = pgTable(
  'product_ingredients',
  {
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    ingredientId: integer('ingredient_id')
      .notNull()
      .references(() => ingredients.id, { onDelete: 'cascade' }),
  },
  (table) => [
    index('product_ingredients_product_id_ingredient_id_index').on(
      table.productId,
      table.ingredientId
    ),
  ]
);

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
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  imageUrl: text('image_url'),
  available: boolean('available').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const productRelations = relations(products, ({ many }) => ({
  orders: many(orders),
  orderItems: many(orderItem),
  ingredients: many(productIngredients),
}));

export const ingredients = pgTable('ingredients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  unit: text('unit').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  isAvailable: boolean('is_available').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const ingredientRelations = relations(ingredients, ({ many, one }) => ({
  productIngredients: many(productIngredients),
  inventory: one(inventory, {
    fields: [ingredients.id],
    references: [inventory.ingredientId],
  }),
}));

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    total: numeric('total', { precision: 10, scale: 2 }).notNull(),
    status: orderStatusEnum('status').notNull().default(ORDER_STATUS.PENDING),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [index('user_id_idx').on(table.userId), index('created_at_idx').on(table.createdAt)]
);

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
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
  status: orderStatusEnum('status').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, {
    fields: [orderStatusHistory.orderId],
    references: [orders.id],
  }),
}));

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
});

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, { fields: [passwordResetTokens.userId], references: [users.id] }),
}));

// Inventory Management System
export const inventory = pgTable(
  'inventory',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ingredientId: integer('ingredient_id')
      .notNull()
      .references(() => ingredients.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull().default(0),
    minThreshold: integer('min_threshold').notNull().default(10),
    unit: text('unit').notNull().default('pieces'), // pieces, kg, liters, etc.
    lastUpdated: timestamp('last_updated').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('inventory_ingredient_id_idx').on(table.ingredientId),
    index('inventory_quantity_idx').on(table.quantity),
  ]
);

export const inventoryRelations = relations(inventory, ({ one, many }) => ({
  ingredient: one(ingredients, {
    fields: [inventory.ingredientId],
    references: [ingredients.id],
  }),
  movements: many(inventoryMovements),
  alerts: many(inventoryAlerts),
}));

export const inventoryMovements = pgTable(
  'inventory_movements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    inventoryId: uuid('inventory_id')
      .notNull()
      .references(() => inventory.id, { onDelete: 'cascade' }),
    type: text('type').notNull(), // 'in', 'out', 'adjustment', 'order'
    quantity: integer('quantity').notNull(), // positive for in, negative for out
    reason: text('reason'), // order_id, manual_adjustment, etc.
    referenceId: text('reference_id'), // order ID, adjustment ID, etc.
    createdAt: timestamp('created_at').notNull().defaultNow(),
    createdBy: uuid('created_by').references(() => users.id),
  },
  (table) => [
    index('inventory_movements_inventory_id_idx').on(table.inventoryId),
    index('inventory_movements_type_idx').on(table.type),
    index('inventory_movements_created_at_idx').on(table.createdAt),
  ]
);

export const inventoryMovementsRelations = relations(inventoryMovements, ({ one }) => ({
  inventory: one(inventory, {
    fields: [inventoryMovements.inventoryId],
    references: [inventory.id],
  }),
  createdByUser: one(users, {
    fields: [inventoryMovements.createdBy],
    references: [users.id],
  }),
}));

// Add inventory alerts table
export const inventoryAlerts = pgTable(
  'inventory_alerts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    inventoryId: uuid('inventory_id')
      .notNull()
      .references(() => inventory.id, { onDelete: 'cascade' }),
    type: text('type').notNull(), // 'low_stock', 'out_of_stock', 'expired'
    message: text('message').notNull(),
    isResolved: boolean('is_resolved').notNull().default(false),
    resolvedAt: timestamp('resolved_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('inventory_alerts_inventory_id_idx').on(table.inventoryId),
    index('inventory_alerts_type_idx').on(table.type),
    index('inventory_alerts_resolved_idx').on(table.isResolved),
  ]
);

export const inventoryAlertsRelations = relations(inventoryAlerts, ({ one }) => ({
  inventory: one(inventory, {
    fields: [inventoryAlerts.inventoryId],
    references: [inventory.id],
  }),
}));
