import { Suspense, lazy } from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/modules/core/ui/card';
import {
  DashboardCardSkeleton,
  ChartSkeleton,
  TableSkeleton,
} from '@/modules/core/ui/skeleton-components';

// Lazy load heavy components
const OverviewCards = lazy(() =>
  import('@/modules/dashboard/components/overview-cards').then((mod) => ({
    default: mod.OverviewCards,
  }))
);
const RevenueChart = lazy(() =>
  import('@/modules/dashboard/components/revenue-chart').then((mod) => ({
    default: mod.RevenueChart,
  }))
);
const OrdersStatusChart = lazy(() =>
  import('@/modules/dashboard/components/orders-status-chart').then((mod) => ({
    default: mod.OrdersStatusChart,
  }))
);
const RecentOrders = lazy(() =>
  import('@/modules/dashboard/components/recent-orders').then((mod) => ({
    default: mod.RecentOrders,
  }))
);

export default async function DashboardOverview() {
  const t = await getTranslations('Features.dashboard.overview');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <DashboardCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <OverviewCards />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t('revenueChart.title')}</CardTitle>
            <CardDescription>{t('revenueChart.description')}</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Suspense fallback={<ChartSkeleton />}>
              <RevenueChart />
            </Suspense>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t('recentOrders.title')}</CardTitle>
            <CardDescription>{t('recentOrders.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <TableSkeleton
                  rows={5}
                  columns={3}
                />
              }
            >
              <RecentOrders />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('statusChart.title')}</CardTitle>
            <CardDescription>{t('statusChart.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartSkeleton />}>
              <OrdersStatusChart />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('quickActions.title')}</CardTitle>
            <CardDescription>{t('quickActions.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link
              href="/dashboard/orders"
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <div>
                <h3 className="font-medium">{t('quickActions.orders.title')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('quickActions.orders.description')}
                </p>
              </div>
              <span className="text-2xl">📦</span>
            </Link>
            <Link
              href="/dashboard/customers"
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <div>
                <h3 className="font-medium">{t('quickActions.customers.title')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('quickActions.customers.description')}
                </p>
              </div>
              <span className="text-2xl">👥</span>
            </Link>
            <Link
              href="/dashboard/products"
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <div>
                <h3 className="font-medium">{t('quickActions.products.title')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('quickActions.products.description')}
                </p>
              </div>
              <span className="text-2xl">🍔</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
