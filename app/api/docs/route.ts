import { getApiDocs } from '@/lib/swagger';

export async function GET() {
  try {
    const spec = await getApiDocs();
    return Response.json(spec);
  } catch (error) {
    console.error('Failed to generate API docs:', error);
    return Response.json({ error: 'Failed to generate API documentation' }, { status: 500 });
  }
}
