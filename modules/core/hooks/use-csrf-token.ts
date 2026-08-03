'use client';

import { useCallback } from 'react';

let cachedToken: string | null = null;

/**
 * Clears the cached CSRF token. Called on logout so a token minted for the
 * previous session is never reused after the session cookie changes.
 */
export function clearCSRFTokenCache() {
  cachedToken = null;
}

/**
 * Returns a CSRF token for admin mutations. The token is fetched once from
 * `/api/csrf` and cached for the session. Falls back to an empty string so the
 * caller can still surface a friendly error when the request fails.
 */
export function useCSRFToken() {
  const getToken = useCallback(async (): Promise<string> => {
    if (cachedToken) return cachedToken;

    try {
      const response = await fetch('/api/csrf', { method: 'GET' });
      if (!response.ok) return '';
      const result = (await response.json()) as { data?: { csrf_token?: string } };
      cachedToken = result?.data?.csrf_token ?? '';
      return cachedToken;
    } catch {
      return '';
    }
  }, []);

  return { getToken };
}
