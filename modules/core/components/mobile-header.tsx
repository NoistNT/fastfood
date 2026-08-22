import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  LogIn,
  Menu,
  ShoppingCart,
  User,
  UserPlus,
  UtensilsCrossed,
} from 'lucide-react';

import { useAuth } from '@/modules/auth/context/auth-context';
import { USER_ROLES, type UserWithRoles } from '@/types/auth';
import { Button } from '@/modules/core/ui/button';
import { ModeToggle } from '@/modules/core/ui/mode-toggle';
import { SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/modules/core/ui/sheet';
import { Sheet, SheetTrigger } from '@/modules/core/ui/utils-sheet';
import { SheetItem } from '@/modules/core/ui/sheet-item';

interface MobileHeaderProps {
  user: UserWithRoles | null;
  isAuthenticated: boolean;
}

export function MobileHeader({ user, isAuthenticated }: MobileHeaderProps) {
  const t = useTranslations('Components.header');
  const tAuth = useTranslations('Features.auth.navigation');
  const { logout } = useAuth();
  const pathname = usePathname();

  // Helper function to check if user has admin privileges
  const hasAdminAccess = user?.roles?.some((role) => role.name === USER_ROLES.ADMIN) ?? false;

  return (
    <div suppressHydrationWarning>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={t('openMenu')}
          >
            <Menu />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="bg-background"
        >
          <SheetHeader>
            <SheetTitle>{t('title')}</SheetTitle>
          </SheetHeader>
          <nav
            className="flex flex-col gap-y-2 mt-6"
            aria-label={t('mainNavigation')}
          >
            <SheetItem
              title={t('menu')}
              href="/products"
              icon={UtensilsCrossed}
              active={pathname === '/products'}
            />
            {isAuthenticated && user && (
              <SheetItem
                title={t('cart')}
                href="/order"
                icon={ShoppingCart}
                active={pathname === '/order'}
              />
            )}
            {hasAdminAccess && (
              <SheetItem
                title={t('dashboard')}
                href="/dashboard"
                icon={LayoutDashboard}
                active={pathname.startsWith('/dashboard')}
              />
            )}
            {isAuthenticated && user && (
              <SheetItem
                title={t('profile')}
                href={`/profile/${user.id}`}
                icon={User}
                active={pathname === `/profile/${user.id}`}
              />
            )}
          </nav>
          {!isAuthenticated && (
            <nav
              className="flex flex-col gap-y-2 mt-6"
              aria-label={t('userNavigation')}
            >
              <SheetItem
                title={tAuth('login')}
                href="/login"
                icon={LogIn}
                active={pathname === '/login'}
              />
              <SheetItem
                title={tAuth('register')}
                href="/register"
                icon={UserPlus}
                active={pathname === '/register'}
              />
            </nav>
          )}
          <SheetFooter className="absolute inset-x-6 bottom-6 flex-row items-center justify-between">
            <ModeToggle />
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="default"
                onClick={logout}
              >
                {tAuth('logout')}
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
