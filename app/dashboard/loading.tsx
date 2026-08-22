import { DashboardCardSkeleton } from '@/modules/core/ui/skeleton-components';

export default function DashboardLoading() {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <DashboardCardSkeleton key={i} />
      ))}
    </div>
  );
}
