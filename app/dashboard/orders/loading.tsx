import { TableSkeleton } from '@/modules/core/ui/skeleton-components';

export default function OrdersLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading orders"
    >
      <TableSkeleton
        rows={8}
        columns={5}
      />
    </div>
  );
}
