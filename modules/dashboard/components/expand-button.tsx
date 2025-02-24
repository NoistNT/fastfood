// import { cn } from '@/lib/utils';
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
        className="bg-background/60 tracking-normal"
        variant="outline"
        size="sm"
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 'Hide' : 'Show'}
      </Button>
    </TableCell>
  );
}
