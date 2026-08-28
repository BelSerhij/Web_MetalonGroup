import Link from 'next/link';
import {
  Eye,
  Plus,
} from 'lucide-react';

import { prisma } from '@/lib/prisma';

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      customer: true,

      items: true,
    },

    orderBy: {
      createdAt: 'desc',
    },
  });

  const orderStatusLabels = {
    NEW: 'Нове',
    CONFIRMED: 'Підтверджено',
    IN_PRODUCTION: 'У виробництві',
    READY: 'Готове',
    SHIPPED: 'Відправлено',
    COMPLETED: 'Завершено',
    CANCELLED: 'Скасовано',
  };

  const paymentStatusLabels = {
    PENDING: 'Не оплачено',
    PARTIAL: 'Частково',
    PAID: 'Оплачено',
    REFUNDED: 'Повернено',
  };

  const getOrderStatusClass = (
    status: keyof typeof orderStatusLabels
  ) => {
    switch (status) {
      case 'NEW':
        return 'admin-status-muted';

      case 'CONFIRMED':
        return 'admin-status-warning';

      case 'IN_PRODUCTION':
        return 'admin-status-warning';

      case 'READY':
      case 'COMPLETED':
        return 'admin-status-success';

      case 'SHIPPED':
        return 'admin-status-success';

      case 'CANCELLED':
        return 'admin-status-danger';

      default:
        return 'admin-status-muted';
    }
  };

  const getPaymentStatusClass = (
    status: keyof typeof paymentStatusLabels
  ) => {
    switch (status) {
      case 'PAID':
        return 'admin-status-success';

      case 'PARTIAL':
        return 'admin-status-warning';

      case 'PENDING':
        return 'admin-status-muted';

      case 'REFUNDED':
        return 'admin-status-danger';

      default:
        return 'admin-status-muted';
    }
  };

  return (
    <div>
      <div className="admin-page-header admin-page-header-row">
        <div>
          <h1>Замовлення</h1>

          <p>
            Управління замовленнями клієнтів
          </p>
        </div>

        <Link
          href="/admin/orders/new"
          className="admin-primary-button"
        >
          <Plus size={20} />

          Створити замовлення
        </Link>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>№ Замовлення</th>
                <th>Клієнт</th>
                <th>Позиції</th>
                <th>Сума</th>
                <th>Оплата</th>
                <th>Статус</th>
                <th>Дата</th>
                <th>Дії</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>
                      {order.number}
                    </strong>
                  </td>

                  <td>
                    {order.customer?.name ?? (
                      <span className="admin-muted">
                        Без клієнта
                      </span>
                    )}
                  </td>

                  <td>
                    <span className="admin-badge">
                      {order.items.length}
                    </span>
                  </td>

                  <td>
                    <strong>
                      {Number(
                        order.totalAmount
                      ).toLocaleString('uk-UA')}{' '}
                      грн
                    </strong>
                  </td>

                  <td>
                    <span
                      className={`admin-status ${getPaymentStatusClass(
                        order.paymentStatus
                      )}`}
                    >
                      {
                        paymentStatusLabels[
                          order.paymentStatus
                        ]
                      }
                    </span>
                  </td>

                  <td>
                    <span
                      className={`admin-status ${getOrderStatusClass(
                        order.status
                      )}`}
                    >
                      {
                        orderStatusLabels[
                          order.status
                        ]
                      }
                    </span>
                  </td>

                  <td>
                    {order.createdAt.toLocaleDateString(
                      'uk-UA'
                    )}
                  </td>

                  <td>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="admin-action-button"
                      aria-label="Переглянути замовлення"
                    >
                      <Eye size={18} />
                    </Link>
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="admin-empty"
                  >
                    Замовлень поки немає
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}