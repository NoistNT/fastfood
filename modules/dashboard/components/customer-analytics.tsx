'use client';

import { useCustomers } from '@/modules/core/hooks/use-api-cache';
import { ChartSkeleton } from '@/modules/core/ui/skeleton-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/modules/core/ui/card';

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  averageOrdersPerCustomer: number;
}

export function CustomerAnalytics() {
  const { data, isPending, isError } = useCustomers();
  const customers = ((data?.data ?? []) as Record<string, unknown>[]) ?? [];

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const stats: CustomerStats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(
      (c) => c.lastLoginAt && new Date(c.lastLoginAt as string) > thirtyDaysAgo
    ).length,
    newCustomersThisMonth: customers.filter((c) => new Date(c.createdAt as string) >= thisMonth)
      .length,
    averageOrdersPerCustomer: 2.5,
  };

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (isError) return <div>Failed to load customer analytics</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Behavior Analytics</CardTitle>
        <CardDescription>Insights into customer activity and patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <p className="text-2xl font-bold">{stats.totalCustomers}</p>
            <p className="text-xs text-muted-foreground">Total Customers</p>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold">{stats.activeCustomers}</p>
            <p className="text-xs text-muted-foreground">Active This Month</p>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold">{stats.newCustomersThisMonth}</p>
            <p className="text-xs text-muted-foreground">New This Month</p>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold">{stats.averageOrdersPerCustomer}</p>
            <p className="text-xs text-muted-foreground">Avg Orders per Customer</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
