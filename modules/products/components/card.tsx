'use client'

import type { Burger } from '@/modules/products/types'

import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/modules/core/ui/button'
import { useOrderStore } from '@/store/use-order'

export default function Card({
  id,
  name,
  description,
  imgAlt,
  imgSrc,
  price
}: Burger) {
  const { addItem } = useOrderStore()
  const product = { id, name, price, quantity: 1, subtotal: price }

  return (
    <article className="flex h-full flex-col rounded-xl bg-white p-3 shadow-md dark:bg-black sm:h-40 sm:min-w-[480px] sm:flex-row">
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
        <p className="mt-3 max-h-20 max-w-sm truncate p-1 text-sm text-muted-foreground sm:mt-0">
          {description}
        </p>
        <div className="mt-4 flex w-full justify-center gap-4 sm:mt-0 sm:justify-end sm:gap-2">
          <Link className="w-full sm:w-32" href={`/products/${id}`}>
            <Button className="w-full sm:w-32" type="button" variant="outline">
              Más info
            </Button>
          </Link>
          <Button
            className="w-full sm:w-32"
            type="button"
            variant="default"
            onClick={() => addItem(product)}
          >
            Añadir al pedido
          </Button>
        </div>
      </div>
    </article>
  )
}
