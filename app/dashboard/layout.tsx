import { redirect } from 'next/navigation';

import { hasOperationalRole } from '@/lib/auth/roles';
import { getSession } from '@/lib/auth/session';
import DashboardSidebar from '@/modules/dashboard/components/sidebar';
import DashboardHeader from '@/modules/dashboard/components/header';
import { ErrorBoundary } from '@/modules/core/components/error-boundary';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  if (!hasOperationalRole(user.roles)) {
    redirect('/forbidden');
  }
  return (
    <div className="h-full relative">
      <DashboardSidebar />
      <div className="md:pl-64 flex flex-col h-full">
        <DashboardHeader />
        <section className="flex-1 py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </section>
      </div>
    </div>
  );
}
