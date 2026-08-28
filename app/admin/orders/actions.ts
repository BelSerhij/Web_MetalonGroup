'use server';

import {
  revalidatePath,
} from 'next/cache';

import {
  redirect,
} from 'next/navigation';

import {
  prisma,
} from '@/lib/prisma';

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
  if (!data.items.length) {
    throw new Error(
      'Додайте хоча б одну позицію'
    );
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
          item.quantity <= 0 ||
          item.length <= 0
        ) {
          throw new Error(
            'Кількість та висота листа повинні бути більші за 0'
          );
        }

        const totalMeters =
          item.quantity *
          item.length;

        const itemTotal =
          totalMeters *
          item.price;

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

          price:
            item.price,

          total:
            itemTotal,

          parameters: {
            totalMeters,
          },
        };
      }
    );

  const ordersCount =
    await prisma.order.count();

  const orderNumber =
    `ORD-${String(
      ordersCount + 1
    ).padStart(5, '0')}`;

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