import { Loader2 } from 'lucide-react';

import { TableBody, TableCell, TableRow } from '@/modules/core/ui/table';

export default function DashboardSkeleton() {
  return (
    <TableBody>
      <TableRow>
        <TableCell
          colSpan={5}
          className="h-64 text-center text-muted-foreground"
        >
          <div className="flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </TableCell>
      </TableRow>
    </TableBody>
  );
}
