import type { OrderWithProductsView } from '@/modules/orders/types';

import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Suspense } from 'react';
import { Plus } from 'lucide-react';

import DashboardSkeleton from '@/modules/dashboard/components/dashboard-skeleton';
import DatePickerClient from '@/modules/dashboard/components/date-picker-client';
import OrdersTable from '@/modules/dashboard/components/orders-table';
import TotalSales from '@/modules/dashboard/components/total-sales';
import TotalSalesSkeleton from '@/modules/dashboard/components/total-sales-skeleton';
import { Button } from '@/modules/core/ui/button';

interface Props {
  date: Date;
  orders: OrderWithProductsView[];
  totalPages: number;
}

export default async function OrdersDashboard({ date, orders }: Props) {
  const emptyMessage = await getTranslations('Features.dashboard');

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex items-center justify-between mb-4 md:mb-5">
        <h1 className="text-lg md:text-xl font-medium tracking-tighter">{emptyMessage('title')}</h1>
        <div className="flex items-center gap-6">
          <Suspense fallback={<TotalSalesSkeleton />}>
            <TotalSales date={date} />
          </Suspense>
          <DatePickerClient initialDate={date.toISOString()} />
          <Button
            asChild
            size="sm"
          >
            <Link href="/dashboard/orders/new">
              <Plus className="mr-1 h-4 w-4" />
              {emptyMessage('newOrder')}
            </Link>
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card px-2 py-0">
        <Suspense fallback={<DashboardSkeleton />}>
          <OrdersTable
            orders={orders}
            emptyMessage={emptyMessage.toString()}
          />
        </Suspense>
      </div>
    </div>
  );
}
