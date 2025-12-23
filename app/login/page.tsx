'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/modules/core/ui/button';
import { EnhancedInput } from '@/modules/core/ui/enhanced-input';
import { useAuth } from '@/modules/auth/context/auth-context';
import { toastNotifications } from '@/lib/toast-notifications';

const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const t = useTranslations('Features.auth.login');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated && !loading && user) {
      const hasAdminAccess = user.roles?.some((role) => role.name === 'admin') ?? false;
      router.push(hasAdminAccess ? '/dashboard' : '/');
    }
  }, [isAuthenticated, loading, router, user]);

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    try {
      const success = await login(data.email, data.password);
      if (!success) {
        toastNotifications.error.loginFailed();
      }
    } catch (_error) {
      toastNotifications.error.genericError();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated && !loading) return null;

  const isFormDisabled = loading || isSubmitting;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div
        className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-lg relative"
        role="main"
        aria-labelledby="login-heading"
      >
        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Checking session...</p>
            </div>
          </div>
        )}
        <header className="text-center">
          <h1
            id="login-heading"
            className="text-2xl font-bold"
          >
            Sign In
          </h1>
          <p className="text-muted-foreground">Enter your credentials to access your account</p>
        </header>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          aria-labelledby="login-heading"
          noValidate
        >
          <EnhancedInput
            {...register('email')}
            type="email"
            label="Email"
            placeholder="Enter your email"
            error={errors.email}
          />
          <EnhancedInput
            {...register('password')}
            type="password"
            label="Password"
            placeholder="Enter your password"
            error={errors.password}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
            aria-disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Links */}
        <div className="mt-6 space-y-4 text-center">
          <div>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              tabIndex={isFormDisabled ? -1 : undefined}
            >
              {t('forgotPasswordLink')}
            </Link>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
                tabIndex={isFormDisabled ? -1 : undefined}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
