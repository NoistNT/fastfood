import { relations } from 'drizzle-orm'
import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  serial,
  text
} from 'drizzle-orm/pg-core'

export const burgers = pgTable('burgers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: doublePrecision('price').notNull(),
  imgSrc: text('img_src').notNull(),
  imgAlt: text('img_alt').notNull(),
  ingredientIds: integer('ingredient_ids').notNull().array(),
  isVegetarian: boolean('is_vegetarian').notNull().default(false),
  isVegan: boolean('is_vegan').notNull().default(false),
  isAvailable: boolean('is_available').notNull().default(true)
})

export const burgerRelations = relations(burgers, ({ many }) => ({
  orders: many(orders),
  orderItems: many(orderItem)
}))

export const ingredients = pgTable('ingredients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  price: doublePrecision('price').notNull(),
  isVegetarian: boolean('is_vegetarian').notNull().default(false),
  isVegan: boolean('is_vegan').notNull().default(false),
  isAvailable: boolean('is_available').notNull().default(true)
})

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  totalAmount: doublePrecision('total_amount').notNull(),
  orderItemIds: integer('order_item_ids').notNull().array(),
  createdAt: text('created_at').notNull()
})

export const ordersRelations = relations(orders, ({ many }) => ({
  orderItems: many(orderItem)
}))

export const orderItem = pgTable('order_item', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  burgerId: integer('burger_id')
    .notNull()
    .references(() => burgers.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull()
})

export const orderItemsRelations = relations(orderItem, ({ one }) => ({
  order: one(orders, {
    fields: [orderItem.orderId],
    references: [orders.id]
  }),
  burger: one(burgers, {
    fields: [orderItem.burgerId],
    references: [burgers.id]
  })
}))
