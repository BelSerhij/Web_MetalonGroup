'use server';

import {
  revalidatePath,
} from 'next/cache';

import {
  redirect,
} from 'next/navigation';
import { randomUUID } from 'node:crypto';

import {
  prisma,
} from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

type OrderItemInput = {
  productId: string;

  variantId: string;

  quantity: number;

  length: number;

  width?: number | null;

  price: number;
};

type CreateOrderData = {
  customerId?: string | null;

  note?: string;

  items: OrderItemInput[];
};

export async function createOrder(
  data: CreateOrderData
) {
  await requireRole('ADMIN', 'MANAGER');
  if (!data.items.length) {
    throw new Error(
      'Додайте хоча б одну позицію'
    );
  }

  const variantIds = [...new Set(data.items.map((item) => item.variantId))];
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    select: { id: true, productId: true, price: true },
  });
  if (variants.length !== variantIds.length) {
    throw new Error('Один або декілька варіантів товару не знайдено');
  }

  let totalAmount = 0;

  const orderItems =
    data.items.map(
      (item) => {
        if (
          !item.productId ||
          !item.variantId
        ) {
          throw new Error(
            'Оберіть товар та варіант'
          );
        }

        if (
          !Number.isFinite(item.quantity) ||
          !Number.isFinite(item.length) ||
          item.quantity <= 0 ||
          item.length <= 0
        ) {
          throw new Error(
            'Кількість та висота листа повинні бути більші за 0'
          );
        }

        const variant = variants.find((entry) => entry.id === item.variantId);
        if (!variant || variant.productId !== item.productId) {
          throw new Error('Варіант не відповідає вибраному товару');
        }

        const totalMeters =
          item.quantity *
          item.length;

        const itemTotal =
          totalMeters *
          Number(variant.price);

        totalAmount +=
          itemTotal;

        return {
          productId:
            item.productId,

          variantId:
            item.variantId,

          quantity:
            item.quantity,

          length:
            item.length,

          width:
            item.width ?? null,

          price: variant.price,

          total:
            itemTotal,

          parameters: {
            totalMeters,
          },
        };
      }
    );

  const orderNumber = `ORD-${randomUUID().slice(0, 8).toUpperCase()}`;

  const order =
    await prisma.order.create({
      data: {
        number:
          orderNumber,

        customerId:
          data.customerId ||
          null,

        status:
          'NEW',

        totalAmount,

        note:
          data.note ||
          null,

        items: {
          create:
            orderItems,
        },
      },
    });

  redirect(
    `/admin/orders/${order.id}`
  );
}


// ============================================
// ПІДТВЕРДЖЕННЯ ЗАМОВЛЕННЯ
// ============================================

export async function confirmOrder(
  orderId: string
) {
  await requireRole('ADMIN', 'MANAGER');
  const order =
    await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

  if (!order) {
    throw new Error(
      'Замовлення не знайдено'
    );
  }

  if (
    order.status !== 'NEW'
  ) {
    throw new Error(
      'Можна підтвердити лише нове замовлення'
    );
  }

  await prisma.order.update({
    where: {
      id: orderId,
    },

    data: {
      status:
        'CONFIRMED',
    },
  });

  revalidatePath(
    `/admin/orders/${orderId}`
  );

  revalidatePath(
    '/admin/orders'
  );
}


// ============================================
// ПЕРЕДАЧА У ВИРОБНИЦТВО
// ============================================

export async function sendOrderToProduction(
  orderId: string
) {
  await requireRole('ADMIN', 'MANAGER');
  const order =
    await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

  if (!order) {
    throw new Error(
      'Замовлення не знайдено'
    );
  }

  if (
    order.status !== 'CONFIRMED'
  ) {
    throw new Error(
      'У виробництво можна передати лише підтверджене замовлення'
    );
  }

  await prisma.order.update({
    where: {
      id: orderId,
    },

    data: {
      status:
        'IN_PRODUCTION',
    },
  });

  revalidatePath(
    `/admin/orders/${orderId}`
  );

  revalidatePath(
    '/admin/orders'
  );

  revalidatePath(
    '/admin/production'
  );

  redirect(
    '/admin/production'
  );
}
