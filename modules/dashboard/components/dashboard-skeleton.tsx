import { Loader2 } from 'lucide-react';

export default function DashboardSkeleton() {
  return (
    <div className="h-64 flex items-center justify-center text-muted-foreground">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
