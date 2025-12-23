import path from 'path';

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Create the logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
const errorLogsDir = path.join(process.cwd(), 'error-logs');

// Custom format for file output (no colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Disable console transport to avoid stdout issues in server environments
// Only use file transports for logging

// Error log file transport (daily rotation) - tracked in git for post-mortem analysis
const errorFileTransport = new DailyRotateFile({
  level: 'error',
  filename: path.join(errorLogsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: fileFormat,
  handleExceptions: true,
  handleRejections: true,
});

// Combined log file transport (daily rotation)
const combinedFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: fileFormat,
});

// HTTP log file transport for API requests
const httpFileTransport = new DailyRotateFile({
  level: 'http',
  filename: path.join(logsDir, 'http-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: fileFormat,
});

// Create the logger instance
let loggerInstance: winston.Logger;

try {
  // Environment-specific configuration
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Default log level based on environment
  const defaultLevel = isProduction ? 'warn' : isDevelopment ? 'debug' : 'info';
  const logLevel = process.env.LOG_LEVEL ?? defaultLevel;

  // In production, reduce console noise and focus on file logging
  const transports: winston.transport[] = [
    errorFileTransport,
    combinedFileTransport,
    httpFileTransport,
  ];

  // Add console transport only in development
  if (isDevelopment) {
    transports.push(
      new winston.transports.Console({
        level: logLevel,
        format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
      })
    );
  }

  loggerInstance = winston.createLogger({
    level: logLevel,
    levels,
    transports,
    exitOnError: false,
  });
} catch (_error) {
  // Fallback logger if Winston initialization fails
  loggerInstance = {
    error: (message: string) => console.error(`[ERROR] ${message}`),
    warn: (message: string) => console.warn(`[WARN] ${message}`),
    info: (message: string) => console.log(`[INFO] ${message}`),
    http: (message: string) => console.log(`[HTTP] ${message}`),
    debug: (message: string) => console.log(`[DEBUG] ${message}`),
  } as winston.Logger;
}

export const logger = loggerInstance;

// Add request logging middleware
export function createRequestLogger() {
  return (req: Request, _res?: Response, next?: () => void) => {
    const url = req.url;
    const method = req.method;
    const userAgent = req.headers.get('user-agent') ?? 'unknown';

    logger.http(`${method} ${url} - User-Agent: ${userAgent}`);

    // For Next.js API routes, we don't have response object
    // So we'll just log the request
    if (next) next();
  };
}

// Error logging helper
export async function logError(error: Error, context?: Record<string, unknown>) {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    context,
    timestamp: new Date().toISOString(),
  });

  // Send to Sentry in production or when explicitly configured
  if ((process.env.NODE_ENV === 'production' || process.env.SENTRY_DEV) && process.env.SENTRY_DSN) {
    try {
      const Sentry = await import('@sentry/nextjs');
      Sentry.captureException(error, {
        tags: {
          logger: 'winston',
          component: 'error-utils',
          environment: process.env.NODE_ENV,
        },
        extra: context,
        level: 'error',
      });
    } catch (sentryError) {
      // Fallback to console if Sentry fails
      console.error('Failed to send error to Sentry:', sentryError);
    }
  }
}

// Performance logging helper
export function logPerformance(
  operation: string,
  duration: number,
  context?: Record<string, unknown>
) {
  logger.info('Performance', {
    operation,
    duration: `${duration}ms`,
    context,
    timestamp: new Date().toISOString(),
  });
}

// Security event logging helper
export function logSecurity(event: string, details: Record<string, unknown>) {
  logger.warn('Security Event', {
    event,
    details,
    timestamp: new Date().toISOString(),
  });
}

// Database operation logging helper
export function logDatabase(
  operation: string,
  table: string,
  duration?: number,
  context?: Record<string, unknown>
) {
  logger.debug('Database Operation', {
    operation,
    table,
    duration: duration ? `${duration}ms` : undefined,
    context,
    timestamp: new Date().toISOString(),
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Logger shutting down gracefully');
  logger.end();
});

process.on('SIGTERM', () => {
  logger.info('Logger shutting down gracefully');
  logger.end();
});

// Export types for TypeScript
export type Logger = typeof logger;
