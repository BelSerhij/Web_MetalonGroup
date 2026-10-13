'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateS10RetailPrice } from '@/lib/pricing';
import { productSeries } from '@/lib/catalog/series';

export async function savePricingSettings(formData: FormData) {
  await requireRole('ADMIN');
  const manufacturing = Number(formData.get('manufacturingMarkupPercent'));
  const partner = Number(formData.get('partnerMarkupPercent'));
  if (!Number.isFinite(manufacturing) || manufacturing < 0 || manufacturing > 300) throw new Error('Націнка виробництва має бути від 0 до 300%');
  if (!Number.isFinite(partner) || partner < 0 || partner > 300) throw new Error('Партнерська націнка має бути від 0 до 300%');
  await prisma.pricingSettings.upsert({
    where: { id: 'default' },
    create: { id: 'default', manufacturingMarkupPercent: manufacturing, partnerMarkupPercent: partner },
    update: { manufacturingMarkupPercent: manufacturing, partnerMarkupPercent: partner },
  });
  const s10 = await prisma.product.findUnique({ where: { slug: 'profnastyl-s10' } });
  if (s10) {
    const coils = await prisma.metalCoil.findMany({ where: { productSlug: 'profnastyl-s10', status: 'IN_STOCK' }, orderBy: { receivedAt: 'desc' } });
    const latest = new Map<string, typeof coils[number]>();
    for (const coil of coils) {
      const key = JSON.stringify([coil.metalBrand, Number(coil.thickness), coil.coating, coil.paintingType]);
      if (!latest.has(key)) latest.set(key, coil);
    }
    for (const coil of latest.values()) {
      const retailPrice = calculateS10RetailPrice({ purchasePricePerKg: Number(coil.purchasePricePerKg ?? 0), thicknessMm: Number(coil.thickness), usefulWidthMeters: Number(s10.usefulWidth), manufacturingMarkupPercent: manufacturing });
      await prisma.materialRate.upsert({
        where: { metalBrand_thickness_coating_paintingType: { metalBrand: coil.metalBrand, thickness: coil.thickness, coating: coil.coating, paintingType: coil.paintingType } },
        create: { metalBrand: coil.metalBrand, thickness: coil.thickness, coating: coil.coating, paintingType: coil.paintingType, pricePerMeter: Number((retailPrice * Number(s10.fullWidth)).toFixed(2)) },
        update: { pricePerMeter: Number((retailPrice * Number(s10.fullWidth)).toFixed(2)) },
      });
    }
  }
  revalidatePath('/admin/settings');
  revalidatePath('/catalog');
  revalidatePath('/catalog/profnastyl-s10');
  for (const series of productSeries) revalidatePath(`/catalog/${series.slug}`);
}
