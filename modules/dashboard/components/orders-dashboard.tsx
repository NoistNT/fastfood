import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { Table, TableHead, TableHeader, TableRow } from '@/modules/core/ui/table';
import DashboardSkeleton from '@/modules/dashboard/components/dashboard-skeleton';
import DatePickerClient from '@/modules/dashboard/components/date-picker-client';
import OrdersTable from '@/modules/dashboard/components/orders-table';
import TotalSales from '@/modules/dashboard/components/total-sales';
import TotalSalesSkeleton from '@/modules/dashboard/components/total-sales-skeleton';

interface Props {
  date: Date;
}

export default async function OrdersDashboard({ date }: Props) {
  const t = await getTranslations('Dashboard');
  const tHeader = await getTranslations('Dashboard.table.header');

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-1 flex-col py-8 px-1.5">
      <div className="flex items-center justify-between mb-4 md:mb-5">
        <h1 className="text-lg md:text-xl font-medium tracking-tighter">{t('title')}</h1>
        <div className="flex items-center gap-6">
          <Suspense fallback={<TotalSalesSkeleton />}>
            <TotalSales date={date} />
          </Suspense>
          <DatePickerClient date={date} />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-primary-foreground">
        <Table className="w-full">
          <TableHeader className="sticky top-0 bg-white dark:bg-black tracking-tight">
            <TableRow>
              <TableHead className="w-1/5 text-primary">{tHeader('status')}</TableHead>
              <TableHead className="w-1/5 text-primary">{tHeader('total')}</TableHead>
              <TableHead className="w-1/5 text-primary">{tHeader('time')}</TableHead>
              <TableHead className="w-1/5 text-primary">{tHeader('date')}</TableHead>
              <TableHead className="w-1/5 text-primary">{tHeader('details')}</TableHead>
            </TableRow>
          </TableHeader>
          <Suspense fallback={<DashboardSkeleton />}>
            <OrdersTable date={date} />
          </Suspense>
        </Table>
      </div>
    </div>
  );
}
