import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set');
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

type Duration =
  | `${number} s`
  | `${number} m`
  | `${number} h`
  | `${number} d`
  | `${number} ms`
  | `${number}s`
  | `${number}m`
  | `${number}h`
  | `${number}d`
  | `${number}ms`;

export const rateLimiter = (requests = 10, window: Duration) => {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
  });
};

// Predefined rate limiters for common scenarios
export const authRateLimit = rateLimiter(5, '10 m'); // Authentication attempts
export const passwordResetRateLimit = rateLimiter(3, '60 m'); // Password reset requests
export const apiRateLimit = rateLimiter(100, '1 m'); // General API calls
export const sensitiveOperationRateLimit = rateLimiter(10, '1 h'); // Sensitive operations like account deletion

// User-based rate limiting (requires user ID)
export const createUserRateLimiter = (userId: string, requests = 10, window: Duration) => {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: `user:${userId}`,
  });
};

// IP-based rate limiting with custom prefix
export const createIPRateLimiter = (requests = 10, window: Duration, prefix = 'ip') => {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix,
  });
};
