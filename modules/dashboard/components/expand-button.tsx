import { cn } from '@/lib/utils'
import { Button } from '@/modules/core/ui/button'
import { TableCell } from '@/modules/core/ui/table'

interface Props {
  isExpanded: boolean
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>
}

export function ExpandButton({ isExpanded, setIsExpanded }: Props) {
  return (
    <TableCell className="flex flex-col">
      <Button
        className={cn(
          'h-7 w-20 border border-neutral-300 shadow-sm hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-600',
          isExpanded ? 'mb-1.5' : ''
        )}
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 'Collapse' : 'Expand'}
      </Button>
    </TableCell>
  )
}
