import { Suspense } from 'react';

import { getTotalSales } from '@/modules/dashboard/actions/actions';
import OrdersDashboard from '@/modules/dashboard/components/orders-dashboard';
import OrdersDashboardSkeleton from '@/modules/dashboard/components/orders-dashboard-skeleton';
import { findAll } from '@/modules/orders/actions/actions';

interface Props {
  searchParams: Promise<{ date: string }>;
}

export default async function Page({ searchParams }: Props) {
  const { date } = await searchParams;
  const formatedDate = new Date(date || new Date());

  const orders = await findAll(formatedDate);
  const { totalSales } = await getTotalSales(formatedDate);

  return (
    <Suspense fallback={<OrdersDashboardSkeleton />}>
      <OrdersDashboard
        orders={orders}
        totalSales={totalSales}
      />
    </Suspense>
  );
}
