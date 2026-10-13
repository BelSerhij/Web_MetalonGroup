'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { productSeries } from '@/lib/catalog/series';

function readProductForm(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const slug = String(formData.get('slug') ?? '').trim();
  const category = String(formData.get('category') ?? '').trim();
  const image = String(formData.get('image') ?? '').trim();
  const unit = String(formData.get('unit') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const usefulWidth = Number(formData.get('usefulWidth'));
  const fullWidth = Number(formData.get('fullWidth'));
  if (!title || !slug || !category || !image || !unit) throw new Error('Заповніть обов’язкові поля товару.');
  if (!Number.isFinite(usefulWidth) || usefulWidth <= 0 || !Number.isFinite(fullWidth) || fullWidth <= 0) throw new Error('Ширина має бути більшою за нуль.');
  return { title, slug, category, image, unit, description: description || null, usefulWidth, fullWidth };
}

export async function createProduct(formData: FormData) {
  await requireRole('ADMIN', 'MANAGER');
  const product = await prisma.product.create({ data: readProductForm(formData) });
  revalidatePath('/admin/products');
  redirect(`/admin/products/${product.id}`);
}

export async function updateProduct(productId: string, formData: FormData) {
  await requireRole('ADMIN', 'MANAGER');
  await prisma.product.update({ where: { id: productId }, data: readProductForm(formData) });
  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath('/catalog');
  redirect(`/admin/products/${productId}`);
}

function pricingFromForm(formData: FormData) {
  const purchaseRaw = String(formData.get('purchasePrice') ?? '').trim();
  const markupType = String(formData.get('markupType') ?? 'PERCENT');
  const markupRaw = String(formData.get('markupValue') ?? '').trim();
  const purchasePrice = purchaseRaw === '' ? null : Number(purchaseRaw);
  const markupValue = markupRaw === '' ? null : Number(markupRaw);
  const valid = purchasePrice === null || (Number.isFinite(purchasePrice) && purchasePrice >= 0);
  if (!valid || (markupValue !== null && !Number.isFinite(markupValue))) {
    throw new Error('Некоректні значення закупівельної ціни або націнки.');
  }
  const price = purchasePrice === null ? undefined : Number((markupValue === null
    ? purchasePrice
    : markupType === 'FIXED' ? purchasePrice + markupValue : purchasePrice * (1 + markupValue / 100)).toFixed(2));
  if (price !== undefined && price < 0) throw new Error('Націнка не може зменшити продажну ціну нижче нуля.');
  return { purchasePrice, markupType, markupValue, price };
}

export async function createProductVariant(
  productId: string,
  formData: FormData
) {
  await requireRole('ADMIN', 'MANAGER');
  const thickness = Number(
    formData.get('thickness')
  );

  const color = String(
    formData.get('color')
  );

  const coating = String(
    formData.get('coating')
  );

  const paintingType = String(
    formData.get('paintingType')
  );

  const metalBrand = String(
    formData.get('metalBrand')
  );
  const pricing = pricingFromForm(formData);
  if (pricing.purchasePrice === null || pricing.markupValue === null || pricing.price === undefined) {
    throw new Error('Вкажіть закупівельну ціну та націнку, щоб автоматично розрахувати ціну продажу.');
  }
  const manufacturerVariants = await prisma.productVariant.findMany({ where: { metalBrand }, select: { zincContent: true } });
  if (!manufacturerVariants.length) throw new Error('Для цього виробника ще немає збереженого значення вмісту цинку.');
  const zincCounts = new Map<number, number>();
  for (const variant of manufacturerVariants) zincCounts.set(variant.zincContent, (zincCounts.get(variant.zincContent) ?? 0) + 1);
  const zincContent = [...zincCounts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0][0];
  const imageUrl = String(formData.get('imageUrl') ?? '').trim() || null;

  await prisma.productVariant.create({
    data: {
      productId,
      thickness,
      color,
      coating,
      paintingType,
      metalBrand,
      zincContent,
      ...pricing,
      price: pricing.price,
      imageUrl,
      inStock: true,
    },
  });

  revalidatePath(
    `/admin/products/${productId}`
  );

  revalidatePath(
    '/admin/products'
  );

  redirect(
    `/admin/products/${productId}`
  );
}
export async function updateProductVariant(
  productId: string,
  variantId: string,
  formData: FormData
) {
  await requireRole('ADMIN', 'MANAGER');
  const thickness = Number(
    formData.get('thickness')
  );

  const color = String(
    formData.get('color')
  );

  const coating = String(
    formData.get('coating')
  );

  const paintingType = String(
    formData.get('paintingType')
  );

  const metalBrand = String(
    formData.get('metalBrand')
  );

  const zincContent = Number(
    formData.get('zincContent')
  );

  const price = Number(
    formData.get('price')
  );

  const inStock =
    formData.get('inStock') === 'true';
  const pricing = pricingFromForm(formData);
  const imageUrl = String(formData.get('imageUrl') ?? '').trim() || null;

  await prisma.productVariant.update({
    where: {
      id: variantId,
    },

    data: {
      thickness,
      color,
      coating,
      paintingType,
      metalBrand,
      zincContent,
      ...pricing,
      price: pricing.price ?? price,
      imageUrl,
      inStock,
      isVisible: formData.get('isVisible') !== 'false',
    },
  });

  redirect(
    `/admin/products/${productId}`
  );
}

export async function toggleProductVisibility(productId: string, visible: boolean) {
  await requireRole('ADMIN', 'MANAGER');
  await prisma.product.update({ where: { id: productId }, data: { isVisible: visible } });
  revalidatePath('/catalog');
  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${productId}`);
}

export async function toggleVariantVisibility(productId: string, variantId: string, visible: boolean) {
  await requireRole('ADMIN', 'MANAGER');
  await prisma.productVariant.update({ where: { id: variantId, productId }, data: { isVisible: visible } });
  revalidatePath('/catalog');
  revalidatePath(`/catalog/${(await prisma.product.findUnique({ where: { id: productId }, select: { slug: true } }))?.slug ?? ''}`);
  revalidatePath(`/admin/products/${productId}`);
}

export async function archiveOrDeleteProduct(productId: string) {
  await requireRole('ADMIN', 'MANAGER');
  const [orders, productions, stockMovements] = await Promise.all([
    prisma.orderItem.count({ where: { productId } }),
    prisma.production.count({ where: { productId } }),
    prisma.stockMovement.count({ where: { productId } }),
  ]);
  if (orders || productions || stockMovements) {
    await prisma.product.update({ where: { id: productId }, data: { isVisible: false } });
  } else {
    await prisma.product.delete({ where: { id: productId } });
  }
  revalidatePath('/catalog');
  revalidatePath('/admin/products');
  redirect('/admin/products');
}

export async function setGroupedVariantPrice(
  metalBrand: string,
  sourceBrands: string[],
  thickness: number,
  coating: string,
  sourceCoatings: string[],
  paintingType: string,
  pricePerMeter: number,
) {
  await requireRole('ADMIN', 'MANAGER');
  if (!Number.isFinite(pricePerMeter) || pricePerMeter < 0) throw new Error('Ціна має бути коректним числом, не меншим за нуль.');
  const brands = [...new Set([metalBrand, ...sourceBrands])];
  const coatings = [...new Set([coating, ...sourceCoatings])];
  const variants = await prisma.productVariant.findMany({ where: { metalBrand: { in: brands }, thickness, coating: { in: coatings }, paintingType }, include: { product: true } });
  const rateWrites = brands.flatMap((brand) => coatings.map((finish) => prisma.materialRate.upsert({
    where: { metalBrand_thickness_coating_paintingType: { metalBrand: brand, thickness, coating: finish, paintingType } },
    create: { metalBrand: brand, thickness, coating: finish, paintingType, pricePerMeter },
    update: { pricePerMeter },
  })));
  const variantWrites = variants.map((variant) => {
    const totalWidth = productSeries.find((series) => series.slug === variant.product.slug)?.fullWidth ?? Number(variant.product.fullWidth);
    const price = /м²|м2/i.test(variant.product.unit)
      ? Number((pricePerMeter / totalWidth).toFixed(2))
      : Number(pricePerMeter.toFixed(2));
    const purchasePrice = variant.purchasePrice === null ? null : Number(variant.purchasePrice);
    let markupValue = variant.markupValue === null ? null : Number(variant.markupValue);
    if (purchasePrice !== null && purchasePrice > 0) {
      markupValue = variant.markupType === 'FIXED'
        ? Number((price - purchasePrice).toFixed(2))
        : Number(((price / purchasePrice - 1) * 100).toFixed(2));
    }
    return prisma.productVariant.update({ where: { id: variant.id }, data: { price, ...(markupValue === null ? {} : { markupValue }) } });
  });
  await prisma.$transaction([...rateWrites, ...variantWrites]);
  revalidatePath('/catalog');
  revalidatePath('/admin/products');
  for (const series of productSeries) revalidatePath(`/catalog/${series.slug}`);
  for (const productId of new Set(variants.map((variant) => variant.productId))) revalidatePath(`/admin/products/${productId}`);
  return { updated: variants.length };
}

export async function deleteProductVariant(
  productId: string,
  variantId: string
) {
  await requireRole('ADMIN', 'MANAGER');
  const [orders, productions, stockMovements] = await Promise.all([
    prisma.orderItem.count({ where: { variantId } }),
    prisma.production.count({ where: { variantId } }),
    prisma.stockMovement.count({ where: { variantId } }),
  ]);
  if (orders || productions || stockMovements) {
    await prisma.productVariant.update({ where: { id: variantId }, data: { isVisible: false } });
  } else {
    await prisma.productVariant.delete({ where: { id: variantId } });
  }

  revalidatePath('/catalog');
  revalidatePath(`/admin/products/${productId}`);
  redirect(`/admin/products/${productId}`);
}
