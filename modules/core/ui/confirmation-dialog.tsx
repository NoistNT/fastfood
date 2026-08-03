import type { ReactNode } from 'react';
import type { ButtonProps } from '@/modules/core/ui/utils-button';

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

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  onConfirm: () => void;
  isLoading?: boolean;
  cancelText: string;
  confirmText: string;
  confirmVariant?: ButtonProps['variant'];
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isLoading = false,
  cancelText,
  confirmText,
  confirmVariant = 'destructive',
}: ConfirmationDialogProps) {
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
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            size="sm"
          >
            {cancelText}
          </Button>
          <Button
            className="w-full"
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? (
              <span>
                <Loader2 className="mr-2 size-4 animate-spin" />
              </span>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
