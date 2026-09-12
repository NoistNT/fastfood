import type { ProductWithIngredients } from '@/modules/products/types';

import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ChevronLeft } from 'lucide-react';

import { Button } from '@/modules/core/ui/button';
import { PlaceholderImage } from '@/modules/core/ui/placeholder-image';
import { CardFooter } from '@/modules/products/components/card-footer';

interface Props {
  product: ProductWithIngredients;
}

export default async function DetailCard({
  product: { id, name, description, imageUrl, price, available, ingredients },
}: Props) {
  const t = await getTranslations('ProductDetail');

  return (
    <section
      className="relative mx-auto max-w-lg rounded-3xl border-2 border-border"
      aria-labelledby={`product-${id}-name`}
    >
      <Button
        asChild
        variant="secondary"
        size="icon"
        className="absolute left-4 top-4 z-10 border bg-background/80 backdrop-blur-sm"
      >
        <Link
          href="/products"
          aria-label={t('backToMenu')}
        >
          <ChevronLeft />
        </Link>
      </Button>
      {imageUrl ? (
        <Image
          alt={name}
          className="aspect-square w-full rounded-b-sm rounded-t-3xl object-cover"
          height={540}
          src={imageUrl}
          width={540}
          sizes="(max-width: 560px) 100vw, 512px"
          priority
        />
      ) : (
        <PlaceholderImage
          className="aspect-square w-full rounded-b-sm rounded-t-3xl object-cover"
          width={540}
          height={540}
        />
      )}
      <div className="h-1 w-full bg-muted" />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <h2
            id={`product-${id}-name`}
            className="text-2xl font-bold min-w-0"
          >
            {name}
          </h2>
          <p
            className="text-xl font-semibold text-foreground"
            aria-label={`Price: $${price}`}
          >
            ${price}
          </p>
        </div>
        <p className="px-1 text-muted-foreground">{description}</p>
        {ingredients && ingredients.length > 0 && (
          <div className="border-t border-border pt-4">
            <h3 className="mb-2 ml-2 text-lg font-semibold">{t('ingredients')}</h3>
            <ul className="mx-auto flex max-w-md flex-wrap items-center justify-center gap-2 py-0.5 text-center">
              {ingredients.map((ingredient) => (
                <li
                  key={ingredient}
                  className="mx-4 w-auto rounded-md border-2 border-border px-4 py-0.5 text-sm hover:bg-accent"
                >
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>
        )}
        <CardFooter
          productId={id}
          available={available}
          name={name}
          price={price}
        />
      </div>
    </section>
  );
}
