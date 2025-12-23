import type { NextRequest } from 'next/server';
import type { UserWithRoles } from '@/types/auth';

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const secretKey = process.env.SESSION_SECRET;
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: { user: UserWithRoles; expires: Date }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(key);
}

export async function decrypt(
  input: string
): Promise<{ user: UserWithRoles; expires: Date } | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload as { user: UserWithRoles; expires: Date };
  } catch {
    return null;
  }
}

export async function login(user: UserWithRoles) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await encrypt({ user, expires });

  (await cookies()).set('session', session, {
    expires,
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });
}

export async function logout() {
  (await cookies()).set('session', '', { expires: new Date(0) });
}

export async function getSession(): Promise<UserWithRoles | null> {
  const session = (await cookies()).get('session')?.value;
  if (!session) return null;
  const decrypted = await decrypt(session);
  return decrypted?.user ?? null;
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  if (!session) return NextResponse.next();

  const parsed = await decrypt(session);
  if (!parsed) return NextResponse.next();
  parsed.expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const res = NextResponse.next();
  res.cookies.set({
    name: 'session',
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });
  return res;
}
