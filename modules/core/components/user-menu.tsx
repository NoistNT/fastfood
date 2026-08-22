'use client';

import type { ReactNode } from 'react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/modules/auth/context/auth-context';
import { Button } from '@/modules/core/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/modules/core/ui/dropdown-menu';
import { ThemeSubmenu } from '@/modules/core/ui/theme-submenu';
import { UserAvatar } from '@/modules/core/components/user-avatar';

interface UserMenuProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    imageUrl?: string | null;
  };
  /** Rendered between Profile and the Theme submenu (e.g., admin-only Dashboard link) */
  extraItems?: ReactNode;
}

export function UserMenu({ user, extraItems }: UserMenuProps) {
  const t = useTranslations('Components.header');
  const tAuth = useTranslations('Features.auth.navigation');
  const { logout } = useAuth();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-full"
          aria-label={t('userMenu')}
          suppressHydrationWarning
        >
          <UserAvatar
            name={user.name}
            email={user.email}
            imageUrl={user.imageUrl}
            className="size-8"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        align="end"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name ?? user.email}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(`/profile/${user.id}`)}>
          {t('profile')}
        </DropdownMenuItem>
        {extraItems}
        <ThemeSubmenu />
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void logout()}>{tAuth('logout')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
