/**
 * Human-readable order tracking codes: `FF-XXXXXXXX`, uppercase without
 * visually ambiguous characters (no I/L/O/0/1).
 */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const SUFFIX_LENGTH = 8;

export const TRACKING_CODE_PATTERN = /^FF-[A-HJ-NP-Z2-9]{8}$/;

export function generateTrackingCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(SUFFIX_LENGTH));
  let suffix = '';
  for (const byte of bytes) suffix += ALPHABET[byte % ALPHABET.length];
  return `FF-${suffix}`;
}
