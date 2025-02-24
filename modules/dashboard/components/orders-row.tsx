'use client';

import { useState } from 'react';

import { toTitleCase } from '@/lib/utils';
import { TableCell, TableRow } from '@/modules/core/ui/table';
import { ExpandButton } from '@/modules/dashboard/components/expand-button';
import { ExpandableRow } from '@/modules/dashboard/components/expandable-row';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(status);
  const [statusTransitions, setStatusTransitions] = useState<StatusHistory[]>(
    statusHistory?.map(({ status, createdAt }) => ({
      status,
      createdAt: new Date(createdAt),
    })) || []
  );

  const handleStatusUpdate = (newStatus: OrderStatus) => {
    setCurrentStatus(newStatus);
    setStatusTransitions((prev) => [...prev, { status: newStatus, createdAt: new Date() }]);
  };

  return (
    <>
      <TableRow className="bg-pink-50/40 hover:bg-gradient-to-r hover:from-pink-100/80 hover:to-violet-200/80 dark:bg-violet-950/10 dark:hover:from-indigo-950/70 dark:hover:to-purple-950/50 tracking-tight">
        <TableCell className="w-1/5">{toTitleCase(currentStatus)}</TableCell>
        <TableCell className="w-1/5">${total}</TableCell>
        <TableCell className="w-1/5">{createdAt.toLocaleTimeString()}</TableCell>
        <TableCell className="w-1/5">{createdAt.toLocaleDateString()}</TableCell>
        <ExpandButton
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />
      </TableRow>
      {isExpanded ? (
        <ExpandableRow
          currentStatus={currentStatus}
          id={id}
          items={items}
          statusHistory={statusTransitions}
          onStatusUpdate={handleStatusUpdate}
        />
      ) : null}
    </>
  );
}
