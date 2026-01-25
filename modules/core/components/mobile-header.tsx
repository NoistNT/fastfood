import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { USER_ROLES, type UserWithRoles } from '@/types/auth';
import { Button } from '@/modules/core/ui/button';
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
          >
            <Menu className="text-primary " />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="bg-popover backdrop-blur-sm border-l"
        >
          <SheetHeader>
            <SheetTitle>{t('title')}</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-y-2 mt-6">
            <SheetItem
              title={t('order')}
              href="/order"
            />
            {hasAdminAccess && (
              <SheetItem
                title={t('dashboard')}
                href="/dashboard"
              />
            )}
            {isAuthenticated && user && (
              <SheetItem
                title={t('profile')}
                href={`/profile/${user.id}`}
              />
            )}
          </nav>
          <SheetFooter className="absolute bottom-4 right-4">
            <Button variant="ghost">{tAuth('logout')}</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
