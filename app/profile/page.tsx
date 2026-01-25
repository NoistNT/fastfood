import { redirect } from 'next/navigation';

import { getSession } from '@/lib/auth/session';
import { findUserById } from '@/modules/users/actions';
import { ProfileDashboard } from '@/modules/users/components/profile-dashboard';
import { ErrorBoundary } from '@/modules/core/components/error-boundary';

export default async function ProfilePage() {
  const session = await getSession();

  if (!session?.id) redirect('/login');

  const user = await findUserById(session.id);
  if (!user) redirect('/login');

  return (
    <ErrorBoundary>
      <ProfileDashboard
        user={user}
        isOwnProfile
      />
    </ErrorBoundary>
  );
}
