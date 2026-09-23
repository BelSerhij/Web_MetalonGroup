'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function adjustWarehouseStock({
  productId,
  variantId,
  warehouseId,
  quantity,
  note,
}: {
  productId: string;
  variantId: string;
  warehouseId?: string;
  quantity: number;
  note?: string;
}) {
  await requireRole('ADMIN', 'WAREHOUSE');
  if (!Number.isFinite(quantity) || quantity === 0) {
    throw new Error('Кількість повинна бути ненульовим числом');
  }

  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, productId },
    include: { product: true },
  });

  if (!variant) {
    throw new Error('Варіант продукції не знайдено');
  }

  if (warehouseId) {
    const warehouse = await prisma.warehouse.findFirst({
      where: { id: warehouseId, isActive: true },
    });
    if (!warehouse) throw new Error('Склад не знайдено або він неактивний');
  }

  if (quantity < 0) {
    const movements = await prisma.stockMovement.findMany({
      where: { productId, variantId },
      select: { quantity: true },
    });
    const current = movements.reduce((sum, item) => sum + Number(item.quantity), 0);
    if (current + quantity < -0.0001) {
      throw new Error(`Недостатній залишок. Доступно ${Math.max(0, current).toFixed(2)} ${variant.product.unit || 'од.'}`);
    }
  }

  await prisma.stockMovement.create({
    data: {
      productId,
      variantId,
      warehouseId,
      quantity,
      type: 'ADJUSTMENT',
      note: note?.trim() || 'Ручне коригування залишку',
    },
  });

  revalidatePath('/admin/warehouse');
}
