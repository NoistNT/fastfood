import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  businessDayWindow,
  formatDate,
  formatDateTime,
  formatTime,
  getBusinessTimeZone,
  toBusinessDateKey,
} from '@/lib/dates';

const TIME_ZONE_KEY = 'NEXT_PUBLIC_BUSINESS_TIMEZONE';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getBusinessTimeZone', () => {
  it('defaults to UTC when unconfigured', () => {
    vi.stubEnv(TIME_ZONE_KEY, '');
    expect(getBusinessTimeZone()).toBe('UTC');
  });

  it('accepts a valid IANA zone', () => {
    vi.stubEnv(TIME_ZONE_KEY, 'America/Argentina/Buenos_Aires');
    expect(getBusinessTimeZone()).toBe('America/Argentina/Buenos_Aires');
  });

  it('falls back to UTC on an invalid zone', () => {
    vi.stubEnv(TIME_ZONE_KEY, 'Bogus/Zone');
    expect(getBusinessTimeZone()).toBe('UTC');
  });
});

describe('businessDayWindow', () => {
  it('buckets a 22:00 ART order to its local day, not the UTC day', () => {
    vi.stubEnv(TIME_ZONE_KEY, 'America/Argentina/Buenos_Aires');
    // 22:00 local (ART = UTC-3) is 01:00 UTC the next day.
    const { start, end } = businessDayWindow('2026-09-11T22:00:00-03:00');
    expect(start.toISOString()).toBe('2026-09-11T03:00:00.000Z');
    expect(end.toISOString()).toBe('2026-09-12T03:00:00.000Z');
  });

  it('stays correct across a spring-forward DST transition', () => {
    vi.stubEnv(TIME_ZONE_KEY, 'America/New_York');
    // 2026-03-08 is 23 hours long in New York.
    const { start, end } = businessDayWindow('2026-03-08T12:00:00-04:00');
    expect(end.getTime() - start.getTime()).toBe(23 * 60 * 60 * 1000);
    expect(start.toISOString()).toBe('2026-03-08T05:00:00.000Z');
  });

  it('stays correct across a fall-back DST transition', () => {
    vi.stubEnv(TIME_ZONE_KEY, 'America/New_York');
    // 2026-11-01 is 25 hours long in New York.
    const { start, end } = businessDayWindow('2026-11-01T12:00:00-05:00');
    expect(end.getTime() - start.getTime()).toBe(25 * 60 * 60 * 1000);
  });

  it('defaults to UTC day boundaries', () => {
    vi.stubEnv(TIME_ZONE_KEY, '');
    const { start, end } = businessDayWindow('2026-09-11T22:00:00Z');
    expect(start.toISOString()).toBe('2026-09-11T00:00:00.000Z');
    expect(end.toISOString()).toBe('2026-09-12T00:00:00.000Z');
  });
});

describe('formatters', () => {
  it('pins display to the business zone regardless of viewer timezone', () => {
    vi.stubEnv(TIME_ZONE_KEY, 'UTC');
    vi.stubEnv('TZ', 'Pacific/Kiritimati'); // UTC+14: bare toLocale* would show Jan 2
    expect(formatDate('2026-01-01T10:00:00Z', { locale: 'en-US' })).toBe('01/01/2026');
  });

  it('formats dates in viewer locale order', () => {
    vi.stubEnv(TIME_ZONE_KEY, 'UTC');
    expect(formatDate('2026-09-05T12:00:00Z', { locale: 'en-US' })).toBe('09/05/2026');
    expect(formatDate('2026-09-05T12:00:00Z', { locale: 'es' })).toBe('05/09/2026');
  });

  it('formats times and datetimes with the business zone', () => {
    vi.stubEnv(TIME_ZONE_KEY, 'America/Argentina/Buenos_Aires');
    expect(formatTime('2026-09-11T22:30:00Z', { locale: 'en-US' })).toBe('07:30 PM');
    expect(formatDateTime('2026-09-11T22:30:00Z', { locale: 'en-US' })).toBe(
      '09/11/2026, 07:30 PM'
    );
  });
});

describe('toBusinessDateKey', () => {
  it('keys by business-local day', () => {
    vi.stubEnv(TIME_ZONE_KEY, 'America/Argentina/Buenos_Aires');
    expect(toBusinessDateKey('2026-09-11T22:00:00-03:00')).toBe('2026-09-11');
    expect(toBusinessDateKey('2026-09-12T02:59:59Z')).toBe('2026-09-11');
  });
});
