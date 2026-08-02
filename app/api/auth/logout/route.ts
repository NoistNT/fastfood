import { logout } from '@/lib/auth/session';
import { apiSuccess, apiError, ERROR_CODES } from '@/lib/api-response';

export async function POST() {
  try {
    await logout();
    return apiSuccess({});
  } catch (error) {
    console.error('Logout error:', error);
    return apiError(ERROR_CODES.INTERNAL_ERROR, 'Internal server error', { status: 500 });
  }
}
