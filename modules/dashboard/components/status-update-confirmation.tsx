import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

import { Button } from '@/modules/core/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/modules/core/ui/dialog';
import { OrderStatusBadge } from '@/modules/orders/components/order-status-badge';
import type { OrderStatus } from '@/modules/orders/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: string;
  nextStatus: string;
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
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="tracking-tight">
        <DialogHeader>
          <DialogTitle className="tracking-tighter mb-2">{t('title')}</DialogTitle>
          <DialogDescription className="my-2">
            {t('description')} <OrderStatusBadge status={currentStatus as OrderStatus} /> {t('to')}{' '}
            <OrderStatusBadge status={nextStatus as OrderStatus} />?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            className="w-full"
            variant="destructive"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            size="sm"
          >
            {t('cancel')}
          </Button>
          <Button
            className="w-full bg-violet-500 hover:bg-violet-400 dark:bg-violet-900 dark:hover:bg-violet-800 dark:text-foreground"
            onClick={onConfirm}
            disabled={isLoading}
            variant="default"
            size="sm"
          >
            {isLoading ? (
              <span>
                <Loader2 className="mr-2 size-4 animate-spin" />
              </span>
            ) : (
              t('confirm')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
