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
  salesManagerId?: string | null;

  note?: string;

  deliveryService?: string;
  deliveryAddress?: string;
  trackingNumber?: string;

  manualItems?: { title: string; unit: string; quantity: number; purchasePrice?: number; price: number; note?: string }[];

  items: OrderItemInput[];
};

export async function createOrder(
  data: CreateOrderData
) {
  await requireRole('ADMIN', 'MANAGER');
  if (!data.items.length && !data.manualItems?.length) {
    throw new Error(
      'Додайте хоча б одну позицію'
    );
  }
  const salesManager=data.salesManagerId?await prisma.employee.findUnique({where:{id:data.salesManagerId},select:{employeeType:true,isActive:true,bonusPerMeter:true}}):null;
  if(data.salesManagerId&&(!salesManager||salesManager.employeeType!=='SALES'||!salesManager.isActive)) throw new Error('Оберіть активного менеджера з продажу');

  const variantIds = [...new Set(data.items.map((item) => item.variantId))];
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    select: { id: true, productId: true, price: true, purchasePrice: true },
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
          costPrice: variant.purchasePrice,

          total:
            itemTotal,

          parameters: {
            totalMeters,
          },
        };
      }
    );

  const manualItems = (data.manualItems ?? []).map((item) => {
    const title = item.title.trim();
    if (!title || !Number.isFinite(item.quantity) || item.quantity <= 0 || !Number.isFinite(item.purchasePrice) || (item.purchasePrice ?? 0) < 0 || !Number.isFinite(item.price) || item.price <= 0) throw new Error('Перевірте назву, кількість, закупівельну та продажну ціни ручної позиції');
    return { title, unit: item.unit || 'шт.', quantity: item.quantity, purchasePrice: item.purchasePrice ?? null, price: item.price, total: item.quantity * item.price, note: item.note?.trim() || null };
  });
  totalAmount += manualItems.reduce((sum, item) => sum + item.total, 0);

  const orderNumber = `ORD-${randomUUID().slice(0, 8).toUpperCase()}`;

  const order =
    await prisma.order.create({
      data: {
        number:
          orderNumber,

        customerId:
          data.customerId ||
          null,
        salesManagerId: data.salesManagerId || null,
        salesBonusPerMeter: salesManager?.bonusPerMeter ?? null,

        status:
          'NEW',

        totalAmount,
        deliveryService: data.deliveryService || null,
        deliveryAddress: data.deliveryAddress || null,
        trackingNumber: data.trackingNumber || null,

        note:
          data.note ||
          null,

        items: {
          create:
            orderItems,
        },
        manualItems: { create: manualItems },
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

export async function advancePartnerOrder(orderId: string) {
  await requireRole('ADMIN', 'MANAGER');
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: { select: { parameters: true } }, manualItems: { select: { id: true } } } });
  if (!order) throw new Error('Замовлення не знайдено');
  const isPartnerOnly = order.items.length > 0 && order.items.every((item) => {
    const value = item.parameters;
    return Boolean(value && typeof value === 'object' && !Array.isArray(value) && value.fulfillment === 'PARTNER');
  });
  if (!isPartnerOnly || order.manualItems.length) throw new Error('Це замовлення не є суто партнерським або містить позиції для закупівлі');
  const nextStatus = order.status === 'CONFIRMED' ? 'SHIPPED' : order.status === 'SHIPPED' ? 'COMPLETED' : null;
  if (!nextStatus) throw new Error('Змінити статус можна лише підтвердженого партнерського замовлення');
  await prisma.order.update({ where: { id: orderId }, data: { status: nextStatus } });
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
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
      include: { manualItems: { select: { id: true } } },
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
  if (order.manualItems.length) throw new Error('Замовлення містить позиції, які потрібно закупити; передайте у виробництво лише після розділення замовлення');

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

export async function shipManufacturedOrder(orderId: string) {
  await requireRole('ADMIN', 'MANAGER');
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new Error('Замовлення не знайдено');
    if (order.status !== 'READY') throw new Error('Відвантажити можна лише готове замовлення');
    if (order.items.length === 0) throw new Error('У замовленні немає товарів');

    const previousSales = await tx.stockMovement.count({ where: { orderId, type: 'SALE' } });
    if (previousSales > 0) throw new Error('Для цього замовлення вже списано товар зі складу');

    const requirements = new Map<string, number>();
    for (const item of order.items) {
      const unitQuantity = /м²|м2/i.test(item.product.unit)
        ? Number(item.quantity) * Number(item.length ?? 0) * Number(item.width ?? item.product.usefulWidth)
        : Number(item.quantity) * Number(item.length ?? 1);
      requirements.set(item.variantId, (requirements.get(item.variantId) ?? 0) + unitQuantity);
    }
    const movements = await tx.stockMovement.findMany({
      where: { variantId: { in: [...requirements.keys()] } },
      select: { variantId: true, quantity: true, type: true },
    });
    for (const [variantId, required] of requirements) {
      const available = movements.reduce((balance, movement) => {
        if (movement.variantId !== variantId) return balance;
        const quantity = Number(movement.quantity);
        return balance + (movement.type === 'SALE' || movement.type === 'WRITE_OFF' ? -quantity : quantity);
      }, 0);
      if (available + 0.001 < required) {
        throw new Error(`Недостатньо готової продукції на складі: потрібно ${required.toFixed(2)}, доступно ${available.toFixed(2)}`);
      }
    }

    for (const item of order.items) {
      const quantity = /м²|м2/i.test(item.product.unit)
        ? Number(item.quantity) * Number(item.length ?? 0) * Number(item.width ?? item.product.usefulWidth)
        : Number(item.quantity) * Number(item.length ?? 1);
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          variantId: item.variantId,
          orderId,
          quantity,
          type: 'SALE',
          note: `Відвантаження замовлення ${order.number}`,
        },
      });
    }
    await tx.order.update({ where: { id: orderId }, data: { status: 'SHIPPED' } });
  });
  revalidatePath('/admin/warehouse');
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function markOrderPaid(orderId: string, method: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error('Замовлення не знайдено');
  return recordOrderPayment(orderId, Number(order.totalAmount) - Number(order.paidAmount), method);
}

export async function recordOrderPayment(orderId: string, amount: number, method: string, note?: string) {
  await requireRole('ADMIN', 'MANAGER');
  if (!['CASH', 'CARD', 'BANK_TRANSFER'].includes(method)) throw new Error('Оберіть коректний спосіб оплати');
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Сума оплати має бути більшою за 0');
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Замовлення не знайдено');
    const paidAmount = Number(order.paidAmount) + amount;
    const due = Number(order.totalAmount);
    const paymentStatus = paidAmount > due + 0.005 ? 'OVERPAID' : paidAmount >= due - 0.005 ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'PENDING';
    await tx.payment.create({
      data: { orderId, amount, method: method as 'CASH' | 'CARD' | 'BANK_TRANSFER', note: note?.trim() || null },
    });
    await tx.order.update({
      where: { id: orderId },
      data: { paidAmount, paymentStatus },
    });
  });
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function updateOrderDelivery(orderId: string, data: { deliveryService: string; deliveryAddress: string; trackingNumber: string }) {
  await requireRole('ADMIN', 'MANAGER');
  await prisma.order.update({ where: { id: orderId }, data: { deliveryService: data.deliveryService || null, deliveryAddress: data.deliveryAddress || null, trackingNumber: data.trackingNumber || null } });
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function updateOrderSalesManager(orderId:string, salesManagerId:string) {
  await requireRole('ADMIN','MANAGER');
  const order=await prisma.order.findUnique({where:{id:orderId},select:{status:true}});
  if(!order) throw new Error('Замовлення не знайдено');
  if(['SHIPPED','COMPLETED'].includes(order.status)) throw new Error('Відповідального менеджера не можна змінити після відвантаження');
  const employee=salesManagerId?await prisma.employee.findUnique({where:{id:salesManagerId},select:{employeeType:true,isActive:true,bonusPerMeter:true}}):null;
  if(salesManagerId&&(!employee||employee.employeeType!=='SALES'||!employee.isActive))throw new Error('Оберіть активного менеджера з продажу');
  await prisma.order.update({where:{id:orderId},data:{salesManagerId:salesManagerId||null,salesBonusPerMeter:employee?.bonusPerMeter??null}});
  revalidatePath(`/admin/orders/${orderId}`); revalidatePath('/admin/orders'); revalidatePath('/admin/employees');
}

export async function completeShippedOrder(orderId: string) {
  await requireRole('ADMIN', 'MANAGER');
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error('Замовлення не знайдено');
  if (order.status !== 'SHIPPED' || !['PAID', 'OVERPAID'].includes(order.paymentStatus)) {
    throw new Error('Завершити можна лише відвантажене та повністю оплачене замовлення');
  }
  await prisma.order.update({ where: { id: orderId }, data: { status: 'COMPLETED' } });
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
}
