'use client'

import type { Order } from '@/modules/orders/types'

import Link from 'next/link'
import { useMemo } from 'react'
import { toast } from 'sonner'

import { Button } from '@/modules/core/ui/button'
import OrderTable from '@/modules/orders/components/order-table'
import { useOrderItemStore } from '@/store/use-order-item'

export default function Order() {
  const { item, incrementQuantity, decrementQuantity, removeItem } =
    useOrderItemStore()

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
    toast.success('Order placed!')
  }

  if (item.length === 0) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-y-10 py-60">
        <p className="text-center text-secondary-foreground">
          No hay productos en el pedido
        </p>
        <Link className="mx-auto" href="/products">
          <Button variant="default">Añadir productos</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <OrderTable
        decrementQuantity={decrementQuantity}
        incrementQuantity={incrementQuantity}
        items={item}
        removeItem={removeItem}
        total={total}
      />
      <div className="flex items-center justify-end gap-2 py-1.5">
        <Link href="/products">
          <Button
            className="border border-neutral-300 hover:border-neutral-400 dark:h-10 dark:border-neutral-700 dark:hover:border-neutral-600"
            type="button"
            variant="secondary"
          >
            Seguir agregando
          </Button>
        </Link>
        <Button type="button" variant="default" onClick={submitOrder}>
          Confirmar pedido
        </Button>
      </div>
    </div>
  )
}
