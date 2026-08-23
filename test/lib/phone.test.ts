import { describe, expect, it } from 'vitest';

import { normalizePhoneNumber } from '@/lib/phone';

describe('normalizePhoneNumber', () => {
  it('strips formatting from local numbers', () => {
    expect(normalizePhoneNumber('(011) 4444-5555')).toBe('01144445555');
  });

  it('collapses international variants to the same key', () => {
    expect(normalizePhoneNumber('+54 9 11 2345-6789')).toBe(normalizePhoneNumber('549112345 6789'));
  });

  it('returns empty string for nullish input', () => {
    expect(normalizePhoneNumber(null)).toBe('');
    expect(normalizePhoneNumber(undefined)).toBe('');
    expect(normalizePhoneNumber('')).toBe('');
  });

  it('keeps already-normalized values untouched', () => {
    expect(normalizePhoneNumber('5491123456789')).toBe('5491123456789');
  });
});
