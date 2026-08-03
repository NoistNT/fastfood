'use client';

import { format } from 'date-fns';
import Link from 'next/link';

import { TableSkeleton } from '@/modules/core/ui/skeleton-components';
import { useDashboardSummary } from '@/modules/core/hooks/use-api-cache';

interface RecentOrder {
  id: string;
  total: number;
  status: string;
  createdAt: string;
}

export function RecentOrders() {
  const { data, isPending, isError } = useDashboardSummary();
  const orders = (data?.data as { recentOrders?: RecentOrder[] } | undefined)?.recentOrders ?? [];

  if (isPending) {
    return (
      <TableSkeleton
        rows={5}
        columns={3}
      />
    );
  }

  if (isError || orders.length === 0)
    return <div className="text-muted-foreground">No recent orders</div>;

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="flex items-center justify-between"
        >
          <div className="space-y-1">
            <Link
              href={`/dashboard/orders/${order.id}`}
              className="text-sm font-medium hover:underline"
            >
              Order #{order.id}
            </Link>
            <p className="text-xs text-muted-foreground">
              {format(new Date(order.createdAt), 'MMM dd, yyyy')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">${order.total.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground capitalize">{order.status}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
