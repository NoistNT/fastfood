import type { ReactNode } from 'react';

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { useAuth, AuthProvider } from '@/modules/auth/context/auth-context';
import { type UserWithRoles } from '@/types/auth';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    mockFetch.mockReset();
    // Default mock for session check - returns not authenticated
    mockFetch.mockResolvedValue({
      ok: false,
    });
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('throws error when used outside AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider'
    );
  });

  it('initializes with loading state and no user', async () => {
    // Ensure fetch is mocked before rendering to prevent act() warnings
    mockFetch.mockResolvedValueOnce({
      ok: false,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for the initial async session check to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('fetches user session on mount', async () => {
    const mockUser: UserWithRoles = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hashed',
      phoneNumber: null,
      lastLoginAt: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [{ id: 1, name: 'user', description: 'User role' }],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ user: mockUser }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/session');
  });

  it('handles session fetch failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('handles login success', async () => {
    const mockUser: UserWithRoles = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hashed',
      phoneNumber: null,
      lastLoginAt: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [{ id: 1, name: 'user', description: 'User role' }],
    };

    mockFetch.mockResolvedValueOnce({
      ok: false, // Initial session check fails
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ user: mockUser }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let loginResult = false;
    await act(async () => {
      loginResult = await result.current.login('test@example.com', 'password');
    });

    expect(loginResult).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(mockPush).toHaveBeenCalledWith('/');
    expect(mockFetch).toHaveBeenLastCalledWith('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
    });
  });

  it('handles login failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false, // Initial session check fails
    });

    mockFetch.mockResolvedValueOnce({
      ok: false, // Login fails
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let loginResult = true;
    await act(async () => {
      loginResult = await result.current.login('test@example.com', 'wrongpassword');
    });

    expect(loginResult).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('handles login network error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false, // Initial session check fails
    });

    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let loginResult = true;
    await act(async () => {
      loginResult = await result.current.login('test@example.com', 'password');
    });

    expect(loginResult).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('handles logout success', async () => {
    const mockUser: UserWithRoles = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hashed',
      phoneNumber: null,
      lastLoginAt: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [{ id: 1, name: 'user', description: 'User role' }],
    };

    // Setup initial authenticated state
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ user: mockUser }),
    });

    mockFetch.mockResolvedValueOnce({
      ok: true, // Logout succeeds
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
    expect(mockPush).toHaveBeenCalledWith('/login');
    expect(mockFetch).toHaveBeenLastCalledWith('/api/auth/logout', {
      method: 'POST',
    });
  });

  it('handles logout failure gracefully', async () => {
    const mockUser: UserWithRoles = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hashed',
      phoneNumber: null,
      lastLoginAt: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [{ id: 1, name: 'user', description: 'User role' }],
    };

    // Setup initial authenticated state
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ user: mockUser }),
    });

    mockFetch.mockRejectedValueOnce(new Error('Logout failed'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    await act(async () => {
      await result.current.logout();
    });

    // Should still clear user even if logout request fails
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('sets loading state during operations', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false, // Initial session check fails
    });

    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () =>
                  Promise.resolve({
                    user: { id: '1', email: 'test@example.com', name: 'Test', roles: ['user'] },
                  }),
              }),
            100
          )
        )
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let loadingStates: boolean[] = [];
    const recordLoading = () => loadingStates.push(result.current.loading);

    act(() => {
      recordLoading();
      result.current.login('test@example.com', 'password').then(() => recordLoading());
    });

    recordLoading();

    // Should have captured loading states: false (initial), true (during login), false (after login)
    expect(loadingStates.some((state) => state === true)).toBe(true);
  });
});
