import { init } from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

init({
  dsn: SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Don't send events in development unless explicitly configured
    if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEV) {
      return null;
    }
    return event;
  },
});
