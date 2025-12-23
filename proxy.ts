import { type NextRequest, NextResponse } from 'next/server';

import { getSession, updateSession } from '@/lib/auth/session';
import { USER_ROLES } from '@/types/auth';

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)', // All paths except for the ones starting with api, _next/static, _next/image, and favicon.ico
  ],
};

const publicRoutes = [
  '/login',
  '/register',
  '/password-reset',
  '/password-reset/confirm',
  '/password-reset/request',
  '/api/auth',
  '/api/payment',
];

const authorizedRoutes: { path: string; roles: USER_ROLES[] }[] = [
  { path: '/', roles: [USER_ROLES.ADMIN, USER_ROLES.CUSTOMER] },
  { path: '/dashboard', roles: [USER_ROLES.ADMIN, USER_ROLES.CUSTOMER] },
  { path: '/order', roles: [USER_ROLES.ADMIN, USER_ROLES.CUSTOMER] },
  { path: '/products', roles: [USER_ROLES.ADMIN, USER_ROLES.CUSTOMER] },
  { path: '/profile', roles: [USER_ROLES.ADMIN, USER_ROLES.CUSTOMER] },
];

export default async function proxy(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;
  const isPublicRoute = publicRoutes.some((path) => pathname.startsWith(path));

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
  const requiredRoles = sortedAuthorizedRoutes.find((route) =>
    pathname.startsWith(route.path)
  )?.roles;

  if (requiredRoles && !requiredRoles.some((role) => userRoles.includes(role))) {
    const url = request.nextUrl.clone();
    url.pathname = '/forbidden';
    return NextResponse.redirect(url);
  }

  return await updateSession(request);
}
