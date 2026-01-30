import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set');
    }

    redis = new Redis({
      url,
      token,
    });
  }
  return redis;
}

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
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
  });
};

// Predefined rate limiters for common scenarios - lazily initialized
let authRateLimitInstance: Ratelimit | null = null;
export const authRateLimit = new Proxy({} as Ratelimit, {
  get(_target, prop) {
    if (!authRateLimitInstance) {
      authRateLimitInstance = rateLimiter(5, '10 m');
    }
    return (authRateLimitInstance as unknown as Record<string | symbol, unknown>)[prop];
  },
});

let passwordResetRateLimitInstance: Ratelimit | null = null;
export const passwordResetRateLimit = new Proxy({} as Ratelimit, {
  get(_target, prop) {
    if (!passwordResetRateLimitInstance) {
      passwordResetRateLimitInstance = rateLimiter(3, '60 m');
    }
    return (passwordResetRateLimitInstance as unknown as Record<string | symbol, unknown>)[prop];
  },
});

let apiRateLimitInstance: Ratelimit | null = null;
export const apiRateLimit = new Proxy({} as Ratelimit, {
  get(_target, prop) {
    if (!apiRateLimitInstance) {
      apiRateLimitInstance = rateLimiter(100, '1 m');
    }
    return (apiRateLimitInstance as unknown as Record<string | symbol, unknown>)[prop];
  },
});

let sensitiveOperationRateLimitInstance: Ratelimit | null = null;
export const sensitiveOperationRateLimit = new Proxy({} as Ratelimit, {
  get(_target, prop) {
    if (!sensitiveOperationRateLimitInstance) {
      sensitiveOperationRateLimitInstance = rateLimiter(10, '1 h');
    }
    return (sensitiveOperationRateLimitInstance as unknown as Record<string | symbol, unknown>)[
      prop
    ];
  },
});

// User-based rate limiting (requires user ID)
export const createUserRateLimiter = (userId: string, requests = 10, window: Duration) => {
  return new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: `user:${userId}`,
  });
};

// IP-based rate limiting with custom prefix
export const createIPRateLimiter = (requests = 10, window: Duration, prefix = 'ip') => {
  return new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix,
  });
};
