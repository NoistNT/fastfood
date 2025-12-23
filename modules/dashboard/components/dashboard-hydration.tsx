'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import { useDashboard } from '@/store/use-dashboard';

interface DashboardHydrationProps {
  children: React.ReactNode;
}

export default function DashboardHydration({ children }: DashboardHydrationProps) {
  const searchParams = useSearchParams();
  const setDate = useDashboard((state) => state.setDate);
  const setPage = useDashboard((state) => state.setPage);

  useEffect(() => {
    const dateParam = searchParams.get('date');
    const pageParam = searchParams.get('page');

    if (dateParam) setDate(new Date(dateParam));
    if (pageParam) setPage(parseInt(pageParam));
  }, [searchParams, setDate, setPage]);

  return children;
}
