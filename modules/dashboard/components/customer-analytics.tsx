'use client';

import { useEffect, useState } from 'react';

import { ChartSkeleton } from '@/modules/core/ui/skeleton-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/modules/core/ui/card';

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  averageOrdersPerCustomer: number;
}

export function CustomerAnalytics() {
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch customers data
        const response = await fetch('/api/customers');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            const customers = result.data ?? [];
            const now = new Date();
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const totalCustomers = customers.length;
            const activeCustomers = customers.filter(
              (c: Record<string, unknown>) =>
                c.lastLoginAt &&
                new Date(c.lastLoginAt as string) >
                  new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            ).length;
            const newCustomersThisMonth = customers.filter(
              (c: Record<string, unknown>) => new Date(c.createdAt as string) >= thisMonth
            ).length;

            // For average orders, we'd need order data per customer
            // For now, placeholder
            const averageOrdersPerCustomer = 2.5;

            setStats({
              totalCustomers,
              activeCustomers,
              newCustomersThisMonth,
              averageOrdersPerCustomer,
            });
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to fetch customer stats:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
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

  if (!stats) {
    return <div>Failed to load customer analytics</div>;
  }

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
