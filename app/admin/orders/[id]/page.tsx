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
  Truck,
  BadgeCheck,
} from 'lucide-react';

import {
  confirmOrder,
  sendOrderToProduction,
  advancePartnerOrder,
  shipManufacturedOrder,
  markOrderPaid,
  completeShippedOrder,
  recordOrderPayment,
  updateOrderDelivery,
  updateOrderSalesManager,
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
        salesManager: true,

        items: {
          include: {
            product: true,
            variant: true,
          },
        },

        payments: true,
        manualItems: true,
      },
    });

  if (!order) {
    notFound();
  }
  const salesManagers=await prisma.employee.findMany({where:{employeeType:'SALES',isActive:true},select:{id:true,name:true},orderBy:{name:'asc'}});

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
    OVERPAID: 'Надмірно сплачено',
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
      case 'OVERPAID':
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
  const canSendToProduction = order.items.every((item) => {
    const parameters = item.parameters;
    return !parameters || typeof parameters !== 'object' || Array.isArray(parameters) || parameters.fulfillment !== 'PARTNER';
  });
  const isPartnerOrder = order.items.length > 0 && order.items.every((item) => {
    const parameters = item.parameters;
    return Boolean(parameters && typeof parameters === 'object' && !Array.isArray(parameters) && parameters.fulfillment === 'PARTNER');
  });

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

          {order.status === 'CONFIRMED' && canSendToProduction && (
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
          {isPartnerOrder && ['CONFIRMED', 'SHIPPED'].includes(order.status) && <form action={async () => {
            'use server';
            await advancePartnerOrder(order.id);
          }}><button type="submit" className="admin-primary-button">{order.status === 'CONFIRMED' ? 'Позначити відправленим' : 'Завершити замовлення'}</button></form>}
          {order.status === 'READY' && !isPartnerOrder && <form action={async () => {
            'use server';
            await shipManufacturedOrder(order.id);
          }}><button type="submit" className="admin-primary-button"><Truck size={18} /> Відвантажити зі складу</button></form>}
          {order.paymentStatus !== 'PAID' && order.paymentStatus !== 'OVERPAID' && <form action={async (formData) => {
            'use server';
            await recordOrderPayment(order.id, Number(formData.get('amount')), String(formData.get('method') ?? ''), String(formData.get('note') ?? ''));
          }} className="admin-order-payment-action"><label>Сума<input name="amount" type="number" min="0.01" step="0.01" defaultValue={Math.max(0, remainingAmount).toFixed(2)} required /></label><select name="method" aria-label="Спосіб оплати" defaultValue="BANK_TRANSFER"><option value="BANK_TRANSFER">Переказ</option><option value="CASH">Готівка</option><option value="CARD">Картка</option></select><button type="submit" className="admin-primary-button"><CheckCircle size={18} /> Записати оплату</button></form>}
          {order.status === 'SHIPPED' && (order.paymentStatus === 'PAID' || order.paymentStatus === 'OVERPAID') && <form action={async () => {
            'use server';
            await completeShippedOrder(order.id);
          }}><button type="submit" className="admin-primary-button"><BadgeCheck size={18} /> Завершити замовлення</button></form>}
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

      <div className="admin-section-card"><div className="admin-section-header"><div><h2>Документи</h2><p>Відкрийте шаблон, відредагуйте поля перед друком або збереженням у PDF</p></div><FileText size={22} /></div><div className="admin-page-actions"><Link className="admin-secondary-button" href={`/admin/orders/${order.id}/documents/invoice`}>Рахунок</Link><Link className="admin-secondary-button" href={`/admin/orders/${order.id}/documents/waybill`}>Видаткова</Link><Link className="admin-secondary-button" href={`/admin/orders/${order.id}/documents/ttn`}>ТТН</Link></div></div>

      <div className="admin-section-card"><div className="admin-section-header"><div><h2>Оплати</h2><p>Дата останньої оплати підтягується автоматично при записі платежу</p></div></div>{order.payments.length ? <div className="admin-table-wrapper"><table className="admin-table"><thead><tr><th>Дата</th><th>Спосіб</th><th>Сума</th><th>Примітка</th></tr></thead><tbody>{order.payments.sort((a,b)=>b.paidAt.getTime()-a.paidAt.getTime()).map((payment)=><tr key={payment.id}><td>{payment.paidAt.toLocaleString('uk-UA')}</td><td>{{CASH:'Готівка',CARD:'Картка',BANK_TRANSFER:'Переказ'}[payment.method]}</td><td>{formatNumber(Number(payment.amount))} грн</td><td>{payment.note || '—'}</td></tr>)}</tbody></table></div>:<p>Платежів поки немає.</p>}</div>

      <div className="admin-section-card"><div className="admin-section-header"><div><h2>Доставка</h2><p>Служба, адреса та номер накладної</p></div><Truck size={22} /></div><form className="admin-form-grid" action={async(formData)=>{'use server';await updateOrderDelivery(order.id,{deliveryService:String(formData.get('deliveryService')??''),deliveryAddress:String(formData.get('deliveryAddress')??''),trackingNumber:String(formData.get('trackingNumber')??'')})}}><label className="admin-form-group">Служба доставки<select name="deliveryService" defaultValue={order.deliveryService||'Самовивіз'}>{['Нова пошта','Укрпошта','Делівері','Наша доставка','Самовивіз'].map((x)=><option key={x}>{x}</option>)}</select></label><label className="admin-form-group">Адреса / відділення<input name="deliveryAddress" defaultValue={order.deliveryAddress||''}/></label><label className="admin-form-group">Номер ТТН<input name="trackingNumber" defaultValue={order.trackingNumber||''}/></label><button className="admin-secondary-button">Зберегти доставку</button></form></div>

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
            <div><span>Менеджер</span><strong>{order.salesManager?.name || '—'}</strong></div>
          </div>
        ) : (
          <div className="admin-empty">
            Клієнта не вказано
          </div>
        )}
        <form action={async(formData)=>{'use server';await updateOrderSalesManager(order.id,String(formData.get('salesManagerId')??''))}} className="order-manager-form"><label>Відповідальний менеджер<select name="salesManagerId" defaultValue={order.salesManagerId||''}><option value="">Не призначено</option>{salesManagers.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label><button className="admin-secondary-button">Зберегти</button></form>
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
              {order.items.length + order.manualItems.length}
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
              {order.manualItems.map((item) => <tr key={item.id}><td><strong>{item.title}</strong><small>Потрібно закупити{item.note ? ` · ${item.note}` : ''}</small></td><td>—</td><td>—</td><td>{formatNumber(Number(item.quantity))} {item.unit}</td><td>—</td><td>—</td><td>{formatNumber(Number(item.price))} грн / {item.unit}</td><td><strong>{formatNumber(Number(item.total))} грн</strong></td></tr>)}
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

        <div className="admin-product-details admin-order-payment-summary">
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
        <div className="admin-order-payment-meter"><div><span>Стан оплати</span><strong className={`admin-status ${getPaymentStatusClass()}`}>{paymentStatusLabels[order.paymentStatus]}</strong></div><div className={`order-payment-track ${order.paymentStatus==='OVERPAID'?'is-overpaid':''}`}><i style={{width:`${Math.min(100,totalAmount>0?paidAmount/totalAmount*100:0)}%`}}/></div></div>
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
