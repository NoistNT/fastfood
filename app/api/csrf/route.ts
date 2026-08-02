import { generateCSRFToken } from '@/lib/csrf';
import { apiSuccess, apiError, ERROR_CODES } from '@/lib/api-response';

export async function GET() {
  try {
    const token = await generateCSRFToken();
    return apiSuccess({ csrf_token: token });
  } catch (_error) {
    return apiError(ERROR_CODES.UNAUTHORIZED, 'Authentication required', { status: 401 });
  }
}
