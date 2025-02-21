'use client';

import { useState } from 'react';

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
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(status);
  const [statusTransitions, setStatusTransitions] = useState<StatusHistory[]>(
    statusHistory?.map(({ status, createdAt }) => ({
      status,
      createdAt: new Date(createdAt),
    })) || []
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStatusUpdate = (newStatus: OrderStatus) => {
    setCurrentStatus(newStatus);
    setStatusTransitions((prev) => [...prev, { status: newStatus, createdAt: new Date() }]);
  };

  return (
    <>
      <TableRow className="bg-neutral-50 font-semibold text-neutral-700 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700">
        <TableCell className="w-1/5">{currentStatus}</TableCell>
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
