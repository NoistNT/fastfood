'use client';

import type { OrderWithProductsView } from '@/modules/orders/types';

import { useTranslations } from 'next-intl';

import { DataTable } from '@/modules/core/components/data-table';
import { createColumns } from '@/modules/dashboard/components/columns';
import { exportToCSV } from '@/lib/utils';

interface Props {
  orders: OrderWithProductsView[];
  emptyMessage: string;
}

export default function OrdersTable({ orders }: Props) {
  const tTable = useTranslations('Common.table');

  const handleExportCSV = () => {
    exportToCSV(orders as unknown as Record<string, unknown>[], 'orders.csv');
  };

  return (
    <div className="w-full">
      <DataTable
        columns={createColumns(tTable)}
        data={orders}
        searchColumn="order.status"
        onExportCSV={handleExportCSV}
      />
    </div>
  );
}
