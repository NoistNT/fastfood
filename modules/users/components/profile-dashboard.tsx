'use client';

import type { User } from '@/modules/users/types';

import { useTranslations } from 'next-intl';

import UserProfile from '@/modules/users/components/user-profile';

interface ProfileDashboardProps {
  user: User;
  isOwnProfile?: boolean;
}

export function ProfileDashboard({ user, isOwnProfile = false }: ProfileDashboardProps) {
  const t = useTranslations('Features.profile');

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-1 flex-col py-8 px-1.5">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {isOwnProfile ? t('myProfile') : t('userProfile')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isOwnProfile ? t('myProfileDescription') : t('userProfileDescription')}
        </p>
      </div>

      {/* Profile Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Profile Card */}
        <div className="md:col-span-2">
          <div className="rounded-lg border bg-card p-6">
            <UserProfile user={user} />
          </div>
        </div>

        {/* Sidebar with additional info/actions */}
        <div className="space-y-6">
          {isOwnProfile && (
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">{t('accountActions')}</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-2 text-sm bg-muted rounded-md hover:bg-muted/80 transition-colors">
                  {t('editProfile')}
                </button>
                <button className="w-full text-left px-4 py-2 text-sm bg-muted rounded-md hover:bg-muted/80 transition-colors">
                  {t('changePassword')}
                </button>
                <button className="w-full text-left px-4 py-2 text-sm bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 transition-colors">
                  {t('deleteAccount')}
                </button>
              </div>
            </div>
          )}

          {/* Account Statistics */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">{t('accountInfo')}</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">{t('memberSince')}</p>
                <p className="text-sm font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('lastUpdated')}</p>
                <p className="text-sm font-medium">
                  {new Date(user.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
