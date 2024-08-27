'use client'

import Link from 'next/link'

import { fixedPrice } from '@/lib/utils'
import { useOrderStore } from '@/store/use-order'

export default function Order() {
  const { order } = useOrderStore()
  const total = order.reduce((acc, { subtotal }) => acc + subtotal, 0)

  return (
    <div>
      <div>
        <Link href="/products">Back</Link>
      </div>
      <div>
        <pre>{JSON.stringify(order, null, 2)}</pre>
        <h2>Total: ${fixedPrice(total)}</h2>
      </div>
    </div>
  )
}
