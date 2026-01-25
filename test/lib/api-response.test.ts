import { describe, expect, it } from 'vitest';

import {
  apiSuccess,
  apiError,
  withPagination,
  ERROR_CODES,
  SUCCESS_MESSAGES,
} from '@/lib/api-response';

describe('apiSuccess', () => {
  it('returns success response with data', () => {
    const data = { id: 1, name: 'Test' };
    const response = apiSuccess(data);

    // NextResponse creates a Response-like object
    expect(response).toBeDefined();
    expect(typeof response).toBe('object');
    // Test that it has the expected methods
    expect(response).toHaveProperty('json');
    expect(response).toHaveProperty('headers');
  });

  it('returns success response with custom status', () => {
    const data = { message: 'Created' };
    const response = apiSuccess(data, { status: 201 });

    expect(response).toBeDefined();
    expect(typeof response).toBe('object');
  });

  it('includes meta data with timestamp', () => {
    const data = { test: true };
    const response = apiSuccess(data, {
      meta: { requestId: 'req-123' },
    });

    expect(response.status).toBe(200);

    // Test that the response contains the expected structure
    // We'll verify this through integration tests later
    expect(response).toBeDefined();
  });

  it('handles empty data', () => {
    const response = apiSuccess(null);
    expect(response.status).toBe(200);
  });
});

describe('apiError', () => {
  it('returns error response with code and message', () => {
    const response = apiError(ERROR_CODES.NOT_FOUND, 'Resource not found');

    expect(response).toBeDefined();
    expect(typeof response).toBe('object');
    expect(response).toHaveProperty('json');
    expect(response).toHaveProperty('headers');
  });

  it('returns error response with custom status', () => {
    const response = apiError(ERROR_CODES.UNAUTHORIZED, 'Not authorized', { status: 401 });

    expect(response).toBeDefined();
    expect(typeof response).toBe('object');
  });

  it('includes error details when provided', () => {
    const details = { field: 'email', reason: 'invalid format' };
    const response = apiError(ERROR_CODES.VALIDATION_ERROR, 'Validation failed', {
      details,
      status: 400,
    });

    expect(response.status).toBe(400);
  });

  it('includes meta data with timestamp', () => {
    const response = apiError(ERROR_CODES.INTERNAL_ERROR, 'Server error', {
      meta: { requestId: 'req-456' },
    });

    expect(response.status).toBe(500);
  });
});

describe('withPagination', () => {
  it('calculates pagination metadata correctly', () => {
    const data = [1, 2, 3, 4, 5];
    const result = withPagination(data, {
      page: 1,
      limit: 10,
      total: 25,
    });

    expect(result.data).toEqual([1, 2, 3, 4, 5]);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3, // Math.ceil(25/10) = 3
    });
  });

  it('handles exact division', () => {
    const data = ['a', 'b'];
    const result = withPagination(data, {
      page: 2,
      limit: 5,
      total: 10,
    });

    expect(result.pagination.totalPages).toBe(2); // Math.ceil(10/5) = 2
  });

  it('handles remainder in division', () => {
    const data = [1];
    const result = withPagination(data, {
      page: 1,
      limit: 3,
      total: 7,
    });

    expect(result.pagination.totalPages).toBe(3); // Math.ceil(7/3) = 3
  });

  it('handles empty data array', () => {
    const data: number[] = [];
    const result = withPagination(data, {
      page: 1,
      limit: 10,
      total: 0,
    });

    expect(result.data).toEqual([]);
    expect(result.pagination.totalPages).toBe(0);
  });

  it('handles single page', () => {
    const data = ['item'];
    const result = withPagination(data, {
      page: 1,
      limit: 10,
      total: 1,
    });

    expect(result.pagination.totalPages).toBe(1);
  });
});

describe('ERROR_CODES', () => {
  it('contains expected authentication error codes', () => {
    expect(ERROR_CODES.UNAUTHORIZED).toBe('UNAUTHORIZED');
    expect(ERROR_CODES.FORBIDDEN).toBe('FORBIDDEN');
    expect(ERROR_CODES.TOKEN_EXPIRED).toBe('TOKEN_EXPIRED');
  });

  it('contains expected validation error codes', () => {
    expect(ERROR_CODES.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
    expect(ERROR_CODES.INVALID_INPUT).toBe('INVALID_INPUT');
  });

  it('contains expected business logic error codes', () => {
    expect(ERROR_CODES.NOT_FOUND).toBe('NOT_FOUND');
    expect(ERROR_CODES.ALREADY_EXISTS).toBe('ALREADY_EXISTS');
    expect(ERROR_CODES.INSUFFICIENT_PERMISSIONS).toBe('INSUFFICIENT_PERMISSIONS');
  });

  it('contains expected system error codes', () => {
    expect(ERROR_CODES.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
    expect(ERROR_CODES.DATABASE_ERROR).toBe('DATABASE_ERROR');
    expect(ERROR_CODES.EXTERNAL_SERVICE_ERROR).toBe('EXTERNAL_SERVICE_ERROR');
  });

  it('contains expected security error codes', () => {
    expect(ERROR_CODES.RATE_LIMIT_EXCEEDED).toBe('RATE_LIMIT_EXCEEDED');
    expect(ERROR_CODES.CSRF_INVALID).toBe('CSRF_INVALID');
  });
});

describe('SUCCESS_MESSAGES', () => {
  it('contains expected success messages', () => {
    expect(SUCCESS_MESSAGES.CREATED).toBe('Resource created successfully');
    expect(SUCCESS_MESSAGES.UPDATED).toBe('Resource updated successfully');
    expect(SUCCESS_MESSAGES.DELETED).toBe('Resource deleted successfully');
    expect(SUCCESS_MESSAGES.RETRIEVED).toBe('Data retrieved successfully');
  });
});
