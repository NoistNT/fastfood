import { toTitleCase } from '@/lib/utils';
import { Button } from '@/modules/core/ui/button';

interface Props {
  nextStatus: string;
  currentStatus: string;
  isChangingStatus: boolean;
  handleUpdateStatus: () => void;
}

export function UpdateStatusButton({
  nextStatus,
  currentStatus,
  isChangingStatus,
  handleUpdateStatus,
}: Props) {
  return (
    <div className="mt-2 flex justify-center">
      {nextStatus ? (
        <Button
          className="w-2/5 md:w-1/5 bg-background"
          disabled={isChangingStatus}
          type="button"
          variant={isChangingStatus ? 'secondary' : 'outline'}
          size="sm"
          onClick={handleUpdateStatus}
        >
          {isChangingStatus
            ? 'Updating...'
            : toTitleCase(currentStatus) + ' -->  ' + toTitleCase(nextStatus)}
        </Button>
      ) : null}
    </div>
  );
}
