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
      <TableRow className="bg-neutral-100 font-semibold text-gray-500 hover:bg-white/55 dark:bg-neutral-900 dark:text-gray-300 dark:hover:bg-black/25">
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
