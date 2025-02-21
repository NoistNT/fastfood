import { cn } from '@/lib/utils';
import { Button } from '@/modules/core/ui/button';
import { TableCell } from '@/modules/core/ui/table';

interface Props {
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ExpandButton({ isExpanded, setIsExpanded }: Props) {
  return (
    <TableCell className="flex flex-col">
      <Button
        className={cn(
          'h-8 w-24 border border-neutral-300 bg-white text-neutral-700 shadow-sm hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700',
          isExpanded ? 'mb-2' : ''
        )}
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 'Collapse' : 'Expand'}
      </Button>
    </TableCell>
  );
}
