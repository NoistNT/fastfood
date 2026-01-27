'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

import { toast } from '@/modules/core/hooks/use-toast';
import { Button } from '@/modules/core/ui/button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('Components.errors.general');

  useEffect(() => {
    if (error instanceof Error) {
      // Log error to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Global error:', error);
      }

      toast({
        title: t('title'),
        description: error.message ?? 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  }, [error, t]);

  if (error instanceof Error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              {t('title', { defaultValue: 'Something went wrong' })}
            </h1>
            <p className="text-muted-foreground">
              {error.message ??
                t('description', {
                  defaultValue: 'An unexpected error occurred. Please try again.',
                })}
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && error.digest && (
            <div className="text-left">
              <details className="bg-muted p-4 rounded-md">
                <summary className="cursor-pointer font-medium text-sm">
                  Error Details (Development)
                </summary>
                <div className="mt-2 space-y-2 text-xs font-mono">
                  <div>
                    <strong>Error:</strong> {error.name}
                  </div>
                  <div>
                    <strong>Message:</strong> {error.message}
                  </div>
                  <div>
                    <strong>Digest:</strong> {error.digest}
                  </div>
                  {error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs overflow-auto max-h-32">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={reset}
              variant="default"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button
              asChild
              variant="outline"
            >
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
