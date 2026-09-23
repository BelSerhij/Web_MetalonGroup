import { PrismaClient, UserRole } from '@prisma/client';

import { hashPassword } from '../lib/password';

const prisma = new PrismaClient();

async function main() {
  const email = String(process.env.ADMIN_EMAIL ?? 'admin@metalon.ua').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!password || password.length < 12) {
    throw new Error('Set ADMIN_PASSWORD to a unique password of at least 12 characters');
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: UserRole.ADMIN, isActive: true },
    create: { name: 'Адміністратор', email, passwordHash, role: UserRole.ADMIN, isActive: true },
  });
  console.log(`Administrator ${email} is ready`);
}

main().finally(async () => prisma.$disconnect());
