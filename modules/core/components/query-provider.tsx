'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Keep in cache for 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry failed requests 3 times
            retry: 3,
            // Don't refetch on window focus in production
            refetchOnWindowFocus: process.env.NODE_ENV === 'development',
          },
          mutations: {
            // Retry mutations once on failure
            retry: 1,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
