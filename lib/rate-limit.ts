import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

type Duration =
  `${number} ${'ms' | 's' | 'm' | 'h' | 'd'}` | `${number}${'ms' | 's' | 'm' | 'h' | 'd'}`;

const redis = Redis.fromEnv();

function createLimiter(requests: number, window: Duration, prefix: string) {
  return new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(requests, window), prefix });
}

export const authRateLimit = createLimiter(5, '10 m', 'ratelimit:auth');
export const passwordResetRateLimit = createLimiter(3, '60 m', 'ratelimit:password-reset');
export const apiRateLimit = createLimiter(100, '1 m', 'ratelimit:api');
export const sensitiveOperationRateLimit = createLimiter(10, '1 h', 'ratelimit:sensitive');

export function rateLimiter(requests = 10, window: Duration, prefix = 'ratelimit') {
  return createLimiter(requests, window, prefix);
}

export function createUserRateLimiter(userId: string, requests = 10, window: Duration) {
  return createLimiter(requests, window, `ratelimit:user:${userId}`);
}

export function createIPRateLimiter(requests = 10, window: Duration, prefix = 'ip') {
  return createLimiter(requests, window, `ratelimit:${prefix}`);
}
