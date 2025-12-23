'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/modules/core/ui/button';
import { Input } from '@/modules/core/ui/input';
import { Label } from '@/modules/core/ui/label';
import { useToast } from '@/modules/core/hooks/use-toast';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must be less than 100 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('Features.auth.resetPassword');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get('token');

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Allow form submission with Ctrl/Cmd + Enter
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && !isSubmitting && token) {
        event.preventDefault();
        const form = document.querySelector('form') as HTMLFormElement;
        if (form) {
          form.requestSubmit();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, token]);

  // Focus management
  useEffect(() => {
    if (token) {
      // Focus the password input when component mounts
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      if (passwordInput) {
        setTimeout(() => passwordInput.focus(), 100);
      }
    }
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      toast({
        title: t('toast.invalidLink.title'),
        description: t('toast.invalidLink.description'),
        variant: 'destructive',
      });
      router.push('/login');
    }
  }, [token, toast, router, t]);

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/password-reset/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: t('toast.success.title'),
          description: t('toast.success.description'),
        });
        router.push('/login');
      } else {
        toast({
          title: t('toast.error.title'),
          description: result.error?.message ?? t('toast.error.description'),
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: t('toast.error.title'),
        description: t('toast.error.description'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div
        className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-lg"
        role="main"
        aria-labelledby="reset-password-heading"
      >
        <header className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1
            id="reset-password-heading"
            className="text-2xl font-bold"
          >
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-2">{t('description')}</p>
        </header>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          aria-labelledby="reset-password-heading"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="password">{t('passwordLabel')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('passwordPlaceholder')}
                {...register('password')}
                aria-label={t('passwordLabel')}
                className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                aria-required="true"
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : undefined}
                autoComplete="new-password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
            {errors.password && (
              <p
                id="password-error"
                className="text-sm text-destructive"
                role="alert"
                aria-live="polite"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('confirmPasswordLabel')}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('confirmPasswordPlaceholder')}
                {...register('confirmPassword')}
                aria-label={t('confirmPasswordLabel')}
                className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                aria-required="true"
                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                autoComplete="new-password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                aria-label={showConfirmPassword ? t('hidePassword') : t('showPassword')}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p
                id="confirm-password-error"
                className="text-sm text-destructive"
                role="alert"
                aria-live="polite"
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
            aria-disabled={isSubmitting}
            aria-describedby="reset-password-help"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                &quot;Resetting Password...&quot;
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            disabled={isSubmitting}
            aria-label={t('backToLogin')}
          >
            {t('backToLogin')}
          </button>
        </div>

        {/* Hidden help text for screen readers */}
        <div
          id="reset-password-help"
          className="sr-only"
        >
          {t('description')}
        </div>
      </div>
    </div>
  );
}
