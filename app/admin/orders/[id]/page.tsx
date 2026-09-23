import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Package,
  Ruler,
  FileText,
  CheckCircle,
  Factory,
} from 'lucide-react';

import {
  confirmOrder,
  sendOrderToProduction,
} from '../actions';

import { prisma } from '@/lib/prisma';

type OrderPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderPage({
  params,
}: OrderPageProps) {
  const { id } = await params;

  const order =
    await prisma.order.findUnique({
      where: {
        id,
      },

      include: {
        customer: true,

        items: {
          include: {
            product: true,
            variant: true,
          },
        },

        payments: true,
      },
    });

  if (!order) {
    notFound();
  }

  const orderStatusLabels = {
    NEW: 'Нове',
    CONFIRMED: 'Підтверджене',
    IN_PRODUCTION: 'У виробництві',
    READY: 'Готове',
    SHIPPED: 'Відвантажене',
    COMPLETED: 'Завершене',
    CANCELLED: 'Скасоване',
  };

  const paymentStatusLabels = {
    PENDING: 'Не оплачено',
    PARTIAL: 'Частково оплачено',
    PAID: 'Оплачено',
    REFUNDED: 'Повернення',
  };

  const getOrderStatusClass = () => {
    switch (order.status) {
      case 'NEW':
        return 'admin-status-muted';

      case 'CONFIRMED':
        return 'admin-status-warning';

      case 'IN_PRODUCTION':
        return 'admin-status-info';

      case 'READY':
      case 'COMPLETED':
        return 'admin-status-success';

      case 'CANCELLED':
        return 'admin-status-danger';

      default:
        return '';
    }
  };

  const getPaymentStatusClass = () => {
    switch (order.paymentStatus) {
      case 'PAID':
        return 'admin-status-success';

      case 'PARTIAL':
        return 'admin-status-warning';

      case 'PENDING':
        return 'admin-status-muted';

      default:
        return '';
    }
  };

  const formatNumber = (
    value: number
  ) =>
    value.toLocaleString('uk-UA', {
      maximumFractionDigits: 2,
    });

  const totalSheets =
    order.items.reduce(
      (total, item) =>
        total + Number(item.quantity),
      0
    );

  const totalMeters =
    order.items.reduce(
      (total, item) => {
        return (
          total +
          Number(item.quantity) *
            Number(item.length ?? 0)
        );
      },
      0
    );

  const paidAmount =
    Number(order.paidAmount);

  const totalAmount =
    Number(order.totalAmount);

  const remainingAmount =
    totalAmount - paidAmount;

  return (
    <div>
      {/* HEADER */}

      <div className="admin-page-header admin-page-header-row">
        <div>
          <Link
            href="/admin/orders"
            className="admin-back-link"
          >
            <ArrowLeft size={18} />

            Назад до замовлень
          </Link>

          <h1>
            Замовлення {order.number}
          </h1>

          <p>
            Створено{' '}
            {order.createdAt.toLocaleDateString(
              'uk-UA'
            )}
          </p>
        </div>

        <div className="admin-page-actions">
          {order.status === 'NEW' && (
<form
  action={async () => {
    'use server';

    await confirmOrder(
      order.id
    );
  }}
>
  <button
    type="submit"
    className="admin-primary-button"
  >
    <CheckCircle size={18} />

    Підтвердити замовлення
  </button>
</form>
          )}

          {order.status === 'CONFIRMED' && (
<form
  action={async () => {
    'use server';

    await sendOrderToProduction(
      order.id
    );
  }}
>
  <button
    type="submit"
    className="admin-primary-button"
  >
    <Factory size={18} />

    У виробництво
  </button>
</form>
          )}
        </div>
      </div>

      {/* СТАТУСИ */}

      <div className="admin-order-statuses">
        <div>
          <span>
            Статус замовлення
          </span>

          <strong>
            <span
              className={`admin-status ${getOrderStatusClass()}`}
            >
              {
                orderStatusLabels[
                  order.status
                ]
              }
            </span>
          </strong>
        </div>

        <div>
          <span>
            Статус оплати
          </span>

          <strong>
            <span
              className={`admin-status ${getPaymentStatusClass()}`}
            >
              {
                paymentStatusLabels[
                  order.paymentStatus
                ]
              }
            </span>
          </strong>
        </div>
      </div>

      {/* КЛІЄНТ */}

      <div className="admin-section-card">
        <div className="admin-section-header">
          <div>
            <h2>
              Клієнт
            </h2>

            <p>
              Інформація про замовника
            </p>
          </div>

          <User size={24} />
        </div>

        {order.customer ? (
          <div className="admin-product-details">
            <div>
              <span>
                Ім&apos;я
              </span>

              <strong>
                {order.customer.name}
              </strong>
            </div>

            <div>
              <span>
                Телефон
              </span>

              <strong>
                {order.customer.phone ||
                  '—'}
              </strong>
            </div>

            <div>
              <span>
                Компанія
              </span>

              <strong>
                {order.customer.companyName ||
                  '—'}
              </strong>
            </div>

            <div>
              <span>
                Email
              </span>

              <strong>
                {order.customer.email ||
                  '—'}
              </strong>
            </div>
          </div>
        ) : (
          <div className="admin-empty">
            Клієнта не вказано
          </div>
        )}
      </div>

      {/* ПОЗИЦІЇ ЗАМОВЛЕННЯ */}

      <div className="admin-section-card">
        <div className="admin-section-header">
          <div>
            <h2>
              Позиції замовлення
            </h2>

            <p>
              Усього позицій:{' '}
              {order.items.length}
            </p>
          </div>

          <Package size={24} />
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Товар</th>
                <th>Колір</th>
                <th>Товщина</th>
                <th>Кількість</th>
                <th>Висота</th>
                <th>Метрів</th>
                <th>Ціна</th>
                <th>Сума</th>
              </tr>
            </thead>

            <tbody>
              {order.items.map(
                (item) => {
                  const quantity =
                    Number(item.quantity);

                  const length =
                    Number(
                      item.length ?? 0
                    );

                  const totalMeters =
                    quantity * length;

                  return (
                    <tr key={item.id}>
                      <td>
                        {item.product.title}
                      </td>

                      <td>
                        {item.variant.color}
                      </td>

                      <td>
                        {Number(
                          item.variant
                            .thickness
                        )}{' '}
                        мм
                      </td>

                      <td>
                        {formatNumber(
                          quantity
                        )}{' '}
                        шт.
                      </td>

                      <td>
                        {formatNumber(
                          length
                        )}{' '}
                        м
                      </td>

                      <td>
                        {formatNumber(
                          totalMeters
                        )}{' '}
                        м.п.
                      </td>

                      <td>
                        {formatNumber(
                          Number(item.price)
                        )}{' '}
                        грн
                      </td>

                      <td>
                        <strong>
                          {formatNumber(
                            Number(item.total)
                          )}{' '}
                          грн
                        </strong>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ПІДСУМОК */}

      <div className="admin-section-card">
        <div className="admin-section-header">
          <div>
            <h2>
              Підсумок замовлення
            </h2>
          </div>

          <Ruler size={24} />
        </div>

        <div className="admin-product-details">
          <div>
            <span>
              Загальна кількість листів
            </span>

            <strong>
              {formatNumber(
                totalSheets
              )}{' '}
              шт.
            </strong>
          </div>

          <div>
            <span>
              Загальна довжина
            </span>

            <strong>
              {formatNumber(
                totalMeters
              )}{' '}
              м.п.
            </strong>
          </div>

          <div>
            <span>
              Загальна сума
            </span>

            <strong>
              {formatNumber(
                totalAmount
              )}{' '}
              грн
            </strong>
          </div>
        </div>
      </div>

      {/* ОПЛАТА */}

      <div className="admin-section-card">
        <div className="admin-section-header">
          <div>
            <h2>
              Оплата
            </h2>
          </div>
        </div>

        <div className="admin-product-details">
          <div>
            <span>
              Сума замовлення
            </span>

            <strong>
              {formatNumber(
                totalAmount
              )}{' '}
              грн
            </strong>
          </div>

          <div>
            <span>
              Оплачено
            </span>

            <strong>
              {formatNumber(
                paidAmount
              )}{' '}
              грн
            </strong>
          </div>

          <div>
            <span>
              Залишок до оплати
            </span>

            <strong>
              {formatNumber(
                remainingAmount
              )}{' '}
              грн
            </strong>
          </div>
        </div>
      </div>

      {/* ПРИМІТКА */}

      {order.note && (
        <div className="admin-section-card">
          <div className="admin-section-header">
            <div>
              <h2>
                Додаткова інформація
              </h2>
            </div>

            <FileText size={24} />
          </div>

          <p className="admin-note">
            {order.note}
          </p>
        </div>
      )}
    </div>
  );
}
