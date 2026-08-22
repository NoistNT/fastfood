/**
 * Canonical phone normalization for person deduplication.
 * Strips every non-digit character so '+54 9 11 2345-6789' and
 * '549112345 6789' collapse to the same identity key.
 */
export function normalizePhoneNumber(value: string | null | undefined): string {
  if (!value) return '';
  return value.replace(/\D+/g, '');
}
