import { Suspense } from 'react';

import OrdersDashboard from '@/modules/dashboard/components/orders-dashboard';
import { findAll } from '@/modules/orders/actions/actions';
import { getTotalSales } from '@/modules/dashboard/actions/actions';

export default async function Page({ searchParams }: { searchParams: { date: string } }) {
  const date = new Date(searchParams.date || new Date());

  const orders = await findAll(date);
  const { totalSales } = await getTotalSales(date);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrdersDashboard
        orders={orders}
        totalSales={totalSales}
      />
    </Suspense>
  );
}
