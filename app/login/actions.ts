'use server';

import { redirect } from 'next/navigation';

import { createSession, destroySession } from '@/lib/auth';
import { verifyPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';

export type LoginState = { error?: string };

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) return { error: 'Вкажіть email і пароль' };

  const user = await prisma.user.findFirst({ where: { email, isActive: true } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: 'Невірний email або пароль' };
  }

  await createSession(user.id);
  redirect('/admin');
}

export async function logout() {
  await destroySession();
  redirect('/login');
}
