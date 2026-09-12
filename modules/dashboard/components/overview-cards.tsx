'use client';

import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/modules/core/ui/card';
import { DashboardCardSkeleton } from '@/modules/core/ui/skeleton-components';
import { useDashboardSummary } from '@/modules/core/hooks/use-api-cache';

interface SummaryData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
}

export function OverviewCards() {
  const { data, isPending, isError } = useDashboardSummary();
  const summary = (data?.data ?? null) as SummaryData | null;

  if (isPending) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <DashboardCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError || !summary) return <div>Failed to load dashboard data</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${(summary.totalRevenue || 0).toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">+20.1% from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalOrders}</div>
          <p className="text-xs text-muted-foreground">+180.1% from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalCustomers}</div>
          <p className="text-xs text-muted-foreground">+19% from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalProducts}</div>
          <p className="text-xs text-muted-foreground">+2 new this month</p>
        </CardContent>
      </Card>
    </div>
  );
}
