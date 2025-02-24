import { useMemo, useState } from 'react';

import { toTitleCase } from '@/lib/utils';
import { toast } from '@/modules/core/hooks/use-toast';
import { TableCell, TableRow } from '@/modules/core/ui/table';
import { updateStatus } from '@/modules/orders/actions/actions';
import { canTransition } from '@/modules/orders/helpers';
import { ORDER_STATUS, type OrderItem, type OrderStatus } from '@/modules/orders/types';

import { UpdateStatusButton } from './update-status-button';

interface Props {
  id: string;
  items: Pick<OrderItem, 'name' | 'quantity'>[];
  currentStatus: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    createdAt: Date;
  }[];
  onStatusUpdate: (newStatus: OrderStatus) => void;
}

export function ExpandableRow({ id, items, currentStatus, statusHistory, onStatusUpdate }: Props) {
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const nextStatus = useMemo(() => {
    return Object.values(ORDER_STATUS).find(
      (status) => status !== currentStatus && canTransition(currentStatus, status)
    );
  }, [currentStatus]);

  const handleUpdateStatus = async () => {
    if (!nextStatus) return;

    try {
      setIsChangingStatus(true);
      await updateStatus(id, nextStatus);
      onStatusUpdate(nextStatus);
    } catch (error) {
      toast({
        title: 'Error updating status',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsChangingStatus(false);
    }
  };

  return (
    <TableRow className="bg-purple-100 hover:bg-gradient-to-r hover:from-pink-100/80 hover:to-violet-200/80 dark:bg-indigo-950/50 dark:hover:from-indigo-950/70 dark:hover:to-purple-950/50 tracking-tight">
      <TableCell colSpan={5}>
        <div className="grid grid-cols-1 gap-6 p-4 lg:grid-cols-2 tracking-tight">
          <div>
            <h3 className="mb-4 font-medium text-foreground">Order Details</h3>
            <ul className="w-full space-y-2">
              {items.map(({ name, quantity }) => (
                <li
                  key={name}
                  className="flex justify-between rounded-md bg-neutral-100 p-1.5 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  <span>{name}</span>
                  <span className="font-medium">x {quantity}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-medium tracking-tight text-foreground">Status History</h3>
            <ul className="w-full space-y-2">
              {[...statusHistory]
                .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
                .map(({ status, createdAt }) => (
                  <li
                    key={`${status}-${createdAt.getTime()}`}
                    className="flex justify-between rounded-md bg-neutral-100 p-1.5 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    <span>{toTitleCase(status)}</span>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      {createdAt.toLocaleString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
        <UpdateStatusButton
          currentStatus={currentStatus}
          handleUpdateStatus={handleUpdateStatus}
          isChangingStatus={isChangingStatus}
          nextStatus={nextStatus as OrderStatus}
        />
      </TableCell>
    </TableRow>
  );
}
