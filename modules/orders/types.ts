import type { Order, OrderStatusHistory, Product, NewOrder, NewOrderItem } from '@/types/db';
export type { Order, OrderStatusHistory, Product, NewOrder, NewOrderItem };

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
} as const;

// View model for a product in an order context
export interface OrderProductView {
  id: Product['id'];
  name: Product['name'];
  quantity: number;
  subtotal: string;
}

// View model for an order
export interface OrderView extends Order {
  statusHistory: OrderStatusHistory[];
}

// View model for an order with its items (products)
export interface OrderWithProductsView {
  order: OrderView;
  items: OrderProductView[];
}

// Type for the status of an order
export type OrderStatus = keyof typeof ORDER_STATUS;
export type OrderNextStatus = OrderStatus | undefined;

// Type for the dashboard, which might have some extra properties
export type DashboardOrderView = OrderWithProductsView;

// Type for the shopping cart
export interface CartItem {
  productId: number;
  name: string;
  price: string;
  quantity: number;
}

// Types for creating new orders
export interface NewOrderRequestItem {
  productId: NewOrderItem['productId'];
  quantity: NewOrderItem['quantity'];
}
export interface NewOrderRequest extends Omit<
  NewOrder,
  'id' | 'status' | 'createdAt' | 'updatedAt'
> {
  items: NewOrderRequestItem[];
}
