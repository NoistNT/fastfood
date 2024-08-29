'use client'

import type { Order } from '@/modules/orders/types'

import Link from 'next/link'
import { useMemo } from 'react'

import { Button } from '@/modules/core/ui/button'
import OrderTable from '@/modules/orders/components/order-table'
import { useOrderItemStore } from '@/store/use-order-item'

export default function Order() {
  const { item, incrementQuantity, decrementQuantity } = useOrderItemStore()

  const total = useMemo(
    () => item.reduce((acc, { price, quantity }) => acc + price * quantity, 0),
    [item]
  )

  const submitOrder = () => {
    const order: Order = {
      id: 1,
      createdAt: new Date(),
      items: item.map(({ id, name, price, quantity }) => ({
        id,
        name,
        price,
        quantity
      })),
      total,
      status: 'PENDING'
    }

    console.log(order)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <OrderTable
        decrementQuantity={decrementQuantity}
        incrementQuantity={incrementQuantity}
        items={item}
        total={total}
      />
      <div className="flex justify-end gap-2">
        <Link href="/products">
          <Button variant="outline">Seguir agregando</Button>
        </Link>
        <Button variant="default" onClick={submitOrder}>
          Confirmar pedido
        </Button>
      </div>
    </div>
  )
}
