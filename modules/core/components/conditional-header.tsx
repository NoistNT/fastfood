'use client';

import { usePathname } from 'next/navigation';

import Header from '@/modules/core/components/header';
import { BackgroundWall } from '@/modules/core/ui/background-wall';

export default function ConditionalHeader() {
  const pathname = usePathname();
  const isDashboardRoute = pathname?.startsWith('/dashboard');

  if (isDashboardRoute) return null;

  return (
    <>
      <Header />
      <BackgroundWall />
    </>
  );
}
