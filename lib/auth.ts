import 'server-only';

import { createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';

const SESSION_COOKIE = 'metalon_session';
const SESSION_MAX_AGE = 60 * 60 * 8;

type SessionPayload = {
  userId: string;
  expiresAt: number;
};

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET must be configured in production');
  }
  return secret ?? 'development-only-secret-change-me';
}

function sign(value: string) {
  return createHash('sha256')
    .update(`${getSessionSecret()}:${value}`)
    .digest('base64url');
}

function encodeSession(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${sign(body)}`;
}

function decodeSession(value?: string): SessionPayload | null {
  if (!value) return null;
  const [body, signature] = value.split('.');
  if (!body || !signature || signature !== sign(body)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as SessionPayload;
    return payload.expiresAt > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

export { hashPassword } from '@/lib/password';

export async function createSession(userId: string) {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, encodeSession({ userId, expiresAt }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = decodeSession(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return null;

  return prisma.user.findFirst({
    where: { id: session.userId, isActive: true },
    select: { id: true, name: true, email: true, role: true },
  });
}

export async function requireRole(...roles: Array<'ADMIN' | 'MANAGER' | 'PRODUCTION' | 'WAREHOUSE'>) {
  const user = await getCurrentUser();
  if (!user || !roles.includes(user.role)) {
    redirect('/login');
  }
  return user;
}
