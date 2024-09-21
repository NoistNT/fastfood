'use client'

import type { Item } from '@/modules/orders/types'
import type { ProductGeneralView } from '@/modules/products/types'

import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'

import { Button } from '@/modules/core/ui/button'
import { useOrderItemStore } from '@/store/use-order-item'

export default function Card({
  id,
  name,
  description,
  imgAlt,
  imgSrc,
  price,
  isAvailable
}: ProductGeneralView) {
  const { addItem } = useOrderItemStore()
  const item = { id, name, price, quantity: 1, subtotal: price }

  const handleAddItem = (item: Item) => {
    if (!isAvailable) return

    addItem(item)
    toast.success(`${name} añadido al pedido`)
  }

  return (
    <article className="flex h-full w-96 flex-col rounded-xl bg-white p-3 shadow-md transition-shadow hover:shadow-lg dark:bg-black dark:shadow-neutral-900 sm:h-40 sm:w-full sm:max-w-xl sm:flex-row">
      <Image
        alt={imgAlt}
        className="w-full rounded-xl object-cover sm:aspect-square sm:w-40"
        height={130}
        src={imgSrc}
        width={130}
      />
      <div className="mt-3 flex flex-col justify-between p-2 sm:pb-0 sm:pl-4">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold">{name}</h2>
          <p className="text-2xl font-extrabold">${price}</p>
        </div>
        <p className="mt-3 max-h-20 max-w-sm truncate p-1 text-sm text-muted-foreground sm:mt-0 sm:min-w-96">
          {description}
        </p>
        <div className="mt-4 flex w-full justify-center gap-4 sm:mt-0 sm:justify-end sm:gap-2">
          <Link className="w-full sm:w-32" href={`/products/${id}`}>
            <Button
              className="w-full transition-colors dark:hover:border-neutral-700 sm:w-32"
              type="button"
              variant="outline"
            >
              Más info
            </Button>
          </Link>
          <Button
            className={
              isAvailable
                ? 'w-full transition-colors dark:bg-neutral-50 sm:w-32'
                : 'w-full cursor-not-allowed bg-rose-100 font-semibold text-red-500 hover:bg-rose-100 hover:text-red-500 dark:border-neutral-700 dark:bg-rose-900 dark:text-red-200 dark:hover:bg-rose-900 sm:w-32'
            }
            type="button"
            variant={isAvailable ? 'default' : 'outline'}
            onClick={() => handleAddItem(item)}
          >
            {isAvailable ? 'Añadir al pedido' : 'Sin Stock'}
          </Button>
        </div>
      </div>
    </article>
  )
}
