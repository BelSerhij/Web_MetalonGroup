'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';

export async function createProductVariant(
  productId: string,
  formData: FormData
) {
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

  await prisma.productVariant.create({
    data: {
      productId,
      thickness,
      color,
      coating,
      paintingType,
      metalBrand,
      zincContent,
      price,
      inStock,
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
      price,
      inStock,
    },
  });

  redirect(
    `/admin/products/${productId}`
  );
}

export async function deleteProductVariant(
  productId: string,
  variantId: string
) {
  await prisma.productVariant.delete({
    where: {
      id: variantId,
    },
  });

  redirect(`/admin/products/${productId}`);
}