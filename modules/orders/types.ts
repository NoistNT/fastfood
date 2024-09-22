export interface Item {
  id: number
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

export type NewOrderItem = Pick<Item, 'id' | 'quantity'>

export interface NewOrder {
  items: NewOrderItem[]
  total: number
}
