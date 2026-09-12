import { TableSkeleton } from '@/modules/core/ui/skeleton-components';

export default function CustomersLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading customers"
    >
      <TableSkeleton
        rows={8}
        columns={5}
      />
    </div>
  );
}
