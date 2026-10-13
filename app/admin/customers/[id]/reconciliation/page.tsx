import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PrintButton from '@/app/admin/orders/[id]/documents/[type]/PrintButton';

export default async function ReconciliationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id }, include: { orders: { include: { payments: { orderBy: { paidAt: 'asc' } } }, orderBy: { createdAt: 'asc' } } } });
  if (!customer) notFound();
  const rows = customer.orders.flatMap((o) => [{ date: o.createdAt, label: `Замовлення ${o.number}`, debit: Number(o.totalAmount), credit: 0 }, ...o.payments.map(p=>({date:p.paidAt,label:`Оплата ${o.number} (${p.method})`,debit:0,credit:Number(p.amount)}))]).sort((a,b)=>a.date.getTime()-b.date.getTime());
  let balance = 0;
  return <div className="admin-print-page"><div className="admin-print-toolbar"><Link href={`/admin/customers/${id}`}>← До клієнта</Link><PrintButton /></div><article className="admin-print-document"><h1>Акт звірки взаєморозрахунків</h1><p>Клієнт: <b>{customer.companyName || customer.name}</b></p><p>Період: від початку співпраці до {new Date().toLocaleDateString('uk-UA')}</p><table><thead><tr><th>Дата</th><th>Документ</th><th>Нараховано, грн</th><th>Оплачено, грн</th><th>Сальдо, грн</th></tr></thead><tbody>{rows.map((r,i)=>{balance+=r.debit-r.credit;return <tr key={i}><td>{r.date.toLocaleDateString('uk-UA')}</td><td>{r.label}</td><td>{r.debit.toFixed(2)}</td><td>{r.credit.toFixed(2)}</td><td>{balance.toFixed(2)}</td></tr>})}</tbody></table><p><b>Сальдо на дату формування: {balance.toFixed(2)} грн</b></p><div className="admin-print-signatures"><span>Від METALON GROUP __________________</span><span>Від клієнта __________________</span></div></article></div>;
}
