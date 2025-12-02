import type { OrderNextStatus, OrderStatus } from '@/modules/orders/types';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/modules/core/ui/button';
import { StatusUpdateConfirmation } from '@/modules/dashboard/components/status-update-confirmation';

interface Props {
  nextStatus: OrderNextStatus;
  currentStatus: OrderStatus;
  isChangingStatus: boolean;
  handleUpdateStatus: () => void;
}

export function UpdateStatusButton({
  nextStatus,
  currentStatus,
  isChangingStatus,
  handleUpdateStatus,
}: Props) {
  const t = useTranslations('Dashboard.table.row');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!nextStatus) return null;

  const onConfirm = () => {
    handleUpdateStatus();
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="mt-4 flex justify-center">
        <Button
          className="w-full md:w-1/2 bg-rose-100 dark:bg-violet-900 hover:bg-rose-200 dark:hover:bg-violet-800 border border-gray-300 dark:border-gray-600"
          disabled={isChangingStatus}
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
        >
          {t(`status.${currentStatus}`)} → {t(`status.${nextStatus}`)}
        </Button>
      </div>

      <StatusUpdateConfirmation
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        currentStatus={currentStatus}
        nextStatus={nextStatus}
        onConfirm={onConfirm}
        isLoading={isChangingStatus}
      />
    </>
  );
}
