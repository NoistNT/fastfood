'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/modules/core/ui/button';
import { TableCell, TableRow } from '@/modules/core/ui/table';
import { OrderDetailsDialog } from '@/modules/orders/components/order-details-dialog';
import type { DashboardOrderWithItems, OrderStatus, StatusHistory } from '@/modules/orders/types';

interface OrderItemRowProps {
  orderWithItems: DashboardOrderWithItems;
}

export function OrdersRow({
  orderWithItems: {
    order: { id, status, total, createdAt, statusHistory },
    items,
  },
}: OrderItemRowProps) {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(status);
  const [statusTransitions, setStatusTransitions] = useState<StatusHistory[]>(
    statusHistory?.map(({ status, createdAt }) => ({
      status,
      createdAt: new Date(createdAt),
    })) || []
  );
  const t = useTranslations('Dashboard.table.row');

  const handleStatusUpdate = (newStatus: OrderStatus) => {
    setCurrentStatus(newStatus);
    setStatusTransitions((prev) => [...prev, { status: newStatus, createdAt: new Date() }]);
  };

  return (
    <TableRow className="bg-gradient-to-r from-orange-50/70 to-purple-50 dark:from-purple-950/10 dark:to-violet-950/10 hover:from-orange-100/50 hover:to-purple-100 dark:hover:from-purple-800/20 dark:hover:to-violet-800/20 backdrop-blur-lg">
      <TableCell className="w-1/5">{t(`status.${currentStatus}`)}</TableCell>
      <TableCell className="w-1/5">${total}</TableCell>
      <TableCell className="w-1/5">{createdAt.toLocaleTimeString()}</TableCell>
      <TableCell className="w-1/5">{createdAt.toLocaleDateString()}</TableCell>
      <TableCell className="flex flex-col">
        <OrderDetailsDialog
          currentStatus={currentStatus}
          id={id}
          items={items}
          statusHistory={statusTransitions}
          onStatusUpdate={handleStatusUpdate}
        >
          <Button
            className="bg-gradient-to-r from-rose-100/50 to-violet-100 dark:from-indigo-800 dark:to-purple-800"
            variant="outline"
            size="sm"
            type="button"
          >
            {t('viewDetails')}
          </Button>
        </OrderDetailsDialog>
      </TableCell>
    </TableRow>
  );
}
