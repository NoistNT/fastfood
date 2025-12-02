import type {
  products,
  orders,
  orderItem,
  orderStatusHistory,
  users,
  ingredients,
  productIngredients,
} from '@/db/schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// Products
export type Product = InferSelectModel<typeof products>;
export type NewProduct = InferInsertModel<typeof products>;

// Orders
export type Order = InferSelectModel<typeof orders>;
export type NewOrder = InferInsertModel<typeof orders>;

// Order Items
export type OrderItem = InferSelectModel<typeof orderItem>;
export type NewOrderItem = InferInsertModel<typeof orderItem>;

// Order Status History
export type OrderStatusHistory = InferSelectModel<typeof orderStatusHistory>;
export type NewOrderStatusHistory = InferInsertModel<typeof orderStatusHistory>;

// Users
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

// Ingredients
export type Ingredient = InferSelectModel<typeof ingredients>;
export type NewIngredient = InferInsertModel<typeof ingredients>;

// Product Ingredients
export type ProductIngredient = InferSelectModel<typeof productIngredients>;
export type NewProductIngredient = InferInsertModel<typeof productIngredients>;
