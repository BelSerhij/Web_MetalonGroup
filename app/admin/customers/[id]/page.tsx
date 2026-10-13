import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { updateCustomer } from '../actions';

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id }, include: { orders: { include: { payments: true }, orderBy: { createdAt: 'desc' } } } });
  if (!customer) notFound();
  const total = customer.orders.reduce((s,o)=>s+Number(o.totalAmount),0);
  const paid = customer.orders.reduce((s,o)=>s+Number(o.paidAmount),0);
  return <div><Link className="admin-back-link" href="/admin/customers">← До клієнтів</Link><div className="admin-page-header"><div><h1>{customer.companyName || customer.name}</h1><p>{customer.phone || 'Телефон не вказаний'} · {customer.email || 'Email не вказаний'}</p></div><Link className="admin-secondary-button" href={`/admin/customers/${id}/reconciliation`}>Акт звірки</Link></div>
    <div className="admin-order-statuses"><div><span>Замовлень</span><strong>{customer.orders.length}</strong></div><div><span>Загальна сума</span><strong>{total.toLocaleString('uk-UA')} грн</strong></div><div><span>Оплачено</span><strong>{paid.toLocaleString('uk-UA')} грн</strong></div><div><span>Борг</span><strong>{(total-paid).toLocaleString('uk-UA')} грн</strong></div></div>
    <div className="admin-section-card"><h2>Замовлення та платежі</h2><div className="admin-table-wrapper"><table className="admin-table"><thead><tr><th>Замовлення</th><th>Дата</th><th>Статус</th><th>Сума</th><th>Оплачено</th><th>Оплати</th></tr></thead><tbody>{customer.orders.map(o=><tr key={o.id}><td><Link href={`/admin/orders/${o.id}`}>{o.number}</Link></td><td>{o.createdAt.toLocaleDateString('uk-UA')}</td><td>{o.status}</td><td>{Number(o.totalAmount).toLocaleString('uk-UA')} грн</td><td>{Number(o.paidAmount).toLocaleString('uk-UA')} грн</td><td>{o.payments.length}</td></tr>)}</tbody></table></div></div>
    <div className="admin-section-card"><h2>Редагувати картку клієнта</h2><form action={updateCustomer.bind(null,customer.id)} className="admin-form-grid"><label className="admin-form-group">Ім’я<input name="name" defaultValue={customer.name} required/></label><label className="admin-form-group">Компанія<input name="companyName" defaultValue={customer.companyName||''}/></label><label className="admin-form-group">Телефон<input name="phone" defaultValue={customer.phone||''}/></label><label className="admin-form-group">Email<input name="email" defaultValue={customer.email||''}/></label><label className="admin-form-group">ЄДРПОУ<input name="edrpou" defaultValue={customer.edrpou||''}/></label><label className="admin-form-group">Адреса<input name="address" defaultValue={customer.address||''}/></label><label className="admin-form-group">Нотатки<input name="note" defaultValue={customer.note||''}/></label><button className="admin-primary-button">Зберегти зміни</button></form></div></div>;
}
