import { TableSkeleton } from '@/modules/core/ui/skeleton-components';

export default function ProductsLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading products"
    >
      <TableSkeleton
        rows={8}
        columns={5}
      />
    </div>
  );
}
