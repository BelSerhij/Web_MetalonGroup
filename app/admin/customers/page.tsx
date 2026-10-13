import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function addCustomer(formData: FormData) {
  'use server';
  await requireRole('ADMIN', 'MANAGER');
  const name = String(formData.get('name') ?? '').trim();
  if (!name) throw new Error('Вкажіть ім’я або назву клієнта');
  await prisma.customer.create({ data: { name, phone: String(formData.get('phone') ?? '') || null, email: String(formData.get('email') ?? '') || null, companyName: String(formData.get('companyName') ?? '') || null, edrpou: String(formData.get('edrpou') ?? '') || null, address: String(formData.get('address') ?? '') || null } });
  revalidatePath('/admin/customers');
}

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({ include: { orders: { select: { id: true, number: true, totalAmount: true, paidAmount: true, paymentStatus: true, createdAt: true } } }, orderBy: { updatedAt: 'desc' } });
  const fmt = (n: number) => n.toLocaleString('uk-UA', { maximumFractionDigits: 2 });
  return <div><div className="admin-page-header"><div><h1>Клієнти</h1><p>Контакти, історія замовлень, оплати й заборгованість</p></div></div>
    <div className="admin-section-card"><div className="admin-section-header"><div><h2>Новий клієнт</h2><p>Додайте покупця до реєстру</p></div></div><form action={addCustomer} className="admin-form-grid"><label className="admin-form-group">Ім’я / контакт<input name="name" required /></label><label className="admin-form-group">Компанія<input name="companyName" /></label><label className="admin-form-group">Телефон<input name="phone" /></label><label className="admin-form-group">Email<input name="email" type="email" /></label><label className="admin-form-group">ЄДРПОУ<input name="edrpou" /></label><label className="admin-form-group">Адреса<input name="address" /></label><button className="admin-primary-button" type="submit">Створити клієнта</button></form></div>
    <div className="admin-section-card"><div className="admin-section-header"><div><h2>Реєстр клієнтів</h2><p>{customers.length} записів</p></div></div><div className="admin-table-wrapper"><table className="admin-table"><thead><tr><th>Клієнт</th><th>Контакти</th><th>Замовлень</th><th>На суму</th><th>Оплачено</th><th>Борг</th><th></th></tr></thead><tbody>{customers.map((c)=>{const total=c.orders.reduce((s,o)=>s+Number(o.totalAmount),0);const paid=c.orders.reduce((s,o)=>s+Number(o.paidAmount),0);return <tr key={c.id}><td><strong>{c.companyName || c.name}</strong><small>{c.companyName ? c.name : c.edrpou || ''}</small></td><td>{c.phone || '—'}<small>{c.email || ''}</small></td><td>{c.orders.length}</td><td>{fmt(total)} грн</td><td>{fmt(paid)} грн</td><td>{fmt(total-paid)} грн</td><td><Link href={`/admin/customers/${c.id}`}>Деталі</Link></td></tr>})}</tbody></table></div></div>
  </div>;
}
