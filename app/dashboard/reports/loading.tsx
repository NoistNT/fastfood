import { TableSkeleton } from '@/modules/core/ui/skeleton-components';

export default function ReportsLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading reports"
    >
      <TableSkeleton
        rows={8}
        columns={4}
      />
    </div>
  );
}
