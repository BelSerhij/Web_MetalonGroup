'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function updatePurchaseQueueStatus(id: string, status: string) {
  await requireRole('ADMIN', 'MANAGER', 'WAREHOUSE');
  if (!['NEEDS_ORDER', 'ORDERED', 'RECEIVED'].includes(status)) throw new Error('Некоректний статус закупівлі');
  await prisma.orderManualItem.update({ where: { id }, data: { purchaseStatus: status } });
  revalidatePath('/admin/warehouse/needed');
}
