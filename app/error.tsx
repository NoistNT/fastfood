'use client';

import { toast } from '@/modules/core/hooks/use-toast';

export default function ErrorPage({ error }: { error: Error }) {
  if (error instanceof Error) {
    toast({
      title: 'Something went wrong',
      description: error.message,
      variant: 'destructive',
    });
    return (
      <div className="flex flex-col gap-y-4 justify-center items-center w-full h-full text-muted-foreground">
        <h1 className="text-xl font-medium">Something went wrong</h1>
        <span className="text-sm">{error.message}</span>
      </div>
    );
  }
  return null;
}
