import Tokens from 'csrf';

import { getSession } from '@/lib/auth/session';

const tokens = new Tokens();

export async function generateCSRFToken(): Promise<string> {
  const session = await getSession();

  if (!session?.id) {
    throw new Error('User must be authenticated to generate CSRF token');
  }

  // Use user ID as the secret for consistency across requests
  const secret = session.id;
  return tokens.create(secret);
}

export async function verifyCSRFToken(token: string): Promise<boolean> {
  try {
    const session = await getSession();

    if (!session?.id) {
      return false;
    }

    const secret = session.id;
    return tokens.verify(secret, token);
  } catch {
    return false;
  }
}

export async function getCSRFTokenFromRequest(request: Request): Promise<string | null> {
  // Check header first, then form data, then query params
  const headerToken = request.headers.get('x-csrf-token');
  if (headerToken) return headerToken;

  // For form submissions, check the form data
  if (
    request.method === 'POST' &&
    request.headers.get('content-type')?.includes('application/x-www-form-urlencoded')
  ) {
    const formData = await request.formData();
    return (formData.get('csrf_token') as string) || null;
  }

  // For JSON requests, check the body (would need to parse JSON)
  // This is simplified - in production you'd want to handle JSON bodies properly

  return null;
}

export function createCSRFMiddleware() {
  return async (request: Request): Promise<Response | null> => {
    // Skip CSRF for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return null;
    }

    const token = await getCSRFTokenFromRequest(request);

    if (!token) {
      return new Response('CSRF token missing', { status: 403 });
    }

    const isValid = await verifyCSRFToken(token);

    if (!isValid) {
      return new Response('CSRF token invalid', { status: 403 });
    }

    return null; // Continue to next handler
  };
}
