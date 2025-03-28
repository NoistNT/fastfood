import { useMemo, useState } from 'react';

import { toTitleCase } from '@/lib/utils';
import { toast } from '@/modules/core/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/modules/core/ui/dialog';
import { UpdateStatusButton } from '@/modules/dashboard/components/update-status-button';
import { updateStatus } from '@/modules/orders/actions/actions';
import { canTransition } from '@/modules/orders/helpers';
import { ORDER_STATUS, type OrderItem, type OrderStatus } from '@/modules/orders/types';

interface Props {
  id: string;
  items: Pick<OrderItem, 'name' | 'quantity'>[];
  currentStatus: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    createdAt: Date;
  }[];
  onStatusUpdate: (newStatus: OrderStatus) => void;
  children: React.ReactNode;
}

export function OrderDetailsDialog({
  id,
  items,
  currentStatus,
  statusHistory,
  onStatusUpdate,
  children,
}: Props) {
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
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="tracking-normal"
        onKeyDown={(e) => {
          if (e.key === 'Escape' && isChangingStatus) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="mx-auto lg:pt-1.5 tracking-tighter">Order Details</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 p-2 lg:px-4">
          <div>
            <h3 className="mb-4 font-medium tracking-tighter">Items</h3>
            <ul className="w-full space-y-2">
              {items.map(({ name, quantity }) => (
                <li
                  key={name}
                  className="flex justify-between rounded-md text-xs bg-neutral-100 p-2 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  <span className="text-xs text-muted-foreground font-medium">{name}</span>
                  <span className="font-medium">x {quantity}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-medium tracking-tighter">Status History</h3>
            <div className="relative">
              <div className="absolute left-4 h-full w-0.5 bg-neutral-200 dark:bg-neutral-700" />
              <ul className="w-full space-y-2 text-xs">
                {[...statusHistory]
                  .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
                  .map(({ status, createdAt }) => (
                    <li
                      key={`${status}-${createdAt.getTime()}`}
                      className="relative pl-8 transition-all"
                    >
                      <div className="absolute left-0 top-0 h-2 w-2 rounded-full bg-current transition-all" />
                      <div className="flex justify-between rounded-md bg-neutral-50 p-2 transition-all hover:bg-neutral-100 dark:bg-neutral-800/50 dark:hover:bg-neutral-800">
                        <span className="font-medium">{toTitleCase(status)}</span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {createdAt.toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
        <UpdateStatusButton
          currentStatus={currentStatus}
          handleUpdateStatus={handleUpdateStatus}
          isChangingStatus={isChangingStatus}
          nextStatus={nextStatus as OrderStatus}
        />
      </DialogContent>
    </Dialog>
  );
}
