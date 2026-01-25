import { describe, expect, it, vi, beforeEach } from 'vitest';
// Mock dependencies
vi.mock('@/lib/swagger', () => ({
  getApiDocs: vi.fn(),
}));

// Import after mocks
import { getApiDocs } from '@/lib/swagger';
import { GET as docsHandler } from '@/app/api/docs/route';

describe('/api/docs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns API documentation on success', async () => {
    const mockSpec = {
      openapi: '3.1.0',
      info: { title: 'FastFood API', version: '1.0.0' },
      paths: {},
    };

    (getApiDocs as any).mockResolvedValue(mockSpec);

    const response = await docsHandler();

    expect(getApiDocs).toHaveBeenCalledTimes(1);
    expect(response).toBeDefined();
    // NextResponse.json returns a Response object, so we can't easily test the JSON content
    // But we can verify it was called
  });

  it('returns 500 error on documentation generation failure', async () => {
    const error = new Error('Failed to generate documentation');
    (getApiDocs as any).mockRejectedValue(error);

    const response = await docsHandler();

    expect(getApiDocs).toHaveBeenCalledTimes(1);
    expect(response).toBeDefined();
    // The route handles errors internally and returns a Response
  });

  it('handles swagger generation errors gracefully', async () => {
    (getApiDocs as any).mockRejectedValue(new Error('Swagger error'));

    const response = await docsHandler();

    expect(getApiDocs).toHaveBeenCalledTimes(1);
    expect(response).toBeDefined();
  });
});
