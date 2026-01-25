import { describe, expect, it } from 'vitest';

import { canTransition, isValidStatus, validateData } from '@/modules/orders/helpers';
import { ORDER_STATUS } from '@/modules/orders/types';

describe('canTransition', () => {
  it('allows valid status transitions', () => {
    expect(canTransition(ORDER_STATUS.PENDING, ORDER_STATUS.PROCESSING)).toBe(true);
    expect(canTransition(ORDER_STATUS.PROCESSING, ORDER_STATUS.SHIPPED)).toBe(true);
    expect(canTransition(ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED)).toBe(true);
  });

  it('prevents invalid status transitions', () => {
    expect(canTransition(ORDER_STATUS.PENDING, ORDER_STATUS.SHIPPED)).toBe(false);
    expect(canTransition(ORDER_STATUS.DELIVERED, ORDER_STATUS.PENDING)).toBe(false);
    expect(canTransition(ORDER_STATUS.SHIPPED, ORDER_STATUS.PROCESSING)).toBe(false);
  });

  it('prevents transitions from delivered status', () => {
    expect(canTransition(ORDER_STATUS.DELIVERED, ORDER_STATUS.PENDING)).toBe(false);
    expect(canTransition(ORDER_STATUS.DELIVERED, ORDER_STATUS.PROCESSING)).toBe(false);
    expect(canTransition(ORDER_STATUS.DELIVERED, ORDER_STATUS.SHIPPED)).toBe(false);
    expect(canTransition(ORDER_STATUS.DELIVERED, ORDER_STATUS.DELIVERED)).toBe(false);
  });

  it('handles same status transition', () => {
    expect(canTransition(ORDER_STATUS.PENDING, ORDER_STATUS.PENDING)).toBe(false);
    expect(canTransition(ORDER_STATUS.PROCESSING, ORDER_STATUS.PROCESSING)).toBe(false);
  });
});

describe('isValidStatus', () => {
  it('returns true for valid order statuses', () => {
    expect(isValidStatus(ORDER_STATUS.PENDING)).toBe(true);
    expect(isValidStatus(ORDER_STATUS.PROCESSING)).toBe(true);
    expect(isValidStatus(ORDER_STATUS.SHIPPED)).toBe(true);
    expect(isValidStatus(ORDER_STATUS.DELIVERED)).toBe(true);
  });

  it('returns false for invalid statuses', () => {
    expect(isValidStatus('invalid')).toBe(false);
    expect(isValidStatus('')).toBe(false);
    expect(isValidStatus('cancelled')).toBe(false);
    expect(isValidStatus('refunded')).toBe(false);
  });

  it('returns false for partial matches', () => {
    expect(isValidStatus('pend')).toBe(false);
    expect(isValidStatus('processing_')).toBe(false);
  });

  it('is case sensitive', () => {
    expect(isValidStatus('PENDING')).toBe(true); // ORDER_STATUS.PENDING is uppercase
    expect(isValidStatus('pending')).toBe(false);
  });
});

describe('validateData', () => {
  it('validates and returns data for valid input', () => {
    const schema = { safeParse: () => ({ data: 'valid', error: null, success: true }) };
    const result = validateData(schema as any, 'input');
    expect(result).toBe('valid');
  });

  it('throws error for invalid input', () => {
    const mockError = {
      issues: [{ message: 'Invalid input' }],
    };
    const schema = {
      safeParse: () => ({
        data: null,
        error: mockError,
        success: false,
      }),
    };

    expect(() => validateData(schema as any, 'invalid')).toThrow('Invalid input');
  });

  it('throws error with cause containing validation error', () => {
    const mockError = {
      issues: [{ message: 'Required field missing' }],
    };
    const schema = {
      safeParse: () => ({
        data: null,
        error: mockError,
        success: false,
      }),
    };

    expect(() => validateData(schema as any, {})).toThrow('Required field missing');
  });

  it('handles complex validation schemas', () => {
    const schema = {
      safeParse: () => ({
        data: { name: 'John', age: 30 },
        error: null,
        success: true,
      }),
    };

    const input = { name: 'John', age: 30 };
    const result = validateData(schema as any, input);

    expect(result).toEqual({ name: 'John', age: 30 });
  });
});
