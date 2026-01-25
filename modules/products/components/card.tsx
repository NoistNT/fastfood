'use client';

import type { Product } from '@/types/db';

import Image from 'next/image';

import { PlaceholderImage } from '@/modules/core/ui/placeholder-image';
import { CardFooter } from '@/modules/products/components/card-footer';

interface Props {
  product: Product;
}

export default function Card({
  product: { id, imageUrl, name, description, price, available },
}: Props) {
  return (
    <article
      className="flex h-full bg-card w-96 flex-col rounded-xl p-3 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 sm:h-40 sm:w-full sm:max-w-xl sm:flex-row ring-1 ring-border"
      aria-labelledby={`product-${id}-name`}
      data-testid="product-card"
    >
      {imageUrl ? (
        <Image
          alt={name}
          className="w-full rounded-xl object-cover sm:aspect-square sm:w-40"
          height={130}
          src={imageUrl}
          width={130}
          role="img"
        />
      ) : (
        <PlaceholderImage
          className="w-full rounded-xl object-cover sm:aspect-square sm:w-40"
          width={130}
          height={130}
        />
      )}
      <div className="mt-3 flex flex-col justify-between p-2 sm:pb-0 sm:pl-4">
        <header className="flex justify-between">
          <h2
            id={`product-${id}-name`}
            className="text-2xl tracking-tighter font-semibold"
          >
            {name}
          </h2>
          <p
            className="text-2xl tracking-tighter font-bold"
            aria-label={`Price: $${price}`}
          >
            ${price}
          </p>
        </header>
        <p
          className="mt-3 max-h-20 max-w-sm truncate p-1 text-sm text-muted-foreground sm:mt-0 sm:min-w-96"
          aria-label={`Description: ${description}`}
        >
          {description}
        </p>
        <CardFooter
          available={available}
          name={name}
          price={price}
          productId={id}
        />
      </div>
    </article>
  );
}
