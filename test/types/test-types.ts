// Test-specific types and interfaces for better type safety in tests
// This module provides properly typed alternatives to 'any' usage in tests

import type { CartItem } from '@/modules/orders/types';

// Mock response types for API tests
export interface MockApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

// Mock session types
export interface MockUser {
  id: string;
  name: string;
  email: string;
  roles?: string[];
}

export interface MockSession {
  id: string;
  user?: MockUser;
}

// Test data factories for consistent typing
export const createMockCartItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  productId: 1,
  name: 'Test Product',
  price: '10.00',
  quantity: 1,
  ...overrides,
});

export const createMockOrderItem = (
  overrides: Partial<{
    productId: number;
    quantity: number;
    price: string;
    name: string;
  }> = {}
) => ({
  productId: 1,
  quantity: 1,
  price: '10.00',
  name: 'Test Product',
  ...overrides,
});

export const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  roles: [],
  ...overrides,
});

export const createMockSession = (overrides: Partial<MockSession> = {}): MockSession => ({
  id: 'test-session-id',
  user: createMockUser(),
  ...overrides,
});

// Utility types for mocking can be added here as needed

// Type-safe mock response creators
export const createMockApiResponse = <T>(
  success: boolean,
  data?: T,
  error?: { message: string; code?: string }
): MockApiResponse<T> => ({
  success,
  ...(data && { data }),
  ...(error && { error }),
});

export const createMockSuccessResponse = <T>(data: T): MockApiResponse<T> =>
  createMockApiResponse(true, data);

export const createMockErrorResponse = (message: string, code?: string): MockApiResponse =>
  createMockApiResponse(false, undefined, { message, code });

// Rate limiting mock types
export interface MockRateLimitResult {
  success: boolean;
  resetTime?: number;
  remaining?: number;
}

// CSRF token mock types
export interface MockCSRFResult {
  token?: string;
  error?: string;
}

// Test-specific types for dashboard data
export interface MockOrder {
  id: string;
  total: string;
  status: string;
  createdAt: Date;
}

export interface MockCustomer {
  id: string;
  name: string;
  email: string;
}

export interface MockProduct {
  id: string;
  name: string;
  stock: number;
  minStock: number;
}

// Test data arrays for common scenarios
export const mockCartItems: CartItem[] = [
  createMockCartItem({ productId: 1, name: 'Burger', price: '10.99', quantity: 2 }),
  createMockCartItem({ productId: 2, name: 'Fries', price: '5.50', quantity: 1 }),
  createMockCartItem({ productId: 3, name: 'Drink', price: '3.25', quantity: 3 }),
];

export const mockEmptyCart: CartItem[] = [];

export const mockUsers: MockUser[] = [
  createMockUser({ id: 'user-1', name: 'John Doe', email: 'john@example.com' }),
  createMockUser({ id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' }),
];

export const mockSessions: MockSession[] = [
  createMockSession({ user: mockUsers[0] }),
  createMockSession({ user: mockUsers[1] }),
];
