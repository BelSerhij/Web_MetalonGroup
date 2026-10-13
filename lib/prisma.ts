import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

// A hot reload can leave a PrismaClient created from the previous generated
// schema on `global`. Reuse it only if it has the delegates required by the
// current schema; otherwise create a fresh client for the updated model set.
const cachedPrisma = globalForPrisma.prisma as
  | (PrismaClient & { pricingSettings?: unknown; materialRate?: unknown })
  | undefined;

export const prisma = cachedPrisma?.pricingSettings && cachedPrisma?.materialRate
  ? cachedPrisma
  : new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
