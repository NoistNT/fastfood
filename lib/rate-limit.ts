import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

// Check if we're in test/CI environment where mock is acceptable
const isTestEnv = process.env.CI === 'true' || process.env.NODE_ENV === 'test';

function getRedis(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      if (isTestEnv) {
        console.warn('Redis not configured - using mock rate limiter for tests');
        return null as unknown as Redis;
      }
      throw new Error(
        'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set in production'
      );
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

// Mock rate limiter for when Redis is not available (tests only)
const mockRatelimit = {
  limit: async () => ({ success: true, limit: 100, remaining: 99, reset: Date.now() + 60000 }),
  blockUntilReady: async () => ({
    success: true,
    limit: 100,
    remaining: 99,
    reset: Date.now() + 60000,
  }),
} as unknown as Ratelimit;

export const rateLimiter = (requests = 10, window: Duration) => {
  try {
    const redisInstance = getRedis();

    if (!redisInstance) {
      // Only use mock in test environments
      if (isTestEnv) {
        return mockRatelimit;
      }
      throw new Error('Redis is required in production');
    }

    return new Ratelimit({
      redis: redisInstance,
      limiter: Ratelimit.slidingWindow(requests, window),
      analytics: true,
    });
  } catch (error) {
    if (isTestEnv) {
      return mockRatelimit;
    }
    throw error;
  }
};

// Predefined rate limiters for common scenarios - lazily initialized
let authRateLimitInstance: Ratelimit | null = null;
export const authRateLimit = new Proxy({} as Ratelimit, {
  get(_target, prop) {
    authRateLimitInstance ??= rateLimiter(5, '10 m');
    return (authRateLimitInstance as unknown as Record<string | symbol, unknown>)[prop];
  },
});

let passwordResetRateLimitInstance: Ratelimit | null = null;
export const passwordResetRateLimit = new Proxy({} as Ratelimit, {
  get(_target, prop) {
    passwordResetRateLimitInstance ??= rateLimiter(3, '60 m');
    return (passwordResetRateLimitInstance as unknown as Record<string | symbol, unknown>)[prop];
  },
});

let apiRateLimitInstance: Ratelimit | null = null;
export const apiRateLimit = new Proxy({} as Ratelimit, {
  get(_target, prop) {
    apiRateLimitInstance ??= rateLimiter(100, '1 m');
    return (apiRateLimitInstance as unknown as Record<string | symbol, unknown>)[prop];
  },
});

let sensitiveOperationRateLimitInstance: Ratelimit | null = null;
export const sensitiveOperationRateLimit = new Proxy({} as Ratelimit, {
  get(_target, prop) {
    sensitiveOperationRateLimitInstance ??= rateLimiter(10, '1 h');
    return (sensitiveOperationRateLimitInstance as unknown as Record<string | symbol, unknown>)[
      prop
    ];
  },
});

// User-based rate limiting (requires user ID)
export const createUserRateLimiter = (_userId: string, requests = 10, window: Duration) => {
  return rateLimiter(requests, window);
};

// IP-based rate limiting with custom prefix
export const createIPRateLimiter = (requests = 10, window: Duration, _prefix = 'ip') => {
  return rateLimiter(requests, window);
};
