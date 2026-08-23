import { TableSkeleton } from '@/modules/core/ui/skeleton-components';

export default function NewOrderLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
    >
      <TableSkeleton
        rows={8}
        columns={4}
      />
    </div>
  );
}
