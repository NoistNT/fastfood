import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

type Duration =
  `${number} ${'ms' | 's' | 'm' | 'h' | 'd'}` | `${number}${'ms' | 's' | 'm' | 'h' | 'd'}`;

const env = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development';

function windowToMs(window: Duration): number {
  const match = window.match(/^(\d+)\s*(ms|s|m|h|d)$/);
  if (!match) return 60_000;

  const amount = Number(match[1]);
  switch (match[2]) {
    case 'ms':
      return amount;
    case 's':
      return amount * 1000;
    case 'm':
      return amount * 60_000;
    case 'h':
      return amount * 3_600_000;
    default:
      return amount * 86_400_000;
  }
}

// Connect to Upstash only when configured. If Redis is unavailable or throws,
// fall back to an in-process limiter so auth/order flows never hard-fail on a
// missing or misconfigured rate-limit backend.
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
if (redisUrl && redisToken) {
  try {
    redis = new Redis({ url: redisUrl, token: redisToken });
  } catch (error) {
    console.error('Failed to initialize Upstash Redis, using in-memory rate limiting:', error);
    redis = null;
  }
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  pending?: Promise<unknown>;
}

class RateLimiter {
  private readonly requests: number;
  private readonly windowMs: number;
  private readonly prefix: string;
  private readonly limiter: Ratelimit | null;
  private readonly memoryHits = new Map<string, number[]>();

  constructor(requests: number, window: Duration, prefix: string) {
    this.requests = requests;
    this.windowMs = windowToMs(window);
    this.prefix = prefix;
    this.limiter = redis
      ? new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(requests, window),
          prefix: `${env}:${prefix}`,
        })
      : null;
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    if (this.limiter) {
      try {
        return await this.limiter.limit(identifier);
      } catch (error) {
        console.error(
          `Redis rate limiter failed for "${this.prefix}", falling back to in-memory:`,
          error
        );
      }
    }
    return this.memoryLimit(identifier);
  }

  private memoryLimit(identifier: string): RateLimitResult {
    const now = Date.now();
    const key = `${this.prefix}:${identifier}`;
    const recentHits = (this.memoryHits.get(key) ?? []).filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    // Trim expired entries instead of clearing everything, so one noisy prefix
    // doesn't reset the counters of every other caller.
    if (this.memoryHits.size > 10_000) {
      for (const [mapKey, hits] of this.memoryHits) {
        if (hits.every((timestamp) => now - timestamp >= this.windowMs)) {
          this.memoryHits.delete(mapKey);
        }
      }
    }

    const success = recentHits.length < this.requests;
    if (success) {
      recentHits.push(now);
      this.memoryHits.set(key, recentHits);
    }

    return {
      success,
      limit: this.requests,
      remaining: Math.max(0, this.requests - recentHits.length),
      reset: recentHits.length > 0 ? recentHits[0] + this.windowMs : now + this.windowMs,
    };
  }
}

export const authRateLimit = new RateLimiter(5, '10 m', 'ratelimit:auth');
export const passwordResetRateLimit = new RateLimiter(3, '60 m', 'ratelimit:password-reset');
export const apiRateLimit = new RateLimiter(100, '1 m', 'ratelimit:api');
export const sensitiveOperationRateLimit = new RateLimiter(10, '1 h', 'ratelimit:sensitive');

export function rateLimiter(requests = 10, window: Duration, prefix = 'ratelimit') {
  return new RateLimiter(requests, window, prefix);
}

export function createUserRateLimiter(userId: string, requests = 10, window: Duration) {
  return new RateLimiter(requests, window, `ratelimit:user:${userId}`);
}

export function createIPRateLimiter(requests = 10, window: Duration, prefix = 'ip') {
  return new RateLimiter(requests, window, `ratelimit:${prefix}`);
}
