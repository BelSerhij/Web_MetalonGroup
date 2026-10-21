'use server';

import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { productSeries } from '@/lib/catalog/series';
import { canonicalFinish, canonicalManufacturer, canonicalizeMaterialRates } from '@/lib/catalog/manufacturers';
import { roundMoney } from '@/lib/money';

const checkoutSchema = z.object({
  name: z.string().trim().min(2, 'Вкажіть ім’я').max(120),
  phone: z.string().trim().min(7, 'Вкажіть коректний телефон').max(32),
  city: z.string().trim().min(2, 'Вкажіть місто').max(120),
  deliveryBranch: z.string().trim().min(1, 'Вкажіть відділення Нової Пошти').max(180),
  note: z.string().trim().max(1_000).optional(),
  items: z.array(z.object({
    variantId: z.string().uuid().optional(),
    slug: z.string().min(1).max(160),
    quantity: z.number().int().positive().max(10_000),
    length: z.number().finite().positive().max(100),
    options: z.object({
      color: z.string().max(80), thickness: z.number().positive(), metalBrand: z.string().max(160),
      coating: z.string().max(80), paintingType: z.string().max(40),
    }).optional(),
  })).min(1, 'Кошик порожній').max(100),
});

export type CheckoutState = { error?: string; orderNumber?: string };

function sameFinish(a: string, b: string) {
  return canonicalFinish(a).toLowerCase() === canonicalFinish(b).toLowerCase();
}

export async function submitWebsiteOrder(_: CheckoutState, formData: FormData): Promise<CheckoutState> {
  let items: unknown;
  try { items = JSON.parse(String(formData.get('items') ?? '[]')); }
  catch { return { error: 'Не вдалося прочитати кошик. Спробуйте ще раз.' }; }

  const parsed = checkoutSchema.safeParse({
    name: formData.get('name'), phone: formData.get('phone'), city: formData.get('city'),
    deliveryBranch: formData.get('deliveryBranch'), note: formData.get('note'), items,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Перевірте дані замовлення' };

  const input = parsed.data;
  const materialRates = canonicalizeMaterialRates(await prisma.materialRate.findMany());
  const prepared = [];
  for (const item of input.items) {
    const series = productSeries.find((entry) => entry.slug === item.slug);
    const record = await prisma.product.findUnique({ where: { slug: item.slug }, include: { variants: true } });
    if ((!series && !record) || (record && !record.isVisible)) return { error: `Товар «${item.slug}» більше недоступний.` };

    const existingVariant = item.variantId
      ? await prisma.productVariant.findUnique({ where: { id: item.variantId }, include: { product: true } })
      : null;
    const options = item.options ?? (existingVariant ? {
      color: existingVariant.color, thickness: Number(existingVariant.thickness), metalBrand: existingVariant.metalBrand,
      coating: existingVariant.coating, paintingType: existingVariant.paintingType,
    } : null);
    if (!options) return { error: `Оберіть параметри товару «${series?.title ?? record?.title}».` };

    const width = series?.fullWidth ?? (record ? Number(record.fullWidth) : 1);
    const usefulWidth = series?.usefulWidth ?? (record ? Number(record.usefulWidth) : 1);
    const unit = series?.unit ?? record?.unit ?? 'м²';
    const rate = materialRates.find((value) => canonicalManufacturer(value.metalBrand) === canonicalManufacturer(options.metalBrand)
      && Number(value.thickness) === options.thickness && sameFinish(value.coating, options.coating)
      && value.paintingType === options.paintingType);
    const unitPrice = rate
      ? /м²|м2/i.test(unit) ? Number((Number(rate.pricePerMeter) / width).toFixed(2)) : Number(rate.pricePerMeter)
      : existingVariant && existingVariant.product.slug === item.slug ? Number(existingVariant.price) : null;
    if (unitPrice === null) return { error: `Ціна для «${series?.title ?? record?.title}» за обраними параметрами ще не внесена до прайсу.` };

    prepared.push({ item, series, record, existingVariant, options, width, usefulWidth, unit, unitPrice });
  }

  const calculated: Array<{ item: (typeof input.items)[number]; productId: string; variantId: string; options: NonNullable<(typeof input.items)[number]['options']>; usefulWidth: number; unit: string; unitPrice: number; meters: number; area: number; total: number; fulfillment: string }> = [];
  for (const { item, series, record, existingVariant, options, usefulWidth, unit, unitPrice } of prepared) {
    if (!options) return { error: 'Оберіть параметри для кожного товару.' };
    const productId = record?.id ?? (series ? (await prisma.product.upsert({ where: { slug: series.slug }, create: {
      title: series.title, slug: series.slug, description: series.description, category: series.category,
      image: series.image, unit: series.unit, usefulWidth: series.usefulWidth ?? 1, fullWidth: series.fullWidth ?? 1,
    }, update: {}, select: { id: true } })).id : null);
    if (!productId) throw new Error('Не вдалося зберегти товар замовлення.');
    let variant = existingVariant?.productId === productId ? existingVariant : await prisma.productVariant.findFirst({
      where: { productId, color: options.color, thickness: options.thickness, metalBrand: options.metalBrand, coating: options.coating, paintingType: options.paintingType },
    });
    if (!variant) {
      const zinc = await prisma.productVariant.findFirst({ where: { metalBrand: options.metalBrand }, select: { zincContent: true } });
      variant = await prisma.productVariant.create({ data: {
        productId, thickness: options.thickness, color: options.color, coating: options.coating,
        paintingType: options.paintingType, metalBrand: options.metalBrand, zincContent: zinc?.zincContent ?? 100,
        price: unitPrice, inStock: false, isVisible: true,
      } });
    }
    if (Number(variant.price) !== unitPrice) await prisma.productVariant.update({ where: { id: variant.id }, data: { price: unitPrice } });
    const meters = item.quantity * item.length;
    const area = meters * usefulWidth;
    const billableQuantity = /м²|м2/i.test(unit) ? area : meters;
    calculated.push({ item, productId, variantId: variant.id, options, usefulWidth, unit, unitPrice, meters, area, total: roundMoney(unitPrice * billableQuantity), fulfillment: series?.slug === 'profnastyl-s10' ? 'MANUFACTURE' : 'PARTNER' });
  }
  const totalAmount = roundMoney(calculated.reduce((sum, item) => sum + item.total, 0));
  const note = [`Доставка: Нова Пошта, ${input.city}, ${input.deliveryBranch}`, input.note].filter(Boolean).join('\n');

  const order = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findFirst({ where: { phone: input.phone }, select: { id: true } });
    const customerId = customer?.id ?? (await tx.customer.create({ data: { name: input.name, phone: input.phone, address: `${input.city}, ${input.deliveryBranch}` }, select: { id: true } })).id;
    return tx.order.create({
      data: {
        number: `WEB-${randomUUID().slice(0, 8).toUpperCase()}`, customerId, status: 'NEW', totalAmount, note,
        items: { create: calculated.map(({ item, productId, variantId, options, usefulWidth, unit, unitPrice, meters, area, total, fulfillment }) => ({
          productId, variantId, quantity: item.quantity, length: item.length,
          width: usefulWidth, price: unitPrice, total,
          parameters: { source: 'website', fulfillment, sheets: item.quantity, totalMeters: meters, area, unit, options },
        })) },
      }, select: { number: true },
    });
  });
  return { orderNumber: order.number };
}
