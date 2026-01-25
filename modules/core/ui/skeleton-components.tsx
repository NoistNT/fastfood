import { cn } from '@/lib/utils';
import { Skeleton } from '@/modules/core/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/modules/core/ui/card';

// Dashboard card skeleton
export function DashboardCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-[60px] mb-1" />
        <Skeleton className="h-3 w-[140px]" />
      </CardContent>
    </Card>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Table header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={`header-${i}`}
            className="h-4 flex-1"
          />
        ))}
      </div>

      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="flex space-x-4"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              className="h-4 flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Chart skeleton
export function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-[120px]" />
      <Skeleton className="h-[200px] w-full rounded-lg" />
    </div>
  );
}

// Product card skeleton
export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-1/4" />
      </div>
    </div>
  );
}

// Form skeleton
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-[80px]" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[90px]" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="h-10 w-[120px]" />
    </div>
  );
}

// Button skeleton
export function ButtonSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn('h-10 w-[100px]', className)} />;
}

// Avatar skeleton
export function AvatarSkeleton() {
  return <Skeleton className="h-10 w-10 rounded-full" />;
}

// List skeleton
export function ListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center space-x-3"
        >
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
