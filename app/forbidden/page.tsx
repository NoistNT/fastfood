'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ShieldX } from 'lucide-react';

import { Button } from '@/modules/core/ui/button';

export default function Forbidden() {
  const t = useTranslations('Components.errors.forbidden');

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <ShieldX className="h-16 w-16 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">{t('title') || 'Access Denied'}</h1>
          <p className="text-muted-foreground italic">
            {t('idiom') || 'Curiosity killed the cat.'}
          </p>
          <p className="text-muted-foreground pt-10">
            {t('description') || 'You do not have the necessary permissions to access this page.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            variant="default"
          >
            <Link href="/">{t('goHome') || 'Go Home'}</Link>
          </Button>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
