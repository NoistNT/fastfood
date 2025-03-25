import { useState } from 'react';

import { toTitleCase } from '@/lib/utils';
import { Button } from '@/modules/core/ui/button';
import { StatusUpdateConfirmation } from '@/modules/dashboard/components/status-update-confirmation';

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!nextStatus) return null;

  return (
    <>
      <div className="mt-4 flex justify-center">
        <Button
          className="w-full md:w-1/2 bg-gradient-to-r from-rose-50 to-violet-50 dark:from-indigo-900 dark:to-purple-900 hover:from-rose-100 hover:to-violet-100 dark:hover:from-indigo-800 dark:hover:to-purple-800"
          disabled={isChangingStatus}
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
        >
          {toTitleCase(currentStatus)} → {toTitleCase(nextStatus)}
        </Button>
      </div>

      <StatusUpdateConfirmation
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        currentStatus={currentStatus}
        nextStatus={nextStatus}
        onConfirm={handleUpdateStatus}
        isLoading={isChangingStatus}
      />
    </>
  );
}
