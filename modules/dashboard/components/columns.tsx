import type { DashboardOrderView, OrderStatus } from '@/modules/orders/types';
import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '@/modules/core/components/data-table-column-header';
import { OrderStatusBadge } from '@/modules/orders/components/order-status-badge';
import { OrderDetailsCell } from '@/modules/dashboard/components/order-details-cell';

export const createColumns = (t: (key: string) => string): ColumnDef<DashboardOrderView>[] => [
  {
    accessorKey: 'order.userName',
    id: 'order.userName',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('columns.customer')}
      />
    ),
    cell: ({ row }) => {
      const userName: string = row.getValue('order.userName');
      return <span>{userName}</span>;
    },
  },
  {
    id: 'order.status',
    accessorKey: 'order.status',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('columns.status')}
      />
    ),
    cell: ({ row }) => {
      const status: OrderStatus = row.getValue('order.status');
      return <OrderStatusBadge status={status} />;
    },
  },
  {
    id: 'order.total',
    accessorKey: 'order.total',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('columns.total')}
      />
    ),
    cell: ({ row }) => {
      const total: string = row.getValue('order.total');
      return <span>${total}</span>;
    },
  },
  {
    accessorKey: 'order.createdAt',
    id: 'order.time',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('columns.time')}
      />
    ),
    cell: ({ row }) => {
      const createdAt: Date = new Date(row.getValue('order.time'));
      return <span>{createdAt.toLocaleTimeString()}</span>;
    },
  },
  {
    accessorKey: 'order.createdAt',
    id: 'order.date',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('columns.date')}
      />
    ),
    cell: ({ row }) => {
      const createdAt: Date = new Date(row.getValue('order.date'));
      const formattedDate = createdAt
        .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
        .replace(/\//g, '-');
      return <span>{formattedDate}</span>;
    },
  },
  {
    accessorKey: 'order.userName',
    id: 'takenBy',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('columns.takenBy')}
      />
    ),
    cell: ({ row }) => {
      const userName: string = row.getValue('order.userName');
      return <span>{userName}</span>;
    },
  },
  {
    id: 'details',
    header: () => null,
    cell: ({ row }) => {
      const orderWithItems = row.original;
      return <OrderDetailsCell orderWithItems={orderWithItems} />;
    },
  },
];
