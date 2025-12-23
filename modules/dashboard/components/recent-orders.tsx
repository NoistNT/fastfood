'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';

import { TableSkeleton } from '@/modules/core/ui/skeleton-components';

interface RecentOrder {
  id: string;
  total: number;
  status: string;
  createdAt: string;
}

export function RecentOrders() {
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  const fetchRecentOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/summary');
      if (!response.ok) {
        throw new Error('Failed to fetch recent orders');
      }
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message ?? 'Failed to fetch recent orders');
      }

      setOrders(result.data.recentOrders ?? []);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <TableSkeleton
        rows={5}
        columns={3}
      />
    );
  }

  if (orders.length === 0) {
    return <div className="text-muted-foreground">No recent orders</div>;
  }

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
