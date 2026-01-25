import type { User } from '@/modules/users/types';

import { useTranslations } from 'next-intl';

interface Props {
  user: User;
}

export default function UserProfile({ user }: Props) {
  const t = useTranslations('Features.profile');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">{t('personalInformation')}</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t('fullName')}</label>
              <p className="text-sm font-medium mt-1">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('emailAddress')}
              </label>
              <p className="text-sm font-medium mt-1">{user.email}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">{t('memberSince')}</label>
            <p className="text-sm font-medium mt-1">
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
