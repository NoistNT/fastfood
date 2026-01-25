import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/modules/core/ui/card';
import { RevenueChart } from '@/modules/dashboard/components/revenue-chart';
import { OrdersStatusChart } from '@/modules/dashboard/components/orders-status-chart';
import { OverviewCards } from '@/modules/dashboard/components/overview-cards';
import { CustomerAnalytics } from '@/modules/dashboard/components/customer-analytics';
import { RevenueForecast } from '@/modules/dashboard/components/revenue-forecast';

export default async function ReportsPage() {
  const t = await getTranslations('Features.dashboard.reports');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <Suspense fallback={<div>Loading metrics...</div>}>
        <OverviewCards />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t('revenueChart.title')}</CardTitle>
            <CardDescription>{t('revenueChart.description')}</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Suspense fallback={<div>Loading chart...</div>}>
              <RevenueChart />
            </Suspense>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t('statusChart.title')}</CardTitle>
            <CardDescription>{t('statusChart.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading chart...</div>}>
              <OrdersStatusChart />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* Additional report sections will be added here */}
      <Suspense fallback={<div>Loading customer analytics...</div>}>
        <CustomerAnalytics />
      </Suspense>

      <Suspense fallback={<div>Loading revenue forecast...</div>}>
        <RevenueForecast />
      </Suspense>

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>System performance and KPIs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <p className="text-2xl font-bold">197</p>
              <p className="text-xs text-muted-foreground">Tests Passing</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold">95%</p>
              <p className="text-xs text-muted-foreground">Lighthouse Score</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold">&lt;1s</p>
              <p className="text-xs text-muted-foreground">Avg Response Time</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold">99.9%</p>
              <p className="text-xs text-muted-foreground">Uptime</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
