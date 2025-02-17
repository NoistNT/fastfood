export interface FindManyResponse {
  id: string;
  total: string;
  status: string;
  createdAt: Date;
  orderItems: {
    quantity: number;
    product: {
      name: string;
      price: string;
    };
  }[];
}

export interface Item {
  productId: number;
  name: string;
  price: string;
  quantity: number;
}

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
} as const;

export type OrderStatus = keyof typeof ORDER_STATUS;

export type NewOrderItem = Pick<Item, 'productId' | 'quantity'>;

export interface StatusHistory {
  status: OrderStatus;
  createdAt: Date;
}

export interface NewOrder {
  userId: string;
  items: NewOrderItem[];
  total: string;
  statusHistory: StatusHistory[];
}

export type Order = Omit<FindManyResponse, 'orderItems'> & {
  statusHistory: StatusHistory[];
};

export interface OrderItem {
  name: string;
  quantity: number;
  subtotal: string;
}

export interface OrderWithItems {
  order: Order;
  items: OrderItem[];
}

export interface DashboardOrderWithItems extends OrderWithItems {
  order: Order & StatusHistory;
}
