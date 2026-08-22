'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, UtensilsCrossed } from 'lucide-react';

import { useAuth } from '@/modules/auth/context/auth-context';
import { USER_ROLES, type UserWithRoles } from '@/types/auth';
import { MobileHeader } from '@/modules/core/components/mobile-header';
import { UserMenu } from '@/modules/core/components/user-menu';
import { cn } from '@/lib/utils';
import { Button } from '@/modules/core/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/modules/core/ui/tooltip';

export default function Header() {
  const t = useTranslations('Components.header');
  const tAuth = useTranslations('Features.auth.navigation');
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [localUser, setLocalUser] = useState<UserWithRoles | null>(null);
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          if (!cancelled) {
            setLocalUser(data.data.user);
          }
        } else if (!cancelled) {
          setLocalUser(null);
        }
      } catch {
        if (!cancelled) {
          setLocalUser(null);
        }
      } finally {
        if (!cancelled) {
          setLocalLoading(false);
        }
      }
    };

    loadSession();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Helper function to check if user has admin privileges
  const hasAdminAccess = localUser?.roles?.some((role) => role.name === USER_ROLES.ADMIN) ?? false;
  const isOnMenu = pathname === '/products';

  const menuButton = (
    <Link
      href="/products"
      aria-label={t('goToMenu')}
      aria-current={isOnMenu ? 'page' : undefined}
    >
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('menu')}
        suppressHydrationWarning
        className={cn(isOnMenu && 'bg-accent text-primary hover:bg-accent')}
      >
        <UtensilsCrossed />
      </Button>
    </Link>
  );

  const dashboardButton =
    hasAdminAccess && localUser ? (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/dashboard"
              aria-label={t('dashboard')}
            >
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('dashboard')}
                suppressHydrationWarning
                onClick={() => router.push('/dashboard')}
              >
                <LayoutDashboard />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>{t('dashboard')}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : null;

  return (
    <header
      className="sticky top-0 z-50 bg-background border-b transition-colors ease-in-out"
      role="banner"
      aria-label={t('siteHeader')}
    >
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label={t('homeLink')}
        >
          <h1 className="text-2xl text-primary font-semibold tracking-tighter hover:text-primary/75 transition-colors duration-200">
            {t('title')}
          </h1>
        </Link>

        {/* Right toolbar cluster (desktop) + mobile hamburger */}
        <div className="flex items-center gap-x-2">
          <nav
            className="hidden md:flex items-center gap-x-2"
            role="navigation"
            aria-label={t('userNavigation')}
          >
            {!localLoading && !localUser && (
              <>
                <Link
                  href="/login"
                  aria-label={tAuth('login')}
                >
                  <Button
                    variant="ghost"
                    size="default"
                  >
                    {tAuth('login')}
                  </Button>
                </Link>
                <Link
                  href="/register"
                  aria-label={tAuth('register')}
                >
                  <Button
                    variant="default"
                    size="default"
                  >
                    {tAuth('register')}
                  </Button>
                </Link>
              </>
            )}
            {!!localUser && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>{menuButton}</TooltipTrigger>
                    <TooltipContent>{t('menu')}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {dashboardButton}
                <Link
                  href="/order"
                  aria-label={t('viewCart')}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    suppressHydrationWarning
                  >
                    <ShoppingCart />
                  </Button>
                </Link>
                <UserMenu user={localUser} />
              </>
            )}
          </nav>

          {/* Below md this is the only control in the bar; everything else lives in the sheet */}
          <MobileHeader
            user={localUser}
            isAuthenticated={!!localUser}
          />
        </div>
      </div>
    </header>
  );
}
