'use client'

import type { NewOrder } from '@/modules/orders/types'

import Link from 'next/link'
import { useMemo, useTransition } from 'react'
import { toast } from 'sonner'

import { fixedPrice } from '@/lib/utils'
import { Button } from '@/modules/core/ui/button'
import { create } from '@/modules/orders/actions/actions'
import { OrderTable } from '@/modules/orders/components/order-table'
import { SubmitOrder } from '@/modules/orders/components/submit-order'
import { useOrderStore } from '@/store/use-order'

export default function Order() {
  const {
    items: items,
    incrementQuantity,
    decrementQuantity,
    removeItem,
    clearOrder
  } = useOrderStore()

  const total = useMemo(
    () => items.reduce((acc, { price, quantity }) => acc + price * quantity, 0),
    [items]
  )

  const [isPending, startTransition] = useTransition()

  const handleSubmit = async () => {
    startTransition(async () => {
      const order: NewOrder = {
        items: items.map(({ id, quantity }) => ({ id, quantity })),
        total: fixedPrice(total)
      }

      try {
        await create(order)
        clearOrder()
        toast.success('El pedido ha sido registrado')
      } catch (error) {
        toast.error('No se pudo registrar el pedido. Intente nuevamente')
      }
    })
  }

  if (!items.length) {
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
        items={items}
        removeItem={removeItem}
        total={total}
      />
      <SubmitOrder handleSubmit={handleSubmit} isPending={isPending} />
    </div>
  )
}
