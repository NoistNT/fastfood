'use client';

import { FileTextIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/modules/core/ui/button';
import { TableCell, TableRow } from '@/modules/core/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/modules/core/ui/tooltip';
import { OrderDetailsDialog } from '@/modules/orders/components/order-details-dialog';
import { OrderStatusBadge } from '@/modules/orders/components/order-status-badge';
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

  const formattedDate = new Date(createdAt)
    .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .replace(/\//g, '-');

  const handleStatusUpdate = (newStatus: OrderStatus) => {
    setCurrentStatus(newStatus);
    setStatusTransitions((prev) => [...prev, { status: newStatus, createdAt: new Date() }]);
  };

  return (
    <TableRow className="dark:hover:bg-muted/50 hover:bg-neutral-200 text-muted-foreground font-medium">
      <TableCell className="w-1/4">
        <OrderStatusBadge status={currentStatus} />
      </TableCell>
      <TableCell className="w-1/4">${total}</TableCell>
      <TableCell className="w-1/4">{createdAt.toLocaleTimeString()}</TableCell>
      <TableCell className="w-1/4">{formattedDate}</TableCell>
      <TableCell className="flex flex-col">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <OrderDetailsDialog
                currentStatus={currentStatus}
                id={id}
                items={items}
                statusHistory={statusTransitions}
                onStatusUpdate={handleStatusUpdate}
              >
                <Button
                  className="size-8 group bg-neutral-100 dark:bg-neutral-800 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 text-primary outline-1 dark:outline-muted-foreground"
                  variant="outline"
                  size="icon"
                  type="button"
                >
                  <FileTextIcon className="size-4 text-muted-foreground" />
                </Button>
              </OrderDetailsDialog>
            </TooltipTrigger>
            <TooltipContent>{t('viewDetails')}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
    </TableRow>
  );
}
