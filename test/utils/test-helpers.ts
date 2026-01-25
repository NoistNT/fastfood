// Test utilities for common mocking patterns and type-safe test helpers

import type { MockApiResponse } from '@/test/types/test-types';

import { vi } from 'vitest';

/**
 * Type-safe mock function creator for API responses
 */
export const createMockApiFunction = <TArgs extends unknown[], TReturn>(
  implementation?: (...args: TArgs) => TReturn
) => {
  const mockFn = vi.fn(implementation);
  return mockFn as typeof mockFn & {
    mockResolvedValue: (value: TReturn) => typeof mockFn;
    mockRejectedValue: (value: unknown) => typeof mockFn;
    mockReturnValue: (value: TReturn) => typeof mockFn;
  };
};

/**
 * Helper to create a properly typed mock response for API functions
 */
export const mockApiResponse = <T>(
  success: boolean,
  data?: T,
  errorMessage?: string
): MockApiResponse<T> => ({
  success,
  ...(data && { data }),
  ...(errorMessage && { error: { message: errorMessage } }),
});

/**
 * Type-safe mock for database operations
 */
export const createMockDbOperation = <TResult>(result: TResult) => {
  return vi.fn().mockResolvedValue(result);
};

/**
 * Helper for creating mock error responses
 */
export const mockApiError = (message: string, code?: string) => ({
  success: false,
  error: { message, ...(code && { code }) },
});

/**
 * Utility for type-safe mocking of complex objects with partial overrides
 */
export const createMockWithOverrides = <T extends Record<string, unknown>>(
  base: T,
  overrides: Partial<T> = {}
): T => ({
  ...base,
  ...overrides,
});

/**
 * Helper for mocking date-dependent operations
 */
export const mockCurrentDate = (date: Date = new Date()) => {
  const mockDate = new Date(date);
  vi.useFakeTimers();
  vi.setSystemTime(mockDate);
  return mockDate;
};

/**
 * Reset all mocks helper
 */
export const resetAllMocks = () => {
  vi.clearAllMocks();
  vi.resetAllMocks();
};

/**
 * Helper for testing async operations with proper error handling
 * Returns the error if thrown, or throws if no error
 */
export const expectAsyncToThrow = async (asyncFn: () => Promise<unknown>): Promise<Error> => {
  try {
    await asyncFn();
    throw new Error('Expected function to throw');
  } catch (error) {
    if (error instanceof Error) {
      return error;
    }
    throw error;
  }
};

/**
 * Type-safe test data validator
 */
export const validateTestData = <T>(data: unknown, validator: (item: unknown) => item is T): T => {
  if (!validator(data)) {
    throw new Error('Test data validation failed');
  }
  return data;
};
