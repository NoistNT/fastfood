import { Skeleton } from '@/modules/core/ui/skeleton';

export default function ProductDetailLoading() {
  return (
    <section className="container mx-auto max-w-2xl space-y-6 px-4 py-8">
      <Skeleton className="h-9 w-32" />
      <div
        className="mx-auto max-w-lg rounded-3xl border-2 border-border"
        role="status"
        aria-busy="true"
      >
        <Skeleton className="aspect-square w-full rounded-b-sm rounded-t-3xl" />
        <div className="space-y-4 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-7 w-20" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-full sm:w-32" />
            <Skeleton className="h-9 w-full sm:w-32" />
          </div>
        </div>
      </div>
    </section>
  );
}
