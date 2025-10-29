import { Skeleton } from '@/modules/core/ui/skeleton';
import { Table, TableHead, TableHeader, TableRow } from '@/modules/core/ui/table';
import DashboardSkeleton from '@/modules/dashboard/components/dashboard-skeleton';

export default function OrdersDashboardSkeleton() {
  return (
    <div className="mx-auto flex h-full max-w-5xl flex-1 flex-col py-8 px-1.5">
      <div className="flex items-center justify-between mb-4 md:mb-5">
        <Skeleton className="h-8 w-36" />
        <div className="flex items-center gap-6">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-40" />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-primary-foreground">
        <Table className="w-full">
          <TableHeader className="sticky top-0 bg-white dark:bg-black tracking-tight">
            <TableRow>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableHead
                  key={i}
                  className="w-1/5"
                >
                  <Skeleton className="h-5 w-16" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <DashboardSkeleton />
        </Table>
      </div>
    </div>
  );
}
