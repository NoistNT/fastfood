import { getSession } from '@/lib/auth/session';
import { apiSuccess, apiError, ERROR_CODES } from '@/lib/api-response';

export async function GET() {
  try {
    const user = await getSession();
    return apiSuccess({ user });
  } catch (error) {
    console.error('Session error:', error);
    return apiError(ERROR_CODES.INTERNAL_ERROR, 'Failed to retrieve session', { status: 500 });
  }
}
