import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/modules/core/ui/card';
import { Skeleton } from '@/modules/core/ui/skeleton';
import { InventoryTable } from '@/modules/dashboard/components/inventory-table';
import { InventoryStats } from '@/modules/dashboard/components/inventory-stats';
import { LowStockAlerts } from '@/modules/dashboard/components/low-stock-alerts';

export default async function InventoryPage() {
  const t = await getTranslations('Features.dashboard.inventory');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      {/* Inventory Statistics */}
      <Suspense fallback={<InventoryStatsSkeleton />}>
        <InventoryStats />
      </Suspense>

      {/* Low Stock Alerts */}
      <Suspense fallback={<LowStockAlertsSkeleton />}>
        <LowStockAlerts />
      </Suspense>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('inventoryTable.title')}</CardTitle>
          <CardDescription>{t('inventoryTable.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<InventoryTableSkeleton />}>
            <InventoryTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function InventoryStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function LowStockAlertsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function InventoryTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="border rounded-md">
        <div className="p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
