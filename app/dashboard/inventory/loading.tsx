import { TableSkeleton } from '@/modules/core/ui/skeleton-components';

export default function InventoryLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading inventory"
    >
      <TableSkeleton
        rows={8}
        columns={5}
      />
    </div>
  );
}
