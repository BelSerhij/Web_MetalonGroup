'use server';

import { randomUUID } from 'node:crypto';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';

const checkoutSchema = z.object({
  name: z.string().trim().min(2, 'Вкажіть ім’я').max(120),
  phone: z.string().trim().min(7, 'Вкажіть коректний телефон').max(32),
  city: z.string().trim().min(2, 'Вкажіть місто').max(120),
  deliveryBranch: z.string().trim().min(1, 'Вкажіть відділення Нової Пошти').max(180),
  note: z.string().trim().max(1_000).optional(),
  items: z.array(z.object({
    variantId: z.string().uuid(),
    quantity: z.number().int().positive().max(10_000),
    length: z.number().finite().positive().max(100),
  })).min(1, 'Кошик порожній').max(100),
});

export type CheckoutState = {
  error?: string;
  orderNumber?: string;
};

export async function submitWebsiteOrder(_: CheckoutState, formData: FormData): Promise<CheckoutState> {
  let items: unknown;
  try {
    items = JSON.parse(String(formData.get('items') ?? '[]'));
  } catch {
    return { error: 'Не вдалося прочитати кошик. Спробуйте ще раз.' };
  }
  const parsed = checkoutSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    city: formData.get('city'),
    deliveryBranch: formData.get('deliveryBranch'),
    note: formData.get('note'),
    items,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Перевірте дані замовлення' };

  const input = parsed.data;
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: [...new Set(input.items.map((item) => item.variantId))] }, inStock: true },
    include: { product: true },
  });
  if (variants.length !== new Set(input.items.map((item) => item.variantId)).size) {
    return { error: 'Один або декілька товарів більше недоступні. Оновіть кошик.' };
  }

  const variantsById = new Map(variants.map((variant) => [variant.id, variant]));
  const calculatedItems = input.items.map((item) => {
    const variant = variantsById.get(item.variantId);
    if (!variant) throw new Error('Варіант товару не знайдено');
    const meters = item.quantity * item.length;
    const area = meters * Number(variant.product.usefulWidth);
    const billableQuantity = variant.product.unit === 'м²' ? area : meters;
    return { item, variant, meters, area, total: Number(variant.price) * billableQuantity };
  });
  const totalAmount = calculatedItems.reduce((sum, item) => sum + item.total, 0);
  const delivery = `Доставка: Нова Пошта, ${input.city}, ${input.deliveryBranch}`;
  const note = [delivery, input.note].filter(Boolean).join('\n');

  const order = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findFirst({
      where: { phone: input.phone },
      select: { id: true },
    });
    const customerId = customer?.id ?? (await tx.customer.create({
      data: { name: input.name, phone: input.phone, address: `${input.city}, ${input.deliveryBranch}` },
      select: { id: true },
    })).id;

    return tx.order.create({
      data: {
        number: `WEB-${randomUUID().slice(0, 8).toUpperCase()}`,
        customerId,
        status: 'NEW',
        totalAmount,
        note,
        items: {
          create: calculatedItems.map(({ item, variant, meters, area, total }) => {
            return {
              productId: variant.productId,
              variantId: variant.id,
              quantity: item.quantity,
              length: item.length,
              width: Number(variant.product.usefulWidth),
              price: variant.price,
              total,
              parameters: { source: 'website', sheets: item.quantity, totalMeters: meters, area },
            };
          }),
        },
      },
      select: { number: true },
    });
  });

  return { orderNumber: order.number };
}
