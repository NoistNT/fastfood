import { type NextRequest, NextResponse } from 'next/server';

import { USER_ROLES } from '@/types/auth';
import { OPERATIONAL_ROLES } from '@/lib/auth/roles';
import { getSession, updateSession } from '@/lib/auth/session';

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)', // All paths except for the ones starting with api, _next/static, _next/image, and favicon.ico
  ],
};

const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/order',
  '/password-reset',
  '/password-reset/confirm',
  '/password-reset/request',
  '/api/auth',
  '/api/payment',
  '/api/health',
];

// Roles encode powers only. Every non-public route requires a session;
// /dashboard additionally requires an operational role, except the
// owners-only surfaces below which require ADMIN. Longest prefix wins.
const authorizedRoutes: { path: string; roles: USER_ROLES[] }[] = [
  { path: '/dashboard/reports', roles: [USER_ROLES.ADMIN] },
  { path: '/dashboard/customers', roles: [USER_ROLES.ADMIN] },
  { path: '/dashboard', roles: [...OPERATIONAL_ROLES] },
];

export default async function proxy(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;
  const isPublicRoute = publicRoutes.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isPublicRoute) return await updateSession(request);

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  const userRoles = session.roles.map((role) => role.name);
  const sortedAuthorizedRoutes = [...authorizedRoutes].sort(
    (a, b) => b.path.length - a.path.length
  );
  const requiredRoles = sortedAuthorizedRoutes.find(
    (route) => pathname === route.path || pathname.startsWith(`${route.path}/`)
  )?.roles;

  if (requiredRoles && !requiredRoles.some((role) => userRoles.includes(role))) {
    const url = request.nextUrl.clone();
    url.pathname = '/forbidden';
    return NextResponse.redirect(url);
  }

  return await updateSession(request);
}
