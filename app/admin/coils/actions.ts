'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';

export async function createProduction(
  coilId: string,
  formData: FormData
) {
  const productId = String(
    formData.get('productId')
  );

  const variantId = String(
    formData.get('variantId')
  );

  const usedWeight = Number(
    formData.get('usedWeight')
  );

  const usedLengthValue =
    formData.get('usedLength');

  const usedLength =
    usedLengthValue &&
    String(usedLengthValue).trim() !== ''
      ? Number(usedLengthValue)
      : null;

  const producedQuantity = Number(
    formData.get('producedQuantity')
  );

  const wasteQuantity =
    Number(
      formData.get('wasteQuantity')
    ) || 0;

  const costPriceValue =
    formData.get('costPrice');

  const costPrice =
    costPriceValue &&
    String(costPriceValue).trim() !== ''
      ? Number(costPriceValue)
      : null;

  const note = String(
    formData.get('note') || ''
  ).trim();

  // ============================================
  // ВАЛІДАЦІЯ
  // ============================================

  if (!productId) {
    throw new Error(
      'Оберіть товар'
    );
  }

  if (!variantId) {
    throw new Error(
      'Оберіть варіант товару'
    );
  }

  if (
    !Number.isFinite(usedWeight) ||
    usedWeight <= 0
  ) {
    throw new Error(
      'Вкажіть коректну використану вагу'
    );
  }

  if (
    !Number.isFinite(producedQuantity) ||
    producedQuantity <= 0
  ) {
    throw new Error(
      'Вкажіть коректну кількість продукції'
    );
  }

  if (
    usedLength !== null &&
    (
      !Number.isFinite(usedLength) ||
      usedLength <= 0
    )
  ) {
    throw new Error(
      'Вкажіть коректну використану довжину'
    );
  }

  // ============================================
  // ОТРИМУЄМО РУЛОН
  // ============================================

  const coil =
    await prisma.metalCoil.findUnique({
      where: {
        id: coilId,
      },
    });

  if (!coil) {
    throw new Error(
      'Рулон не знайдено'
    );
  }

  if (
    coil.status === 'FINISHED'
  ) {
    throw new Error(
      'Цей рулон уже повністю використаний'
    );
  }

  if (
    coil.status === 'WRITTEN_OFF'
  ) {
    throw new Error(
      'Списаний рулон не можна використати у виробництві'
    );
  }

  // ============================================
  // ОТРИМУЄМО ВАРІАНТ
  // ============================================

  const variant =
    await prisma.productVariant.findUnique({
      where: {
        id: variantId,
      },
    });

  if (!variant) {
    throw new Error(
      'Варіант товару не знайдено'
    );
  }

  if (
    variant.productId !== productId
  ) {
    throw new Error(
      'Обраний варіант не належить цьому товару'
    );
  }

  // ============================================
  // ПЕРЕВІРКА ВІДПОВІДНОСТІ РУЛОНУ
  // ============================================

  if (
    Number(variant.thickness) !==
    Number(coil.thickness)
  ) {
    throw new Error(
      `Товщина рулону (${coil.thickness} мм) не відповідає товщині варіанту (${variant.thickness} мм)`
    );
  }

  if (
    variant.color !== coil.color
  ) {
    throw new Error(
      `Колір рулону (${coil.color}) не відповідає кольору варіанту (${variant.color})`
    );
  }

  if (
    variant.coating !== coil.coating
  ) {
    throw new Error(
      'Покриття рулону не відповідає варіанту товару'
    );
  }

  if (
    variant.paintingType !==
    coil.paintingType
  ) {
    throw new Error(
      'Тип фарбування рулону не відповідає варіанту товару'
    );
  }

  // ============================================
  // ПЕРЕВІРКА ЗАЛИШКІВ
  // ============================================

  const currentWeight =
    Number(coil.currentWeight);

  const currentLength =
    coil.currentLength !== null
      ? Number(coil.currentLength)
      : null;

  if (
    usedWeight > currentWeight
  ) {
    throw new Error(
      `Недостатньо металу. Доступно: ${currentWeight} кг`
    );
  }

  if (
    usedLength !== null &&
    currentLength !== null &&
    usedLength > currentLength
  ) {
    throw new Error(
      `Недостатньо довжини. Доступно: ${currentLength} м`
    );
  }

  // ============================================
  // НОВІ ЗАЛИШКИ
  // ============================================

  const newWeight =
    Math.max(
      0,
      currentWeight - usedWeight
    );

  const newLength =
    currentLength !== null &&
    usedLength !== null
      ? Math.max(
          0,
          currentLength - usedLength
        )
      : currentLength;

  const newStatus =
    newWeight <= 0.001
      ? 'FINISHED'
      : 'IN_USE';

  // ============================================
  // ТРАНЗАКЦІЯ
  // ============================================

  await prisma.$transaction(
    async (tx) => {
      const production =
        await tx.production.create({
          data: {
            coilId,

            productId,

            variantId,

            status: 'COMPLETED',

            usedWeight,

            usedLength,

            producedQuantity,

            wasteQuantity,

            costPrice,

            note:
              note || null,
          },
        });

      // Оновлюємо рулон

      await tx.metalCoil.update({
        where: {
          id: coilId,
        },

        data: {
          currentWeight:
            newWeight,

          currentLength:
            newLength,

          status:
            newStatus,
        },
      });

      // Додаємо продукцію на склад

      await tx.stockMovement.create({
        data: {
          productId,

          variantId,

          quantity:
            producedQuantity,

          type:
            'PRODUCTION',

          productionId:
            production.id,

          note:
            `Виробництво з рулону ${coil.code}`,
        },
      });
    }
  );

  // ============================================
  // ОНОВЛЮЄМО СТОРІНКИ
  // ============================================

  revalidatePath(
    `/admin/coils/${coilId}`
  );

  revalidatePath(
    '/admin/coils'
  );

  revalidatePath(
    '/admin/products'
  );

  redirect(
    `/admin/coils/${coilId}`
  );
}
