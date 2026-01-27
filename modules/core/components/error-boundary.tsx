'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, RefreshCw } from 'lucide-react';

import { toast } from '@/modules/core/hooks/use-toast';
import { Button } from '@/modules/core/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error: Error;
    resetError: () => void;
  }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Note: Winston logging is server-side only, so we skip it here
    // Error logging for client-side errors should be handled by error reporting services

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to toast
    toast({
      title: 'Something went wrong',
      description: 'An unexpected error occurred. Please try refreshing the page.',
      variant: 'destructive',
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
          />
        );
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

function DefaultErrorFallback({ error, resetError }: DefaultErrorFallbackProps) {
  const t = useTranslations('Components.errors.general');

  return (
    <div className="flex flex-col items-center justify-center min-h-100 p-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            {t('title', { defaultValue: 'Something went wrong' })}
          </h2>
          <p className="text-muted-foreground max-w-md">
            {t('description', {
              defaultValue:
                'An unexpected error occurred. Please try again or contact support if the problem persists.',
            })}
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                Error Details (Development)
              </summary>
              <pre className="mt-2 p-4 bg-muted rounded-md text-xs overflow-auto max-w-full">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={resetError}
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="default"
          >
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  );
}

// Hook for using error boundary in functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    toast({
      title: 'Error',
      description: error.message,
      variant: 'destructive',
    });
  };
}
