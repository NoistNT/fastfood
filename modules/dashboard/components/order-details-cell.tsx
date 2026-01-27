'use client';

import { FileTextIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/modules/core/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/modules/core/ui/tooltip';
import { OrderDetailsDialog } from '@/modules/orders/components/order-details-dialog';
import {
  type DashboardOrderView,
  type OrderStatus,
  type OrderStatusHistory,
} from '@/modules/orders/types';

interface OrderDetailsCellProps {
  orderWithItems: DashboardOrderView;
}

export function OrderDetailsCell({ orderWithItems }: OrderDetailsCellProps) {
  const t = useTranslations('Features.dashboard.table.row');
  const [optimisticStatus, setOptimisticStatus] = useState<OrderStatus | null>(null);
  const [statusTransitions, setStatusTransitions] = useState<
    Pick<OrderStatusHistory, 'status' | 'createdAt'>[]
  >(
    orderWithItems.order.statusHistory?.map(({ status, createdAt }) => ({
      status,
      createdAt: new Date(createdAt),
    })) || []
  );

  // Use optimistic status if available, otherwise use prop status
  const currentStatus = optimisticStatus ?? orderWithItems.order.status;

  const handleStatusUpdate = (newStatus: OrderStatus) => {
    setOptimisticStatus(newStatus);
    setStatusTransitions((prev) => [...prev, { status: newStatus, createdAt: new Date() }]);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <OrderDetailsDialog
            currentStatus={currentStatus}
            id={orderWithItems.order.id}
            items={orderWithItems.items}
            statusHistory={statusTransitions}
            onStatusUpdate={handleStatusUpdate}
          >
            <Button
              className="size-8 group text-primary outline-1 outline-neutral-300 dark:outline-muted"
              variant="ghost"
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
  );
}
