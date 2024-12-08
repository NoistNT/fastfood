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
          'h-7 w-20 border border-neutral-400 shadow-sm hover:border-neutral-500 hover:bg-neutral-50 dark:border-neutral-600 dark:hover:border-neutral-500 dark:hover:bg-black/20',
          isExpanded ? 'mb-1.5' : ''
        )}
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 'Collapse' : 'Expand'}
      </Button>
    </TableCell>
  );
}
