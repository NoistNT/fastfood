import { useTranslations } from 'next-intl';
import { Fragment } from 'react/jsx-runtime';

import { ConfirmationDialog } from '@/modules/core/ui/confirmation-dialog';
import { OrderStatusBadge } from '@/modules/orders/components/order-status-badge';
import type { OrderStatus } from '@/modules/orders/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: OrderStatus;
  nextStatus: OrderStatus;
  onConfirm: () => void;
  isLoading: boolean;
}

export function StatusUpdateConfirmation({
  open,
  onOpenChange,
  currentStatus,
  nextStatus,
  onConfirm,
  isLoading,
}: Props) {
  const t = useTranslations('Dashboard.details.confirmation');

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      isLoading={isLoading}
      title={t('title')}
      description={
        <Fragment>
          {t('description')} <OrderStatusBadge status={currentStatus} /> {t('to')}{' '}
          <OrderStatusBadge status={nextStatus} />?
        </Fragment>
      }
      cancelText={t('cancel')}
      confirmText={t('confirm')}
    />
  );
}
