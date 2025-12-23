'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Mail } from 'lucide-react';

import { Button } from '@/modules/core/ui/button';
import { Input } from '@/modules/core/ui/input';
import { Label } from '@/modules/core/ui/label';
import { useToast } from '@/modules/core/hooks/use-toast';

const forgotPasswordSchema = z.object({
  email: z.email('Please enter a valid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations('Features.auth.forgotPassword');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  // Focus management
  useEffect(() => {
    // Focus the email input when component mounts
    if (!isEmailSent) {
      const emailInput = document.getElementById('email') as HTMLInputElement;
      if (emailInput) {
        setTimeout(() => emailInput.focus(), 100); // Small delay to ensure DOM is ready
      }
    }
  }, [isEmailSent]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Allow form submission with Ctrl/Cmd + Enter
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && !isSubmitting) {
        event.preventDefault();
        const form = document.querySelector('form') as HTMLFormElement;
        if (form) {
          form.requestSubmit();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (response.ok) {
        setIsEmailSent(true);
        toast({
          title: t('toast.success.title'),
          description: t('toast.success.description'),
        });
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

  if (isEmailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-lg text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <header>
            <h1 className="text-2xl font-bold">{t('emailSent.title')}</h1>
            <p className="text-muted-foreground mt-2">
              {t('emailSent.description')}{' '}
              <span className="font-medium text-foreground">{getValues('email')}</span>
            </p>
          </header>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('emailSent.notReceived')} {t('emailSent.checkSpam')}{' '}
              <button
                onClick={() => setIsEmailSent(false)}
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {t('emailSent.tryAgain')}
              </button>
            </p>
            <Button
              onClick={() => router.push('/login')}
              variant="outline"
              className="w-full"
            >
              {t('backToLogin')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div
        className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-lg"
        role="main"
        aria-labelledby="forgot-password-heading"
      >
        <header className="text-center">
          <h1
            id="forgot-password-heading"
            className="text-2xl font-bold"
          >
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-2">{t('description')}</p>
        </header>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          aria-labelledby="forgot-password-heading"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="email">{t('emailLabel')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              {...register('email')}
              className={errors.email ? 'border-destructive' : ''}
              aria-required="true"
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
              autoComplete="email"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p
                id="email-error"
                className="text-sm text-destructive"
                role="alert"
                aria-live="polite"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
            aria-disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            disabled={isSubmitting}
          >
            {t('backToLogin')}
          </button>
        </div>
      </div>
    </div>
  );
}
