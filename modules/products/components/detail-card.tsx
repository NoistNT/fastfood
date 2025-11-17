import type { ProductWithIngredients } from '@/modules/products/types';

import Image from 'next/image';

import { cn } from '@/lib/utils';

interface Props {
  product: ProductWithIngredients;
}

export default function DetailCard({
  product: { name, description, imgAlt, imgSrc, price, ingredients, isVegan, isVegetarian },
}: Props) {
  return (
    <section className="max-w-lg rounded-3xl border-2 border-neutral-200 dark:border-neutral-700">
      <Image
        alt={imgAlt}
        className="rounded-b-sm rounded-t-3xl"
        height={540}
        src={imgSrc}
        width={540}
      />
      <div className="h-1 w-full bg-neutral-300 dark:bg-neutral-800" />
      <div className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{name}</h2>
          <p className="mt-0.5 text-xl font-semibold text-neutral-600 dark:text-neutral-300 lg:mr-3">
            ${price}
          </p>
        </div>
        <p className="px-1 text-neutral-500/85 dark:text-neutral-400/85">{description}</p>
        <div className="mt-5 h-0.5 w-full bg-neutral-200 dark:bg-neutral-700" />
        <div className="mt-10">
          <h3 className="mb-2 ml-2 text-lg font-semibold">Ingredients</h3>
          <ul className="mx-auto flex max-w-md flex-wrap items-center justify-center gap-y-2 py-0.5 text-center">
            {ingredients?.map((ingredient) => (
              <li
                key={ingredient}
                className="mx-4 w-auto rounded-md border-2 border-neutral-100 px-4 py-0.5 text-sm hover:bg-primary-foreground dark:border-neutral-900"
              >
                {ingredient}
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-4 mt-10 h-0.5 w-full bg-neutral-200 dark:bg-neutral-700" />
        <h3 className="mb-2 ml-2 text-lg font-semibold">Other Info</h3>
        <ul className="mx-auto flex justify-center py-0.5">
          <li
            className={cn(
              'mx-auto min-w-40 rounded-md border-2 border-neutral-100 px-4 py-0.5 text-center text-sm hover:bg-primary-foreground dark:border-neutral-900',
              !isVegetarian
                ? 'hover:bg-green-50 dark:hover:bg-green-950/60'
                : 'hover:bg-red-50 dark:hover:bg-red-950/60'
            )}
          >
            <p className="flex flex-col text-center">
              Vegetarian
              {!isVegetarian ? (
                <span className="text-green-500">Yes</span>
              ) : (
                <span className="text-red-400"> No</span>
              )}
            </p>
          </li>
          <li
            className={cn(
              'mx-auto min-w-40 rounded-md border-2 border-neutral-100 px-4 py-0.5 text-center text-sm hover:bg-primary-foreground dark:border-neutral-900',
              isVegan
                ? 'hover:border-green-500 hover:bg-green-950/60'
                : 'hover:bg-red-50 dark:hover:bg-red-950/60'
            )}
          >
            <p className="flex flex-col text-center">
              Vegan
              {isVegan ? (
                <span className="text-green-500">Yes</span>
              ) : (
                <span className="text-red-400"> No</span>
              )}
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}
