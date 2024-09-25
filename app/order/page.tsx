'use client'

import { useMemo, useTransition } from 'react'

import { toast } from '@/modules/core/hooks/use-toast'
import { ToastAction } from '@/modules/core/ui/toast'
import { EmptyOrder } from '@/modules/orders/components/empty-order'
import { OrderTable } from '@/modules/orders/components/order-table'
import { SubmitOrder } from '@/modules/orders/components/submit-order'
import { calculateTotal, submitOrder } from '@/modules/orders/utils'
import { useOrderStore } from '@/store/use-order'

export default function Page() {
  const {
    items,
    incrementQuantity,
    decrementQuantity,
    removeItem,
    clearOrder
  } = useOrderStore()

  const total = useMemo(() => calculateTotal(items), [items])

  const [isPending, startTransition] = useTransition()

  const handleSubmit = async () => {
    startTransition(async () => {
      try {
        await submitOrder({ items, total }, clearOrder)
        toast({
          title: '¡Listo!',
          description: 'El pedido se registro correctamente.'
        })
      } catch (error) {
        toast({
          title: 'Algo salió mal.',
          description: 'No se pudo registrar el pedido. Intente nuevamente.',
          action: (
            <ToastAction altText="Reintentar" onClick={handleSubmit}>
              Reintentar
            </ToastAction>
          )
        })
      }
    })
  }

  if (!items.length) return <EmptyOrder />

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
