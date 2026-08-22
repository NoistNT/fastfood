'use client';

import { usePathname } from 'next/navigation';

import Header from '@/modules/core/components/header';
import { BackgroundWall } from '@/modules/core/ui/background-wall';

export default function ConditionalHeader() {
  const pathname = usePathname();

  // The dashboard renders its own chrome (sidebar + header); theme controls
  // live inside the account menu there, same as everywhere else.
  if (pathname?.startsWith('/dashboard')) return null;

  return (
    <>
      <Header />
      <BackgroundWall />
    </>
  );
}
