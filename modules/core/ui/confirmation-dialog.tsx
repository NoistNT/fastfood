import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type ReactNode } from 'react';

import { Button } from '@/modules/core/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/modules/core/ui/dialog';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isLoading = false,
}: ConfirmationDialogProps) {
  const t = useTranslations('Common');

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="tracking-tight">
        <DialogHeader>
          <DialogTitle className="tracking-tighter mb-2">{title}</DialogTitle>
          <DialogDescription className="my-2">{description}</DialogDescription>
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
