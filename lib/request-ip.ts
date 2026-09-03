/**
 * Resolves the caller IP from request headers in a spoof-resistant way:
 * prefers the platform-provided `x-real-ip`, falls back to the first entry
 * of `x-forwarded-for`, and finally `127.0.0.1`. On Vercel the ingress
 * overwrites these headers so a client-supplied value cannot bypass the
 * counter key used by rate limiters.
 */
export function getClientIp(request: { headers: { get(name: string): string | null } }): string {
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) {
    const first = realIp.split(',')[0];
    if (first) return first.trim();
  }

  const forwarded = request.headers.get('x-forwarded-for')?.trim();
  if (forwarded) {
    const first = forwarded.split(',')[0];
    if (first) return first.trim();
  }

  // Vercel also sets `x-vercel-forwarded-for` in some paths; treat it as
  // an additional trusted source before falling back.
  const vercelForwarded = request.headers.get('x-vercel-forwarded-for')?.trim();
  if (vercelForwarded) {
    const first = vercelForwarded.split(',')[0];
    if (first) return first.trim();
  }

  return '127.0.0.1';
}
