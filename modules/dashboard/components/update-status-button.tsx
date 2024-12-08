import { Button } from '@/modules/core/ui/button';

interface Props {
  nextStatus: string;
  isChangingStatus: boolean;
  handleUpdateStatus: () => void;
}

export function UpdateStatusButton({ nextStatus, isChangingStatus, handleUpdateStatus }: Props) {
  return (
    <div className="mt-6">
      {nextStatus ? (
        <Button
          className="min-w-32"
          disabled={isChangingStatus}
          type="button"
          variant={isChangingStatus ? 'secondary' : 'outline'}
          onClick={handleUpdateStatus}
        >
          {isChangingStatus ? 'Updating...' : nextStatus}
        </Button>
      ) : null}
    </div>
  );
}
