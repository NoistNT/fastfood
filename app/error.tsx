'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { toast } from '@/modules/core/hooks/use-toast';

export default function ErrorPage({ error }: { error: Error }) {
  const t = useTranslations('Error');

  useEffect(() => {
    if (error instanceof Error) {
      toast({
        title: t('title'),
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [error, t]);

  if (error instanceof Error) {
    return (
      <div className="flex flex-col gap-y-4 justify-center items-center w-full h-full text-muted-foreground">
        <h1 className="text-xl font-medium">{t('title')}</h1>
        <span className="text-sm">{error.message}</span>
      </div>
    );
  }
  return null;
}
