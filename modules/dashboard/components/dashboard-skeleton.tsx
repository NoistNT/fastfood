import { TableBody, TableCell, TableRow } from '@/modules/core/ui/table';
import { Skeleton } from '@/modules/core/ui/skeleton';

export default function DashboardSkeleton() {
  return (
    <TableBody>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-5 w-22" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-22" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-22" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-22" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-full" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}
