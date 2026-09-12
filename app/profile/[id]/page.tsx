import { notFound } from 'next/navigation';

import { canViewProfile } from '@/lib/auth/roles';
import { getSession } from '@/lib/auth/session';
import { findUserById } from '@/modules/users/actions';
import { ProfileDashboard } from '@/modules/users/components/profile-dashboard';
import { ErrorBoundary } from '@/modules/core/components/error-boundary';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params;

  const session = await getSession();
  if (!canViewProfile(session, id)) notFound();

  const user = await findUserById(id);

  if (!user) notFound();

  const isOwnProfile = session?.id === id;

  return (
    <ErrorBoundary>
      <ProfileDashboard
        user={user}
        isOwnProfile={isOwnProfile}
      />
    </ErrorBoundary>
  );
}
