import { NextResponse } from 'next/server';

// Standard API response structure
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Success response helper
export function apiSuccess<T>(
  data: T,
  options: {
    status?: number;
    meta?: Partial<ApiResponse['meta']>;
  } = {}
): NextResponse<ApiResponse<T>> {
  const { status = 200, meta } = options;

  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  return NextResponse.json(response, { status });
}

// Error response helper
export function apiError(
  code: string,
  message: string,
  options: {
    status?: number;
    details?: unknown;
    meta?: Partial<ApiResponse['meta']>;
  } = {}
): NextResponse<ApiResponse<never>> {
  const { status = 500, details, meta } = options;

  const response: ApiResponse<never> = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  return NextResponse.json(response, { status });
}

// Pagination helper - returns data with pagination metadata
export function withPagination<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  }
) {
  const { page, limit, total } = pagination;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

// Common error codes
export const ERROR_CODES = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // Business logic errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // System errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Security
  CSRF_INVALID: 'CSRF_INVALID',
} as const;

// Common success responses
export const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  RETRIEVED: 'Data retrieved successfully',
} as const;

// Type helpers
export type ApiResponseType<T> = ApiResponse<T>;
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
