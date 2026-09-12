import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { errorMessage, logError, sanitizeLogMeta } from '@/lib/log-error';

describe('sanitizeLogMeta', () => {
  it('drops PII, bodies, tokens, and user agents', () => {
    expect(
      sanitizeLogMeta({
        email: 'a@b.com',
        phone: '123',
        phoneNumber: '123',
        name: 'Ana',
        fullName: 'Ana',
        contactName: 'Ana',
        contactPhone: '123',
        address: 'x',
        deliveryAddress: 'x',
        body: 'payload',
        password: 'x',
        passwordHash: 'x',
        passwordConfirm: 'x',
        token: 'x',
        secret: 'x',
        session: 'x',
        csrf: 'x',
        authorization: 'x',
        cookie: 'x',
        userAgent: 'x',
        orderId: 'o1',
      })
    ).toEqual({ orderId: 'o1' });
  });

  it('keeps correlation IDs and operational context', () => {
    expect(
      sanitizeLogMeta({ orderId: 'o1', trackingCode: 'FF-1', ingredientId: 7, cause: 'db down' })
    ).toEqual({ orderId: 'o1', trackingCode: 'FF-1', ingredientId: 7, cause: 'db down' });
  });

  it('handles missing metadata', () => {
    expect(sanitizeLogMeta()).toEqual({});
    expect(sanitizeLogMeta({ cause: undefined })).toEqual({ cause: null });
  });
});

describe('errorMessage', () => {
  it('extracts Error messages', () => {
    expect(errorMessage(new Error('db down'))).toBe('db down');
  });

  it('falls back for non-errors', () => {
    expect(errorMessage('string')).toBe('non-error thrown');
    expect(errorMessage(null)).toBe('non-error thrown');
  });
});

describe('logError', () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    errorSpy.mockClear();
  });

  afterEach(() => {
    errorSpy.mockReset();
  });

  it('logs a scoped line with sanitized metadata', () => {
    logError('orders', 'Order creation failed', { userId: 'u1', email: 'a@b.com' });

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith('[orders] Order creation failed', { userId: 'u1' });
  });
});
