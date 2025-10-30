import { Skeleton } from '@/modules/core/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/modules/core/ui/table';

export default function OrderTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-primary-foreground">
      <Table className="w-full">
        <TableHeader className="sticky top-0 bg-white dark:bg-black tracking-tight">
          <TableRow>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableHead
                key={i}
                className="w-1/5 text-primary"
              >
                <Skeleton className="h-5 w-16" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 3 }).map((_, i) => (
            <TableRow
              key={i}
              className="dark:hover:bg-muted/50 hover:bg-neutral-200 text-muted-foreground font-medium"
            >
              <TableCell>
                <Skeleton className="h-5 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
