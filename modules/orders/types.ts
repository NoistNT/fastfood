export interface FindManyResponse {
  id: string
  total: number
  status: string
  createdAt: Date
  orderItems: {
    quantity: number
    product: {
      name: string
      price: number
    }
  }[]
}

export interface Item {
  productId: number
  name: string
  price: number
  quantity: number
}

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED'
} as const

export type OrderStatus = keyof typeof ORDER_STATUS

export type NewOrderItem = Pick<Item, 'productId' | 'quantity'>

export interface NewOrder {
  items: NewOrderItem[]
  total: number
}

export type Order = Omit<FindManyResponse, 'orderItems'>

export interface OrderItem {
  name: string
  quantity: number
  subtotal: number
}

export interface OrderWithItems {
  order: Order
  items: OrderItem[]
}
