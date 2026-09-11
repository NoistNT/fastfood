/**
 * Privacy-bounded error logging. Server logs are the only trace we have when
 * the admins report a problem over WhatsApp, so errors must carry enough to
 * debug — but never personal data. This is the single choke point:
 * correlation IDs (order, tracking, ingredient) and curated messages go
 * through; PII, bodies, tokens, and user agents are dropped.
 */

const BLOCKED_KEYS = new Set([
  'email',
  'phone',
  'phoneNumber',
  'name',
  'fullName',
  'contactName',
  'contactPhone',
  'address',
  'deliveryAddress',
  'deliveryNotes',
  'notes',
  'body',
  'password',
  'passwordHash',
  'passwordConfirm',
  'confirmPassword',
  'token',
  'secret',
  'session',
  'csrf',
  'authorization',
  'cookie',
  'cookies',
  'userAgent',
  'user-agent',
]);

export type LogMeta = Record<string, string | number | boolean | null | undefined>;

/** Strips blocked keys from log metadata; everything else passes through. */
export function sanitizeLogMeta(meta?: LogMeta): Record<string, string | number | boolean | null> {
  if (!meta) return {};
  const clean: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (BLOCKED_KEYS.has(key)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[logError] dropped blocked key: ${key}`);
      }
      continue;
    }
    clean[key] = value ?? null;
  }
  return clean;
}

/** Safely extracts a message from anything thrown. */
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'non-error thrown';
}

/** Logs a scoped, privacy-bounded error line. */
export function logError(scope: string, message: string, meta?: LogMeta): void {
  console.error(`[${scope}] ${message}`, sanitizeLogMeta(meta));
}
