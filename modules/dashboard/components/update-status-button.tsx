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
  const t = useTranslations('Features.dashboard.table.row');
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
          className="w-full md:w-1/2"
          disabled={isChangingStatus}
          type="button"
          variant="destructive-soft"
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
