import type { NewProduct, Product } from '@/types/db';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query keys for consistent caching
export const queryKeys = {
  dashboard: {
    summary: ['dashboard', 'summary'] as const,
    charts: (period: string) => ['dashboard', 'charts', period] as const,
  },
  products: ['products'] as const,
  customers: ['customers'] as const,
  inventory: ['inventory'] as const,
  orders: ['orders'] as const,
} as const;

// Custom hooks for API data fetching with caching
export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard.summary,
    queryFn: async () => {
      const response = await fetch('/api/dashboard/summary');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard summary');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useDashboardCharts(period: string = '30d') {
  return useQuery({
    queryKey: queryKeys.dashboard.charts(period),
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/charts?period=${period}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard charts');
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes for charts
  });
}

export function useProducts() {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCustomers() {
  return useQuery({
    queryKey: queryKeys.customers,
    queryFn: async () => {
      const response = await fetch('/api/customers');
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useInventory() {
  return useQuery({
    queryKey: queryKeys.inventory,
    queryFn: async () => {
      const response = await fetch('/api/inventory');
      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for inventory (changes more frequently)
  });
}

// Mutations for data updates
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData: NewProduct) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        throw new Error('Failed to create product');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, productData }: { id: number; productData: Partial<Product> }) => {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/products/${id}/delete`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
}

// Prefetch utilities for performance
export function prefetchDashboardData(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.prefetchQuery({
    queryKey: queryKeys.dashboard.summary,
    queryFn: async () => {
      const response = await fetch('/api/dashboard/summary');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  queryClient.prefetchQuery({
    queryKey: queryKeys.products,
    queryFn: async () => {
      const response = await fetch('/api/products');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}
