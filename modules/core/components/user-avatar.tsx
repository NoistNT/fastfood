'use client';

import { useTranslations } from 'next-intl';

import { Avatar, AvatarFallback, AvatarImage } from '@/modules/core/ui/avatar';

export function getUserInitials(name?: string | null, email?: string | null): string {
  const fromName = name?.trim().charAt(0).toUpperCase();
  if (fromName) return fromName;

  const fromEmail = email?.trim().charAt(0).toUpperCase();
  if (fromEmail) return fromEmail;

  return 'U';
}

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  className?: string;
}

export function UserAvatar({ name, email, imageUrl, className }: UserAvatarProps) {
  const t = useTranslations('Components.header');

  return (
    <Avatar className={className}>
      {imageUrl ? (
        <AvatarImage
          src={imageUrl}
          alt={name ?? email ?? t('avatarAlt')}
        />
      ) : null}
      <AvatarFallback className="bg-primary text-primary-foreground">
        {getUserInitials(name, email)}
      </AvatarFallback>
    </Avatar>
  );
}
