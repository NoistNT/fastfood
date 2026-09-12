import { describe, expect, it } from 'vitest';

import { generateTrackingCode, TRACKING_CODE_PATTERN } from '@/lib/tracking-code';

describe('generateTrackingCode', () => {
  it('produces FF-prefixed codes matching the unambiguous pattern', () => {
    for (let i = 0; i < 50; i += 1) {
      expect(generateTrackingCode()).toMatch(TRACKING_CODE_PATTERN);
    }
  });

  it('never repeats within a reasonable sample', () => {
    const codes = new Set(Array.from({ length: 200 }, () => generateTrackingCode()));
    expect(codes.size).toBe(200);
  });
});
