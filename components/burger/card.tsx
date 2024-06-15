import type { Burger } from '@/lib/types'

import Image from 'next/image'

export default function Card({
  name,
  description,
  imgAlt,
  imgSrc,
  isVegetarian,
  isVegan,
  price
}: Burger) {
  return (
    <article className="h-full max-w-md rounded-xl border-2 border-neutral-400 dark:border-neutral-700 dark:bg-black">
      <Image
        alt={imgAlt}
        className="rounded-t-xl"
        height={480}
        src={imgSrc}
        width={480}
      />
      <div className="h-1 w-full bg-neutral-400 dark:bg-neutral-600" />
      <div className="mx-4 mt-4">
        <div className="mb-4 flex items-center justify-between px-2">
          <h2 className="text-2xl font-bold">{name}</h2>
          <p className="text-xl font-semibold text-neutral-600 dark:text-neutral-300">
            {' '}
            ${price}
          </p>
        </div>
        <div className="mb-4 h-0.5 w-full bg-neutral-400 dark:bg-neutral-700" />
        <p className="mb-5 min-h-16 px-4 text-neutral-500/85 dark:text-neutral-400/85">
          {description}
        </p>
        <div className="mb-2 h-0.5 w-full bg-neutral-400 dark:bg-neutral-700" />
        <ul className="mx-auto my-3 flex items-center justify-around text-center text-muted-foreground">
          <p className="text-center font-semibold">
            Vegetarian:
            {!isVegetarian ? (
              <span className="text-green-600"> Yes</span>
            ) : (
              <span className="text-red-400"> No</span>
            )}
          </p>
          <p className="text-center font-semibold">
            Vegan:
            {isVegan ? (
              <span className="text-green-600"> Yes</span>
            ) : (
              <span className="text-red-400"> No</span>
            )}
          </p>
        </ul>
      </div>
    </article>
  )
}
