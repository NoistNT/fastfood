'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

import type { DashboardOrderWithItems } from '@/modules/orders/types';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/modules/core/ui/table';
import { findAll } from '@/modules/orders/actions/actions';
import { OrdersRow } from '@/modules/orders/components/orders-row';
import DashboardSkeleton from '@/modules/dashboard/components/dashboard-skeleton';
import DatePicker from '@/modules/dashboard/components/date-picker';

export default function OrdersDashboard() {
  const [dashboardOrdersWithItems, setDashboardOrdersWithItems] = useState<
    DashboardOrderWithItems[]
  >([]);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('Dashboard.table.header');
  const title = useTranslations('Dashboard');

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      const orders = await findAll(date);
      setDashboardOrdersWithItems(orders);
      setLoading(false);
    }

    fetchOrders();
  }, [date]);

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-1 flex-col py-8 px-1.5">
      <div className="flex items-center justify-between mb-4 md:mb-5">
        <h1 className="text-lg md:text-xl font-medium text-primary tracking-tighter">
          {title('title')}
        </h1>
        <DatePicker
          date={date}
          setDate={setDate}
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-700">
        <Table className="w-full">
          <TableHeader className="sticky top-0 bg-gradient-to-r from-pink-100 to-violet-200 dark:from-indigo-950 dark:to-purple-950 tracking-tight">
            <TableRow>
              <TableHead className="w-1/5">{t('status')}</TableHead>
              <TableHead className="w-1/5">{t('total')}</TableHead>
              <TableHead className="w-1/5">{t('time')}</TableHead>
              <TableHead className="w-1/5">{t('date')}</TableHead>
              <TableHead className="w-1/5">{t('details')}</TableHead>
            </TableRow>
          </TableHeader>
          {loading ? (
            <DashboardSkeleton />
          ) : (
            <TableBody>
              {dashboardOrdersWithItems.map((dashboardOrderWithItems) => (
                <OrdersRow
                  key={dashboardOrderWithItems.order.id}
                  orderWithItems={dashboardOrderWithItems}
                />
              ))}
            </TableBody>
          )}
        </Table>
      </div>
    </div>
  );
}
