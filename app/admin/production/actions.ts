'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';

const STEEL_DENSITY = 7850;

function toNumber(value: unknown): number {
  const result = Number(value);

  if (!Number.isFinite(result)) {
    throw new Error('Некоректне числове значення');
  }

  return result;
}

/**
 * Розрахунок ваги 1 погонного метра рулонного металу.
 *
 * width: мм
 * thickness: мм
 * result: кг/м.п.
 */
function calculateKgPerMeter(
  width: unknown,
  thickness: unknown
): number {
  const widthInMeters = toNumber(width) / 1000;
  const thicknessInMeters = toNumber(thickness) / 1000;

  return (
    widthInMeters *
    thicknessInMeters *
    STEEL_DENSITY
  );
}

/**
 * Якщо currentLength відсутній, відновлюємо
 * орієнтовний залишок у м.п. з ваги.
 */
function getAvailableLength(coil: {
  currentLength: unknown;
  currentWeight: unknown;
  width: unknown;
  thickness: unknown;
}): number {
  if (coil.currentLength !== null) {
    return Math.max(0, toNumber(coil.currentLength));
  }

  const kgPerMeter = calculateKgPerMeter(
    coil.width,
    coil.thickness
  );

  if (kgPerMeter <= 0) {
    return 0;
  }

  return Math.max(
    0,
    toNumber(coil.currentWeight) / kgPerMeter
  );
}

/* ============================================
   ЗАПУСК ВИРОБНИЦТВА
============================================ */

type StartProductionData = {
  orderId: string;

  coilAssignments: {
    variantId: string;
    coilId: string;
  }[];
};

export async function startProduction({
  orderId,
  coilAssignments,
}: StartProductionData) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      productions: {
        where: {
          status: 'IN_PROGRESS',
        },
      },
    },
  });

  if (!order) {
    throw new Error('Замовлення не знайдено');
  }

  if (order.status !== 'IN_PRODUCTION') {
    throw new Error(
      'Замовлення не передано у виробництво'
    );
  }

  if (order.productions.length > 0) {
    throw new Error(
      'Для цього замовлення вже запущено виробництво'
    );
  }

  if (order.items.length === 0) {
    throw new Error(
      'Замовлення не містить позицій для виробництва'
    );
  }

  if (coilAssignments.length === 0) {
    throw new Error(
      'Не вибрано рулони для виробництва'
    );
  }

  const requiredVariantIds = [
    ...new Set(
      order.items.map((item) => {
        if (!item.variantId) {
          throw new Error(
            'Для однієї з позицій не вказано варіант продукції'
          );
        }

        return item.variantId;
      })
    ),
  ];

  for (const variantId of requiredVariantIds) {
    const assignments =
      coilAssignments.filter(
        (assignment) =>
          assignment.variantId === variantId
      );

    if (assignments.length !== 1) {
      throw new Error(
        `Для варіанту ${variantId} потрібно вибрати один рулон`
      );
    }
  }

  for (const assignment of coilAssignments) {
    if (
      !requiredVariantIds.includes(
        assignment.variantId
      )
    ) {
      throw new Error(
        'Передано рулон для варіанту, якого немає у замовленні'
      );
    }
  }

  const coilIds = [
    ...new Set(
      coilAssignments.map(
        (assignment) => assignment.coilId
      )
    ),
  ];

  const coils = await prisma.metalCoil.findMany({
    where: {
      id: {
        in: coilIds,
      },
    },
  });

  if (coils.length !== coilIds.length) {
    throw new Error(
      'Один або декілька вибраних рулонів не знайдено'
    );
  }

  for (const coil of coils) {
    if (coil.status !== 'IN_STOCK') {
      throw new Error(
        `Рулон ${coil.code} зараз недоступний для виробництва`
      );
    }

    const availableLength =
      getAvailableLength(coil);

    if (availableLength <= 0) {
      throw new Error(
        `У рулоні ${coil.code} немає доступного металу`
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    const activeProductions =
      await tx.production.findMany({
        where: {
          coilId: {
            in: coilIds,
          },
          status: 'IN_PROGRESS',
        },
        select: {
          coilId: true,
        },
      });

    if (activeProductions.length > 0) {
      throw new Error(
        'Один із вибраних рулонів уже використовується у виробництві'
      );
    }

    /*
     * Сумарна потреба в м.п. для кожного рулону.
     * Це головний контроль залишку.
     */
    const plannedMetersByCoil =
      new Map<string, number>();

    for (const item of order.items) {
      if (!item.variantId) {
        throw new Error(
          'Для однієї з позицій не вказано варіант продукції'
        );
      }

      const assignment =
        coilAssignments.find(
          (entry) =>
            entry.variantId === item.variantId
        );

      if (!assignment) {
        throw new Error(
          'Для позиції замовлення не обрано рулон'
        );
      }

      const coil = coils.find(
        (entry) =>
          entry.id === assignment.coilId
      );

      if (!coil) {
        throw new Error(
          'Вибраний рулон не знайдено'
        );
      }

      const quantity =
        toNumber(item.quantity);

      const length =
        toNumber(item.length ?? 0);

      if (quantity <= 0 || length <= 0) {
        throw new Error(
          `Позиція ${item.id} має некоректну кількість або довжину`
        );
      }

      const itemMeters =
        quantity * length;

      plannedMetersByCoil.set(
        coil.id,
        (plannedMetersByCoil.get(coil.id) ?? 0) +
          itemMeters
      );
    }

    for (const coil of coils) {
      const requiredMeters =
        plannedMetersByCoil.get(coil.id) ?? 0;

      const availableMeters =
        getAvailableLength(coil);

      if (
        requiredMeters >
        availableMeters + 0.0001
      ) {
        throw new Error(
          `У рулоні ${coil.code} недостатньо металу. Потрібно ${requiredMeters.toFixed(
            2
          )} м.п., доступно ${availableMeters.toFixed(
            2
          )} м.п.`
        );
      }
    }

    /*
     * Створюємо Production для кожної
     * позиції замовлення.
     *
     * usedLength = планова довжина.
     * usedWeight = автоматична довідкова
     * вага цієї довжини.
     */
    for (const item of order.items) {
      if (!item.variantId) {
        throw new Error(
          'Для однієї з позицій не вказано варіант продукції'
        );
      }

      const assignment =
        coilAssignments.find(
          (entry) =>
            entry.variantId === item.variantId
        );

      if (!assignment) {
        throw new Error(
          'Для позиції замовлення не обрано рулон'
        );
      }

      const coil = coils.find(
        (entry) =>
          entry.id === assignment.coilId
      );

      if (!coil) {
        throw new Error(
          'Вибраний рулон не знайдено'
        );
      }

      const itemMeters =
        toNumber(item.quantity) *
        toNumber(item.length ?? 0);

      const kgPerMeter =
        calculateKgPerMeter(
          coil.width,
          coil.thickness
        );

      const plannedWeight =
        itemMeters * kgPerMeter;

      await tx.production.create({
        data: {
          orderId: order.id,
          coilId: coil.id,
          productId: item.productId,
          variantId: item.variantId,
          status: 'IN_PROGRESS',
          usedWeight: plannedWeight,
          usedLength: itemMeters,
          // У Production зберігаємо кількість у складській
          // одиниці товару. Для профнастилу це м².
          producedQuantity:
            itemMeters * toNumber(item.product.usefulWidth),
          wasteQuantity: 0,
          productionDate: new Date(),
          note:
            `Виробництво для замовлення ${order.number}`,
        },
      });
    }

    await tx.metalCoil.updateMany({
      where: {
        id: {
          in: coilIds,
        },
      },
      data: {
        status: 'IN_USE',
      },
    });
  });

  revalidatePath('/admin/production');
  revalidatePath(
    `/admin/production/${orderId}`
  );
  revalidatePath('/admin/orders');
  revalidatePath(
    `/admin/orders/${orderId}`
  );

  redirect(
    `/admin/production/${orderId}`
  );
}

/* ============================================
   ЗАВЕРШЕННЯ ВИРОБНИЦТВА
============================================ */

type CompleteProductionData = {
  productionId: string;

  /*
   * Основна фактична величина:
   * прокатано м.п.
   */
  usedLength: number;

  producedSheets: number;

  wasteSheets: number;
};

export async function completeProduction({
  productionId,
  usedLength,
  producedSheets,
  wasteSheets,
}: CompleteProductionData) {
  if (
    !Number.isFinite(usedLength) ||
    !Number.isFinite(producedSheets) ||
    !Number.isFinite(wasteSheets)
  ) {
    throw new Error(
      'Всі фактичні показники повинні бути числами'
    );
  }

  if (usedLength < 0) {
    throw new Error(
      'Прокатана довжина не може бути меншою за 0'
    );
  }

  if (producedSheets < 0) {
    throw new Error(
      'Кількість продукції не може бути меншою за 0'
    );
  }

  if (wasteSheets < 0) {
    throw new Error(
      'Кількість відходів не може бути меншою за 0'
    );
  }

  if (!Number.isInteger(producedSheets)) {
    throw new Error(
      'Кількість готових листів повинна бути цілим числом'
    );
  }

  if (!Number.isInteger(wasteSheets)) {
    throw new Error(
      'Кількість відходів повинна бути цілим числом'
    );
  }

  const production =
    await prisma.production.findUnique({
      where: {
        id: productionId,
      },
      include: {
        coil: true,
        order: {
          include: {
            items: { include: { product: true } },
          },
        },
      },
    });

  if (!production) {
    throw new Error(
      'Виробництво не знайдено'
    );
  }

  if (
    production.status !==
    'IN_PROGRESS'
  ) {
    throw new Error(
      'Це виробництво вже завершено або скасовано'
    );
  }

  const variantId =
    production.variantId;

  if (!variantId) {
    throw new Error(
      'Для цього виробництва не вказано варіант продукції'
    );
  }

  const coil = production.coil;

  const availableLength =
    getAvailableLength(coil);

  if (
    usedLength >
    availableLength + 0.0001
  ) {
    throw new Error(
      `У рулоні недостатньо металу. Доступно ${availableLength.toFixed(
        2
      )} м.п.`
    );
  }

  /*
   * Вага 1 м.п. визначається
   * автоматично з ширини і товщини рулону.
   */
  const kgPerMeter =
    calculateKgPerMeter(
      coil.width,
      coil.thickness
    );

  const actualUsedWeight =
    usedLength * kgPerMeter;

  /*
   * Знаходимо довжину одного виробу.
   * Вона потрібна для складського приходу
   * готової продукції в м.п.
   */
  let unitLength = 0;

  if (production.order) {
    const matchingItem =
      production.order.items.find(
        (item) =>
          item.productId ===
            production.productId &&
          item.variantId ===
            variantId &&
          Number(item.quantity) > 0
      );

    if (matchingItem) {
      unitLength =
        toNumber(
          matchingItem.length ?? 0
        );
    }
  }

  if (unitLength <= 0) {
    /*
     * Якщо довжину виробу неможливо
     * визначити із замовлення, не створюємо
     * некоректний складський прихід.
     */
    throw new Error(
      'Не вдалося визначити довжину готового виробу для складського обліку'
    );
  }

  if (!production.order) {
    throw new Error(
      'Виробництво не прив’язане до замовлення'
    );
  }

  const matchingProduct =
    production.order.items.find(
      (item) =>
        item.productId ===
          production.productId &&
        item.variantId ===
          variantId
    )?.product;

  if (!matchingProduct) {
    throw new Error(
      'Не вдалося визначити товар для складського приходу'
    );
  }

  const usefulWidth =
    toNumber(
      matchingProduct.usefulWidth
    );

  if (usefulWidth <= 0) {
    throw new Error('Для товару не задано коректну робочу ширину');
  }

  const producedMeters =
    producedSheets * unitLength;

  // StockMovement.quantity зберігається у складській одиниці товару.
  // Для профнастилу це м².
  const producedStockQuantity =
    producedMeters * usefulWidth;

  await prisma.$transaction(
    async (tx) => {
      await tx.production.update({
        where: {
          id: productionId,
        },
        data: {
          status: 'COMPLETED',

          /*
           * Фактична вага зберігається
           * автоматично, оператор її
           * не вводить.
           */
          usedWeight:
            actualUsedWeight,

          usedLength,

          producedQuantity: producedStockQuantity,

          wasteQuantity: wasteSheets,
        },
      });

      /*
       * Основний залишок рулону —
       * м.п.
       */
      const newLength =
        Math.max(
          0,
          availableLength -
            usedLength
        );

      /*
       * Вага — супутня інформація,
       * розрахована з нового залишку м.п.
       */
      const newWeight =
        newLength * kgPerMeter;

      const activeCoilProductions =
        await tx.production.count({
          where: {
            coilId:
              production.coilId,
            status:
              'IN_PROGRESS',
            id: {
              not:
                production.id,
            },
          },
        });

      const coilStatus =
        activeCoilProductions > 0
          ? 'IN_USE'
          : newLength <= 0.0001
            ? 'FINISHED'
            : 'IN_STOCK';

      await tx.metalCoil.update({
        where: {
          id:
            production.coilId,
        },
        data: {
          currentLength:
            newLength,
          currentWeight:
            newWeight,
          status:
            coilStatus,
        },
      });

      /*
       * Готова продукція заходить
       * на склад у складській одиниці товару
       * (для профнастилу — м²).
       */
      await tx.stockMovement.create({
        data: {
          productId:
            production.productId,

          variantId,

          quantity:
            producedStockQuantity,

          type:
            'PRODUCTION',

          productionId:
            production.id,

          orderId:
            production.orderId ??
            undefined,

          note:
            `Виготовлено ${producedStockQuantity.toFixed(2)} ${matchingProduct.unit || 'од.'} з рулону ${coil.code}`,
        },
      });

      if (production.orderId) {
        const activeOrderProductions =
          await tx.production.count({
            where: {
              orderId:
                production.orderId,
              status:
                'IN_PROGRESS',
            },
          });

        if (
          activeOrderProductions === 0
        ) {
          await tx.order.update({
            where: {
              id:
                production.orderId,
            },
            data: {
              status: 'READY',
            },
          });
        }
      }
    }
  );

  revalidatePath('/admin/production');
  revalidatePath('/admin/warehouse');
  revalidatePath('/admin/orders');

  if (production.orderId) {
    revalidatePath(
      `/admin/production/${production.orderId}`
    );
    revalidatePath(
      `/admin/orders/${production.orderId}`
    );
  }

  redirect('/admin/production');
}
