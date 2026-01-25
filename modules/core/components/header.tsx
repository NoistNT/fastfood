'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/modules/auth/context/auth-context';
import { USER_ROLES, type UserWithRoles } from '@/types/auth';
import { MobileHeader } from '@/modules/core/components/mobile-header';
import { Avatar, AvatarFallback } from '@/modules/core/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/modules/core/ui/dropdown-menu';
import { Button } from '@/modules/core/ui/button';

export default function Header() {
  const t = useTranslations('Components.header');
  const tAuth = useTranslations('Features.auth.navigation');
  const { user, logout } = useAuth();
  const router = useRouter();

  const [localUser, setLocalUser] = useState<UserWithRoles | null>(null);
  const [localLoading, setLocalLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        setLocalUser(data.data.user);
      } else {
        setLocalUser(null);
      }
    } catch {
      setLocalUser(null);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    fetchSession();
  }, [user]);

  // Helper function to check if user has admin privileges
  const hasAdminAccess = localUser?.roles?.some((role) => role.name === USER_ROLES.ADMIN) ?? false;
  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between bg-background/50 dark:bg-background/75 backdrop-blur-sm px-4 py-3.5 text-primary shadow-lg dark:shadow-neutral-900/50 transition-colors ease-in-out"
      role="banner"
      aria-label="Site header"
    >
      <Link
        href="/"
        aria-label="FastFood home"
      >
        <h1 className="text-2xl text-primary font-semibold tracking-tighter hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors duration-200">
          {t('title')}
        </h1>
      </Link>

      {/* Desktop Navigation */}
      <nav
        className="hidden md:flex items-center gap-x-4"
        role="navigation"
        aria-label="Main navigation"
      >
        <Link
          href="/order"
          aria-label="Order food"
        >
          <Button
            variant="ghost"
            className="tracking-tight"
          >
            {t('order')}
          </Button>
        </Link>
        {hasAdminAccess && (
          <Link
            href="/dashboard"
            aria-label="Go to dashboard"
          >
            <Button
              variant="ghost"
              className="tracking-tight"
            >
              {t('dashboard')}
            </Button>
          </Link>
        )}
        {!!localUser && (
          <Link
            href={`/profile/${localUser?.id}`}
            aria-label="View profile"
          >
            <Button
              variant="ghost"
              className="tracking-tight"
            >
              {t('profile')}
            </Button>
          </Link>
        )}
      </nav>

      {/* Mobile Navigation */}
      <MobileHeader
        user={localUser}
        isAuthenticated={!!localUser}
      />

      <nav
        className="flex items-center gap-x-2"
        role="navigation"
        aria-label="User account navigation"
      >
        {!localUser && !localLoading && (
          <>
            <Link
              href="/login"
              aria-label="Sign in to your account"
            >
              <Button variant="ghost">{tAuth('login')}</Button>
            </Link>
            <Link
              href="/register"
              aria-label="Create new account"
            >
              <Button variant="ghost">{tAuth('register')}</Button>
            </Link>
          </>
        )}
        {!!localUser && (
          <div suppressHydrationWarning>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                  aria-label="User menu"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      {localUser.name ? localUser.name.charAt(0) : localUser.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {localUser.name || localUser.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">{localUser.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/profile/${localUser.id}`)}>
                  {t('profile')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>{tAuth('logout')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </nav>
    </header>
  );
}
