import { toTitleCase } from '@/lib/utils';
import { Button } from '@/modules/core/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/modules/core/ui/dialog';

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
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="tracking-tight">
        <DialogHeader>
          <DialogTitle className="tracking-tighter mb-2">Confirm Status Update</DialogTitle>
          <DialogDescription className="my-2">
            Are you sure you want to change the status from{' '}
            <span className="font-semibold">{toTitleCase(currentStatus)}</span> to{' '}
            <span className="font-semibold">{toTitleCase(nextStatus)}</span>?
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
            Cancel
          </Button>
          <Button
            className="w-full bg-violet-500 hover:bg-violet-400 dark:bg-violet-900 dark:hover:bg-violet-800 dark:text-foreground"
            onClick={onConfirm}
            disabled={isLoading}
            variant="default"
            size="sm"
          >
            {isLoading ? 'Updating...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
