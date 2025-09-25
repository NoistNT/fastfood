'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';

import type { DashboardOrderWithItems } from '@/modules/orders/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/modules/core/ui/table';
import { OrdersRow } from '@/modules/orders/components/orders-row';
import DashboardSkeleton from '@/modules/dashboard/components/dashboard-skeleton';
import DatePicker from '@/modules/dashboard/components/date-picker';

export default function OrdersDashboard({
  orders,
  totalSales,
}: {
  orders: DashboardOrderWithItems[];
  totalSales: number;
}) {
  const t = useTranslations('Dashboard');
  const tHeader = useTranslations('Dashboard.table.header');
  const searchParams = useSearchParams();
  const router = useRouter();

  const date = new Date(searchParams.get('date') || new Date());

  const formattedTotalSales = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalSales);

  const handleDateChange = (date: Date | undefined) => {
    if (date) router.push(`/dashboard?date=${date.toISOString()}`);
    else router.push('/dashboard');
  };

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-1 flex-col py-8 px-1.5">
      <div className="flex items-center justify-between mb-4 md:mb-5">
        <h1 className="text-lg md:text-xl font-medium text-primary tracking-tighter">
          {t('title')}
        </h1>
        <div className="flex items-center gap-6">
          <h2 className="text-base md:text-lg text-muted-foreground tracking-tighter">
            {date && `${t('totalSales')}: ${formattedTotalSales}`}
          </h2>
          <DatePicker
            date={date}
            setDate={handleDateChange}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-700">
        <Table className="w-full">
          <TableHeader className="sticky top-0 bg-gradient-to-r from-pink-100 to-violet-200 dark:from-indigo-950 dark:to-purple-950 tracking-tight">
            <TableRow>
              <TableHead className="w-1/5">{tHeader('status')}</TableHead>
              <TableHead className="w-1/5">{tHeader('total')}</TableHead>
              <TableHead className="w-1/5">{tHeader('time')}</TableHead>
              <TableHead className="w-1/5">{tHeader('date')}</TableHead>
              <TableHead className="w-1/5">{tHeader('details')}</TableHead>
            </TableRow>
          </TableHeader>
          {orders ? (
            orders.length > 0 ? (
              <TableBody>
                {orders.map((dashboardOrderWithItems) => (
                  <OrdersRow
                    key={dashboardOrderWithItems.order.id}
                    orderWithItems={dashboardOrderWithItems}
                  />
                ))}
              </TableBody>
            ) : (
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-base text-muted-foreground"
                  >
                    {t('table.empty')}
                  </TableCell>
                </TableRow>
              </TableBody>
            )
          ) : (
            <DashboardSkeleton />
          )}
        </Table>
      </div>
    </div>
  );
}
