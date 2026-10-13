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
      salesManager: true,

      items: true,
      manualItems: true,
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
    OVERPAID: 'Надмірно сплачено',
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
      case 'OVERPAID':
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
                <th>Менеджер</th>
                <th>Позиції</th>
                <th>Сума</th>
                <th>Оплата</th>
                <th>Статус</th>
                <th>Дата</th>
                <th>Дії</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => {
                const paid=Number(order.paidAmount), total=Number(order.totalAmount);
                const percent=Math.min(100,total>0?paid/total*100:0);
                const debt=total-paid;
                return (
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

                  <td>{order.salesManager?.name || '—'}</td>

                  <td>
                    <span className="admin-badge">
                      {order.items.length + order.manualItems.length}
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
                    <div className="order-payment-cell"><span className={`admin-status ${getPaymentStatusClass(order.paymentStatus)}`}>{paymentStatusLabels[order.paymentStatus]}</span><div className={`order-payment-track ${order.paymentStatus==='OVERPAID'?'is-overpaid':''}`}><i style={{width:`${percent}%`}}/></div><small>Сплачено {paid.toLocaleString('uk-UA')} / {total.toLocaleString('uk-UA')} грн</small><small>{debt<0?`Переплата ${Math.abs(debt).toLocaleString('uk-UA')} грн`:debt>0?`До сплати ${debt.toLocaleString('uk-UA')} грн`:'Розраховано повністю'}</small></div>
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
              )})}

              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
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
