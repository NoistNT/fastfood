/**
 * Human-readable order tracking codes: `FF-XXXXXXXX`, uppercase without
 * visually ambiguous characters (no I/L/O/0/1). Bytes that would bias the
 * modulo mapping are rejected and redrawn.
 */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const SUFFIX_LENGTH = 8;
const MAX_UNBIASED_BYTE = Math.floor(256 / ALPHABET.length) * ALPHABET.length;

export const TRACKING_CODE_PATTERN = /^FF-[A-HJ-NP-Z2-9]{8}$/;

export function generateTrackingCode(): string {
  let suffix = '';
  while (suffix.length < SUFFIX_LENGTH) {
    const bytes = crypto.getRandomValues(new Uint8Array(SUFFIX_LENGTH));
    for (const byte of bytes) {
      if (byte >= MAX_UNBIASED_BYTE) continue;
      suffix += ALPHABET[byte % ALPHABET.length];
      if (suffix.length === SUFFIX_LENGTH) break;
    }
  }
  return `FF-${suffix}`;
}
