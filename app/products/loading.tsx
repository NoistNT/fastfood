import { Skeleton } from '@/modules/core/ui/skeleton';

function ProductCardSkeleton() {
  return (
    <div className="flex h-full w-96 flex-col rounded-xl p-3 ring-1 ring-border sm:h-40 sm:w-full sm:max-w-xl sm:flex-row">
      <Skeleton className="h-40 w-full rounded-xl sm:aspect-square sm:h-auto sm:w-40" />
      <div className="mt-3 flex flex-1 flex-col justify-between p-2 sm:pb-0 sm:pl-4">
        <div className="flex justify-between">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-7 w-16" />
        </div>
        <Skeleton className="h-4 w-full max-w-sm" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-full sm:w-32" />
          <Skeleton className="h-9 w-full sm:w-32" />
        </div>
      </div>
    </div>
  );
}

export default function ProductsLoading() {
  return (
    <section
      className="flex"
      role="status"
      aria-busy="true"
      aria-label="Loading products"
    >
      <ul className="container grid gap-4 py-8 xl:grid-cols-2 xl:gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <li
            key={i}
            className="mx-auto"
          >
            <ProductCardSkeleton />
          </li>
        ))}
      </ul>
    </section>
  );
}
