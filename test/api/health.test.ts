import { describe, expect, it } from 'vitest';

import { GET } from '@/app/api/health/route';

describe('/api/health', () => {
  it('returns healthy status', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('uptime');
    expect(data).toHaveProperty('version');
    expect(data).toHaveProperty('environment');
  });

  it('includes required health check fields', async () => {
    const response = await GET();
    const data = await response.json();

    // Verify all expected fields are present
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('uptime');
    expect(typeof data.uptime).toBe('number');
    expect(data).toHaveProperty('version');
    expect(data).toHaveProperty('environment');
  });

  it('returns valid timestamp', async () => {
    const response = await GET();
    const data = await response.json();

    // Verify timestamp is a valid ISO string
    const timestamp = new Date(data.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(isNaN(timestamp.getTime())).toBe(false);
  });

  it('returns proper content type', async () => {
    const response = await GET();

    expect(response.headers.get('content-type')).toContain('application/json');
  });
});
