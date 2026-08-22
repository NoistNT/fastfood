import { Avatar, AvatarFallback, AvatarImage } from '@/modules/core/ui/avatar';

export function getUserInitials(name?: string | null, email?: string | null): string {
  const fromName = name
    ?.trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

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
  return (
    <Avatar className={className}>
      {imageUrl ? (
        <AvatarImage
          src={imageUrl}
          alt={name ?? email ?? 'User'}
        />
      ) : null}
      <AvatarFallback className="bg-primary text-primary-foreground">
        {getUserInitials(name, email)}
      </AvatarFallback>
    </Avatar>
  );
}
