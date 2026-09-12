/**
 * Business clock: every displayed or bucketed date is anchored to one
 * fork-level IANA timezone, with UTC instants underneath.
 *
 * Writes stay UTC instants (DB `timestamp`s); conversion happens at the
 * edges only: formatting for display, day-windows for filtering, and
 * `AT TIME ZONE` day buckets in SQL. Stdlib Intl throughout — no date
 * library. Trunk default is UTC (neutral: zero behavior change).
 */

const DEFAULT_TIME_ZONE = 'UTC';
const TIME_ZONE_ENV_KEY = 'NEXT_PUBLIC_BUSINESS_TIMEZONE';

export interface DateFormatOptions {
  /** Viewer locale (next-intl `useLocale()`/`getLocale()`); runtime default when omitted. */
  locale?: string;
  timeZone?: string;
  day?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  year?: 'numeric' | '2-digit';
  weekday?: 'long' | 'short' | 'narrow';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
}

/** Fork-level IANA zone, validated; invalid or missing config falls back to UTC. */
export function getBusinessTimeZone(): string {
  const configured = process.env[TIME_ZONE_ENV_KEY]?.trim();
  if (!configured) return DEFAULT_TIME_ZONE;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: configured });
    return configured;
  } catch {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[dates] invalid ${TIME_ZONE_ENV_KEY}="${configured}", falling back to UTC`);
    }
    return DEFAULT_TIME_ZONE;
  }
}

const toDate = (value: Date | string | number): Date =>
  value instanceof Date ? value : new Date(value);

/**
 * UTC offset of `timeZone` at `instant`, in milliseconds (local − UTC, so
 * America/Argentina/Buenos_Aires yields −3h). Derived from stdlib Intl wall
 * parts — no date library.
 */
function zoneOffsetMs(instant: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(instant));
  const part = (type: string): number => Number(parts.find((entry) => entry.type === type)?.value);
  const asUTC = Date.UTC(
    part('year'),
    part('month') - 1,
    part('day'),
    part('hour'),
    part('minute'),
    part('second')
  );
  return asUTC - instant;
}

/**
 * UTC instant of a wall-clock time in `timeZone`. Iterated so midnight
 * transitions converge (midnight is never ambiguous in practice).
 */
function utcForWallTime(
  year: number,
  month: number,
  day: number,
  timeZone: string,
  hour = 0,
  minute = 0
): Date {
  let guess = Date.UTC(year, month - 1, day, hour, minute);
  for (let i = 0; i < 3; i++) {
    guess = Date.UTC(year, month - 1, day, hour, minute) - zoneOffsetMs(guess, timeZone);
  }
  return new Date(guess);
}

export function formatDate(value: Date | string | number, options: DateFormatOptions = {}): string {
  const { locale, timeZone = getBusinessTimeZone(), ...fields } = options;
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone,
    ...fields,
  }).format(toDate(value));
}

export function formatTime(value: Date | string | number, options: DateFormatOptions = {}): string {
  const { locale, timeZone = getBusinessTimeZone(), ...fields } = options;
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
    ...fields,
  }).format(toDate(value));
}

export function formatDateTime(
  value: Date | string | number,
  options: DateFormatOptions = {}
): string {
  const { locale, timeZone = getBusinessTimeZone(), ...fields } = options;
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
    ...fields,
  }).format(toDate(value));
}

export interface BusinessDayWindow {
  /** Inclusive UTC start of the business day. */
  start: Date;
  /** Exclusive UTC end (next business midnight) — use with `>=` / `<`. */
  end: Date;
}

/**
 * UTC instants bounding the business day that contains `value`.
 * Calendar-day arithmetic (not 24h from an instant), so DST transitions
 * stay correct; an order at 22:00 ART buckets to its local day, not the
 * UTC day its instant falls in.
 */
export function businessDayWindow(value: Date | string | number): BusinessDayWindow {
  const timeZone = getBusinessTimeZone();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(toDate(value));
  const part = (type: string): number => Number(parts.find((entry) => entry.type === type)?.value);
  const year = part('year');
  const month = part('month');
  const day = part('day');
  // Day overflow (e.g. month + 1 past December) is handled by Date.UTC.
  return {
    start: utcForWallTime(year, month, day, timeZone),
    end: utcForWallTime(year, month, day + 1, timeZone),
  };
}

/** Business-local `YYYY-MM-DD` key for bucket labels. */
export function toBusinessDateKey(value: Date | string | number): string {
  const timeZone = getBusinessTimeZone();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(toDate(value));
  const part = (type: string): string => parts.find((entry) => entry.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}
