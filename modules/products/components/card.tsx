'use client';

import Image from 'next/image';

import { CardFooter } from '@/modules/products/components/card-footer';
import type { ProductGeneralView } from '@/modules/products/types';

interface Props {
  product: ProductGeneralView;
}

export default function Card({
  product: { id, imgAlt, imgSrc, name, description, price, isAvailable },
}: Props) {
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
        <CardFooter
          isAvailable={isAvailable}
          name={name}
          price={price}
          productId={id}
        />
      </div>
    </article>
  );
}
