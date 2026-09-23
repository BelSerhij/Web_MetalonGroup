'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

const STEEL_DENSITY = 7850;

/* =========================================================
 * HELPERS
 * ========================================================= */

function getRequiredString(
  formData: FormData,
  key: string
) {
  const value = formData.get(key);

  if (
    value === null ||
    String(value).trim() === ''
  ) {
    throw new Error(
      `Поле "${key}" є обов'язковим`
    );
  }

  return String(value).trim();
}

function getOptionalString(
  formData: FormData,
  key: string
) {
  const value = formData.get(key);

  if (
    value === null ||
    String(value).trim() === ''
  ) {
    return null;
  }

  return String(value).trim();
}

function getRequiredNumber(
  formData: FormData,
  key: string
) {
  const value = Number(
    formData.get(key)
  );

  if (
    !Number.isFinite(value)
  ) {
    throw new Error(
      `Поле "${key}" повинно містити число`
    );
  }

  return value;
}

function getOptionalNumber(
  formData: FormData,
  key: string
) {
  const raw = formData.get(key);

  if (
    raw === null ||
    String(raw).trim() === ''
  ) {
    return null;
  }

  const value = Number(raw);

  if (
    !Number.isFinite(value)
  ) {
    throw new Error(
      `Поле "${key}" повинно містити число`
    );
  }

  return value;
}

function calculateKgPerMeter(
  width: number,
  thickness: number
) {
  return (
    (width / 1000) *
    (thickness / 1000) *
    STEEL_DENSITY
  );
}

/* =========================================================
 * СТВОРЕННЯ РУЛОНУ
 * Used by:
 * /admin/coils/new/page.tsx
 * ========================================================= */

export async function createMetalCoil(
  formData: FormData
) {
  await requireRole('ADMIN', 'WAREHOUSE');
  const code =
    getRequiredString(
      formData,
      'code'
    );

  const supplierId =
    getOptionalString(
      formData,
      'supplierId'
    );

  const color =
    getRequiredString(
      formData,
      'color'
    );

  const thickness =
    getRequiredNumber(
      formData,
      'thickness'
    );

  const coating =
    getRequiredString(
      formData,
      'coating'
    );

  const paintingType =
    getRequiredString(
      formData,
      'paintingType'
    );

  const metalBrand =
    getRequiredString(
      formData,
      'metalBrand'
    );

  const zincContent =
    getRequiredNumber(
      formData,
      'zincContent'
    );

  const width =
    getRequiredNumber(
      formData,
      'width'
    );

  const initialWeight =
    getRequiredNumber(
      formData,
      'initialWeight'
    );

  const initialLength =
    getOptionalNumber(
      formData,
      'initialLength'
    );

  const purchasePrice =
    getRequiredNumber(
      formData,
      'purchasePrice'
    );

  let purchasePricePerKg =
    getOptionalNumber(
      formData,
      'purchasePricePerKg'
    );

  /* -------------------------------------------------------
   * ВАЛІДАЦІЯ
   * ------------------------------------------------------- */

  if (thickness <= 0) {
    throw new Error(
      'Товщина повинна бути більшою за 0'
    );
  }

  if (zincContent < 0) {
    throw new Error(
      'Вміст цинку не може бути відʼємним'
    );
  }

  if (width <= 0) {
    throw new Error(
      'Ширина рулону повинна бути більшою за 0'
    );
  }

  if (initialWeight <= 0) {
    throw new Error(
      'Початкова вага повинна бути більшою за 0'
    );
  }

  if (
    initialLength !== null &&
    initialLength <= 0
  ) {
    throw new Error(
      'Початкова довжина повинна бути більшою за 0'
    );
  }

  if (purchasePrice < 0) {
    throw new Error(
      'Вартість закупівлі не може бути відʼємною'
    );
  }

  if (
    purchasePricePerKg !== null &&
    purchasePricePerKg < 0
  ) {
    throw new Error(
      'Ціна за кг не може бути відʼємною'
    );
  }

  /* -------------------------------------------------------
   * ПРОВІРКА УНІКАЛЬНОГО КОДУ
   * ------------------------------------------------------- */

  const existing =
    await prisma.metalCoil.findUnique({
      where: {
        code,
      },
      select: {
        id: true,
      },
    });

  if (existing) {
    throw new Error(
      `Рулон з кодом "${code}" вже існує`
    );
  }

  /* -------------------------------------------------------
   * АВТОМАТИЧНА ДОВЖИНА
   *
   * Основна одиниця рулону — м.п.
   * Якщо довжина не задана, визначаємо
   * її з ваги, ширини та товщини.
   * ------------------------------------------------------- */

  const weightPerMeter =
    calculateKgPerMeter(
      width,
      thickness
    );

  const resolvedInitialLength =
    initialLength !== null
      ? initialLength
      : weightPerMeter > 0
        ? initialWeight /
          weightPerMeter
        : null;

  if (
    resolvedInitialLength === null ||
    !Number.isFinite(
      resolvedInitialLength
    ) ||
    resolvedInitialLength <= 0
  ) {
    throw new Error(
      'Не вдалося визначити довжину рулону'
    );
  }

  /* -------------------------------------------------------
   * АВТОМАТИЧНА ЦІНА ЗА КГ
   * ------------------------------------------------------- */

  if (
    purchasePricePerKg === null &&
    initialWeight > 0
  ) {
    purchasePricePerKg =
      purchasePrice /
      initialWeight;
  }

  /* -------------------------------------------------------
   * ПЕРЕВІРКА ПОСТАЧАЛЬНИКА
   * ------------------------------------------------------- */

  if (supplierId) {
    const supplier =
      await prisma.supplier.findUnique({
        where: {
          id: supplierId,
        },
        select: {
          id: true,
        },
      });

    if (!supplier) {
      throw new Error(
        'Постачальника не знайдено'
      );
    }
  }

  /* -------------------------------------------------------
   * СТВОРЮЄМО РУЛОН
   * ------------------------------------------------------- */

  const coil =
    await prisma.metalCoil.create({
      data: {
        code,

        supplierId,

        color,

        thickness,

        coating,

        paintingType,

        metalBrand,

        zincContent:
          Math.round(
            zincContent
          ),

        width,

        initialWeight,

        currentWeight:
          initialWeight,

        initialLength:
          resolvedInitialLength,

        currentLength:
          resolvedInitialLength,

        purchasePrice,

        purchasePricePerKg,

        status:
          'IN_STOCK',
      },
    });

  /* -------------------------------------------------------
   * CACHE
   * ------------------------------------------------------- */

  revalidatePath(
    '/admin/coils'
  );

  revalidatePath(
    `/admin/coils/${coil.id}`
  );

  revalidatePath(
    '/admin/production'
  );

  redirect(
    `/admin/coils/${coil.id}`
  );
}

/* =========================================================
 * СТВОРЕННЯ ВИРОБНИЧОЇ ОПЕРАЦІЇ
 *
 * Зберігається для старого сценарію
 * запуску виробництва без замовлення.
 * ========================================================= */

export async function createProduction(
  coilId: string,
  formData: FormData
) {
  await requireRole('ADMIN', 'PRODUCTION');
  const productId =
    getRequiredString(
      formData,
      'productId'
    );

  const variantId =
    getRequiredString(
      formData,
      'variantId'
    );

  const usedLength =
    getOptionalNumber(
      formData,
      'usedLength'
    );

  const usedWeightInput =
    getOptionalNumber(
      formData,
      'usedWeight'
    );

  const producedQuantity =
    getRequiredNumber(
      formData,
      'producedQuantity'
    );

  const wasteQuantity =
    getOptionalNumber(
      formData,
      'wasteQuantity'
    ) ?? 0;

  const costPrice =
    getOptionalNumber(
      formData,
      'costPrice'
    );

  const note =
    getOptionalString(
      formData,
      'note'
    );

  if (
    producedQuantity <= 0
  ) {
    throw new Error(
      'Вкажіть коректну кількість продукції'
    );
  }

  if (wasteQuantity < 0) {
    throw new Error(
      'Кількість відходів не може бути відʼємною'
    );
  }

  if (
    !Number.isInteger(
      producedQuantity
    )
  ) {
    throw new Error(
      'Кількість продукції повинна бути цілим числом'
    );
  }

  if (
    !Number.isInteger(
      wasteQuantity
    )
  ) {
    throw new Error(
      'Кількість відходів повинна бути цілим числом'
    );
  }

  if (
    usedLength !== null &&
    usedLength <= 0
  ) {
    throw new Error(
      'Вкажіть коректну довжину прокату'
    );
  }

  if (
    usedWeightInput !== null &&
    usedWeightInput < 0
  ) {
    throw new Error(
      'Використана вага не може бути відʼємною'
    );
  }

  const [
    coil,
    variant,
  ] = await Promise.all([
    prisma.metalCoil.findUnique({
      where: {
        id: coilId,
      },
    }),

    prisma.productVariant.findUnique({
      where: {
        id: variantId,
      },
    }),
  ]);

  if (!coil) {
    throw new Error(
      'Рулон не знайдено'
    );
  }

  if (!variant) {
    throw new Error(
      'Варіант товару не знайдено'
    );
  }

  if (
    variant.productId !==
    productId
  ) {
    throw new Error(
      'Варіант не належить обраному товару'
    );
  }

  if (
    coil.status ===
    'FINISHED'
  ) {
    throw new Error(
      'Цей рулон уже повністю використаний'
    );
  }

  if (
    coil.status ===
    'WRITTEN_OFF'
  ) {
    throw new Error(
      'Списаний рулон не можна використовувати'
    );
  }

  if (
    Number(
      variant.thickness
    ) !==
    Number(
      coil.thickness
    )
  ) {
    throw new Error(
      `Товщина рулону (${coil.thickness} мм) не відповідає товару (${variant.thickness} мм)`
    );
  }

  if (
    variant.color !==
    coil.color
  ) {
    throw new Error(
      `Колір рулону (${coil.color}) не відповідає товару (${variant.color})`
    );
  }

  if (
    variant.coating !==
    coil.coating
  ) {
    throw new Error(
      'Покриття рулону не відповідає товару'
    );
  }

  if (
    variant.paintingType !==
    coil.paintingType
  ) {
    throw new Error(
      'Тип фарбування рулону не відповідає товару'
    );
  }

  const currentWeight =
    Number(
      coil.currentWeight
    );

  const currentLength =
    coil.currentLength !==
    null
      ? Number(
          coil.currentLength
        )
      : null;

  const weightPerMeter =
    calculateKgPerMeter(
      Number(coil.width),
      Number(coil.thickness)
    );

  const calculatedWeight =
    usedLength !== null
      ? usedLength *
        weightPerMeter
      : null;

  const usedWeight =
    calculatedWeight !== null
      ? calculatedWeight
      : usedWeightInput;

  if (
    usedWeight === null ||
    !Number.isFinite(
      usedWeight
    ) ||
    usedWeight <= 0
  ) {
    throw new Error(
      'Вкажіть довжину прокату — вага буде розрахована автоматично'
    );
  }

  if (
    usedWeight >
    currentWeight +
      0.0001
  ) {
    throw new Error(
      `Недостатньо металу. Доступно ${currentWeight.toFixed(2)} кг`
    );
  }

  if (
    usedLength !== null &&
    currentLength !== null &&
    usedLength >
      currentLength +
        0.0001
  ) {
    throw new Error(
      `Недостатньо металу в довжині. Доступно ${currentLength.toFixed(2)} м.п.`
    );
  }

  const newWeight =
    Math.max(
      0,
      currentWeight -
        usedWeight
    );

  const newLength =
    currentLength !== null &&
    usedLength !== null
      ? Math.max(
          0,
          currentLength -
            usedLength
        )
      : currentLength;

  const newStatus =
    newWeight <= 0.001
      ? 'FINISHED'
      : 'IN_STOCK';

  await prisma.$transaction(
    async (tx) => {
      const production =
        await tx.production.create({
          data: {
            coilId,

            productId,

            variantId,

            status:
              'COMPLETED',

            usedWeight,

            usedLength,

            producedQuantity,

            wasteQuantity,

            costPrice,

            note:
              note || null,
          },
        });

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

  revalidatePath(
    `/admin/coils/${coilId}`
  );

  revalidatePath(
    '/admin/coils'
  );

  revalidatePath(
    '/admin/products'
  );

  revalidatePath(
    '/admin/warehouse'
  );

  redirect(
    `/admin/coils/${coilId}`
  );
}

/* =========================================================
 * ЗАПУСК ВИРОБНИЦТВА ЗАМОВЛЕННЯ
 * ========================================================= */

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
  await requireRole('ADMIN', 'PRODUCTION');
  if (
    !orderId ||
    coilAssignments.length ===
      0
  ) {
    throw new Error(
      'Замовлення та призначення рулонів є обовʼязковими'
    );
  }

  const order =
    await prisma.order.findUnique({
      where: {
        id: orderId,
      },

      include: {
        items: true,

        productions: {
          where: {
            status:
              'IN_PROGRESS',
          },
        },
      },
    });

  if (!order) {
    throw new Error(
      'Замовлення не знайдено'
    );
  }

  if (
    order.status !==
    'IN_PRODUCTION'
  ) {
    throw new Error(
      'Замовлення не передано у виробництво'
    );
  }

  if (
    order.productions.length >
    0
  ) {
    throw new Error(
      'Для цього замовлення вже запущено виробництво'
    );
  }

  if (
    order.items.length ===
    0
  ) {
    throw new Error(
      'Замовлення не містить позицій для виробництва'
    );
  }

  const requiredVariantIds =
    [
      ...new Set(
        order.items.map(
          (item) => {
            if (
              !item.variantId
            ) {
              throw new Error(
                'Для позиції не вказано варіант продукції'
              );
            }

            return item.variantId;
          }
        )
      ),
    ];

  for (
    const variantId of
    requiredVariantIds
  ) {
    const assignment =
      coilAssignments.find(
        (item) =>
          item.variantId ===
          variantId
      );

    if (!assignment) {
      throw new Error(
        'Для кожного варіанту потрібно вибрати рулон'
      );
    }
  }

  const coilIds = [
    ...new Set(
      coilAssignments.map(
        (item) =>
          item.coilId
      )
    ),
  ];

  const coils =
    await prisma.metalCoil.findMany({
      where: {
        id: {
          in: coilIds,
        },
      },
    });

  if (
    coils.length !==
    coilIds.length
  ) {
    throw new Error(
      'Один або декілька рулонів не знайдено'
    );
  }

  /* -------------------------------------------------------
   * Перевіряємо рулони ДО транзакції.
   * Один і той самий рулон дозволений
   * для декількох позицій одного замовлення.
   * ------------------------------------------------------- */

  const requirementByVariant =
    new Map<
      string,
      {
        meters: number;
        productId: string;
      }
    >();

  for (
    const item of order.items
  ) {
    const meters =
      Number(item.quantity) *
      Number(item.length ?? 0);

    const existing =
      requirementByVariant.get(
        item.variantId
      );

    if (existing) {
      existing.meters +=
        meters;
    } else {
      requirementByVariant.set(
        item.variantId,
        {
          meters,
          productId:
            item.productId,
        }
      );
    }
  }

  const metersByCoil =
    new Map<
      string,
      number
    >();

  for (
    const assignment of
    coilAssignments
  ) {
    const requirement =
      requirementByVariant.get(
        assignment.variantId
      );

    if (!requirement) {
      continue;
    }

    metersByCoil.set(
      assignment.coilId,
      (metersByCoil.get(
        assignment.coilId
      ) ?? 0) +
        requirement.meters
    );
  }

  for (
    const assignment of
    coilAssignments
  ) {
    const coil =
      coils.find(
        (item) =>
          item.id ===
          assignment.coilId
      );

    if (!coil) {
      throw new Error(
        'Рулон не знайдено'
      );
    }

    if (
      coil.status !==
      'IN_STOCK'
    ) {
      throw new Error(
        `Рулон ${coil.code} недоступний для виробництва`
      );
    }
  }

  /*
   * Перевіряємо сумарну потребу по кожному рулону.
   */

  for (
    const [coilId, meters] of
    metersByCoil.entries()
  ) {
    const coil =
      coils.find(
        (item) =>
          item.id ===
          coilId
      );

    if (!coil) {
      continue;
    }

    const availableLength =
      coil.currentLength !== null
        ? Number(
            coil.currentLength
          )
        : Number(
            coil.currentWeight
          ) /
          calculateKgPerMeter(
            Number(coil.width),
            Number(
              coil.thickness
            )
          );

    if (
      meters >
      availableLength +
        0.0001
    ) {
      throw new Error(
        `Рулон ${coil.code}: потрібно ${meters.toFixed(
          2
        )} м.п., доступно ${availableLength.toFixed(
          2
        )} м.п.`
      );
    }
  }

  await prisma.$transaction(
    async (tx) => {
      const activeProductions =
        await tx.production.findMany({
          where: {
            coilId: {
              in: coilIds,
            },

            status:
              'IN_PROGRESS',
          },

          select: {
            coilId: true,
          },
        });

      if (
        activeProductions.length >
        0
      ) {
        throw new Error(
          'Один із вибраних рулонів уже використовується'
        );
      }

      for (
        const item of order.items
      ) {
        const assignment =
          coilAssignments.find(
            (entry) =>
              entry.variantId ===
              item.variantId
          );

        if (!assignment) {
          throw new Error(
            'Для позиції не обрано рулон'
          );
        }

        const coil =
          coils.find(
            (entry) =>
              entry.id ===
              assignment.coilId
          );

        if (!coil) {
          throw new Error(
            'Обраний рулон не знайдено'
          );
        }

        const variant =
          await tx.productVariant.findUnique({
            where: {
              id: item.variantId,
            },
          });

        if (!variant) {
          throw new Error(
            'Варіант продукції не знайдено'
          );
        }

        if (
          Number(variant.thickness) !==
          Number(coil.thickness)
        ) {
          throw new Error(
            `Товщина рулону ${coil.code} (${coil.thickness} мм) не відповідає варіанту (${variant.thickness} мм)`
          );
        }

        if (
          variant.color !==
          coil.color
        ) {
          throw new Error(
            `Колір рулону ${coil.code} не відповідає варіанту`
          );
        }

        if (
          variant.coating !==
          coil.coating
        ) {
          throw new Error(
            `Покриття рулону ${coil.code} не відповідає варіанту`
          );
        }

        if (
          variant.paintingType !==
          coil.paintingType
        ) {
          throw new Error(
            `Тип фарбування рулону ${coil.code} не відповідає варіанту`
          );
        }

        if (
          variant.metalBrand !==
          coil.metalBrand
        ) {
          throw new Error(
            `Марка металу рулону ${coil.code} не відповідає варіанту`
          );
        }

        const itemMeters =
          Number(
            item.quantity
          ) *
          Number(
            item.length ?? 0
          );

        const weightPerMeter =
          calculateKgPerMeter(
            Number(coil.width),
            Number(
              coil.thickness
            )
          );

        const requiredWeight =
          itemMeters *
          weightPerMeter;

        await tx.production.create({
          data: {
            orderId:
              order.id,

            coilId:
              coil.id,

            productId:
              item.productId,

            variantId:
              item.variantId,

            status:
              'IN_PROGRESS',

            usedWeight:
              requiredWeight,

            usedLength:
              itemMeters,

            producedQuantity:
              item.quantity,

            wasteQuantity:
              0,

            productionDate:
              new Date(),

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
          status:
            'IN_USE',
        },
      });
    }
  );

  revalidatePath(
    '/admin/production'
  );

  revalidatePath(
    `/admin/production/${orderId}`
  );

  revalidatePath(
    '/admin/orders'
  );

  revalidatePath(
    `/admin/orders/${orderId}`
  );

  redirect(
    `/admin/production/${orderId}`
  );
}

/* =========================================================
 * ЗАВЕРШЕННЯ ВИРОБНИЦТВА
 *
 * Основна одиниця — м.п.
 * Вага розраховується автоматично.
 * ========================================================= */

type CompleteProductionData = {
  productionId: string;
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
  await requireRole('ADMIN', 'PRODUCTION');
  if (
    !Number.isFinite(
      usedLength
    ) ||
    !Number.isFinite(
      producedSheets
    ) ||
    !Number.isFinite(
      wasteSheets
    )
  ) {
    throw new Error(
      'Всі фактичні показники повинні бути числами'
    );
  }

  if (
    usedLength <= 0
  ) {
    throw new Error(
      'Фактично прокатана довжина повинна бути більшою за 0'
    );
  }

  if (
    !Number.isInteger(
      producedSheets
    ) ||
    producedSheets < 0
  ) {
    throw new Error(
      'Кількість готових листів повинна бути цілим числом'
    );
  }

  if (
    !Number.isInteger(
      wasteSheets
    ) ||
    wasteSheets < 0
  ) {
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

        product: true,

        variant: true,

        order: true,
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
      'Для виробництва не вказано варіант продукції'
    );
  }

  const coil =
    production.coil;

  const currentWeight =
    Number(
      coil.currentWeight
    );

  const currentLength =
    coil.currentLength !==
    null
      ? Number(
          coil.currentLength
        )
      : null;

  if (
    currentLength !== null &&
    usedLength >
      currentLength +
        0.0001
  ) {
    throw new Error(
      `У рулоні ${coil.code} доступно лише ${currentLength.toFixed(
        2
      )} м.п.`
    );
  }

  const weightPerMeter =
    calculateKgPerMeter(
      Number(coil.width),
      Number(coil.thickness)
    );

  const usedWeight =
    usedLength *
    weightPerMeter;

  if (
    usedWeight >
    currentWeight +
      0.0001
  ) {
    throw new Error(
      `Недостатньо металу. Розрахунково потрібно ${usedWeight.toFixed(
        2
      )} кг, доступно ${currentWeight.toFixed(
        2
      )} кг`
    );
  }

  const newWeight =
    Math.max(
      0,
      currentWeight -
        usedWeight
    );

  const newLength =
    currentLength !==
      null
      ? Math.max(
          0,
          currentLength -
            usedLength
        )
      : null;

  const newStatus =
    newWeight <= 0.001
      ? 'FINISHED'
      : 'IN_STOCK';

  await prisma.$transaction(
    async (tx) => {
      await tx.production.update({
        where: {
          id:
            productionId,
        },

        data: {
          status:
            'COMPLETED',

          usedWeight,

          usedLength,

          producedQuantity:
            producedSheets,

          wasteQuantity:
            wasteSheets,
        },
      });

      await tx.metalCoil.update({
        where: {
          id:
            coil.id,
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

      /*
       * StockMovement.quantity —
       * основна складська кількість.
       *
       * Для профільної продукції
       * використовуємо кількість готових
       * листів, оскільки модель зараз
       * не має окремого quantityMeters.
       */

      await tx.stockMovement.create({
        data: {
          productId:
            production.productId,

          variantId,

          quantity:
            producedSheets,

          type:
            'PRODUCTION',

          productionId:
            production.id,

          orderId:
            production.orderId,

          note:
            `Виготовлено ${producedSheets} шт. з рулону ${coil.code}; прокатано ${usedLength.toFixed(
              2
            )} м.п.`,
        },
      });

      if (
        production.orderId
      ) {
        const remaining =
          await tx.production.count({
            where: {
              orderId:
                production.orderId,

              status:
                'IN_PROGRESS',
            },
          });

        if (
          remaining === 0
        ) {
          await tx.order.update({
            where: {
              id:
                production.orderId,
            },

            data: {
              status:
                'READY',
            },
          });
        }
      }
    }
  );

  revalidatePath(
    '/admin/production'
  );

  revalidatePath(
    '/admin/warehouse'
  );

  revalidatePath(
    '/admin/orders'
  );

  if (
    production.orderId
  ) {
    revalidatePath(
      `/admin/production/${production.orderId}`
    );

    revalidatePath(
      `/admin/orders/${production.orderId}`
    );
  }

  revalidatePath(
    `/admin/coils/${coil.id}`
  );

  redirect(
    '/admin/production'
  );
}
