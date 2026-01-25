import type { FieldError } from 'react-hook-form';

import { forwardRef } from 'react';

import { cn } from '@/lib/utils';
import { Input } from '@/modules/core/ui/input';
import { Label } from '@/modules/core/ui/label';

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError;
  helperText?: string;
  success?: boolean;
  loading?: boolean;
}

export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ className, label, error, helperText, success, loading, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-2">
        {label && (
          <Label
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium',
              error && 'text-destructive',
              success && 'text-green-600',
              loading && 'text-muted-foreground'
            )}
          >
            {label}
          </Label>
        )}

        <div className="relative">
          <Input
            ref={ref}
            id={inputId}
            className={cn(
              'transition-all duration-200',
              error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
              success && 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
              loading && 'opacity-70 cursor-not-allowed',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />

          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
            </div>
          )}

          {success && !loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-destructive animate-in slide-in-from-top-1 duration-200"
            role="alert"
          >
            {error.message}
          </p>
        )}

        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="text-sm text-muted-foreground"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

EnhancedInput.displayName = 'EnhancedInput';
