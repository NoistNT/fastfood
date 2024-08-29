export interface Item {
  id: number
  name: string
  price: number
  quantity: number
}

export const ORDER_STATUS = {
  PENDING: 'pendiente',
  PREPARING: 'preparando',
  SHIPPED: 'enviado',
  DELIVERED: 'entregado'
} as const

export type OrderStatus = keyof typeof ORDER_STATUS

export interface Order {
  id: number
  createdAt: Date
  items: Item[]
  total: number
  status: OrderStatus
}
