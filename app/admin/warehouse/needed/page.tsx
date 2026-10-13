import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { updatePurchaseQueueStatus } from './actions';

const labels: Record<string,string> = { NEEDS_ORDER: 'Потрібно замовити', ORDERED: 'Замовлено', RECEIVED: 'Отримано' };

export default async function NeededItemsPage() {
  const [items, variants, movements] = await Promise.all([
    prisma.orderManualItem.findMany({ include: { order: { select: { id: true, number: true, customer: { select: { name: true, companyName: true } } } }, }, orderBy: { createdAt: 'desc' } }),
    prisma.productVariant.findMany({ where: { isVisible: true, product: { isVisible: true } }, include: { product: true }, orderBy: { product: { title: 'asc' } } }),
    prisma.stockMovement.findMany({ select: { variantId: true, quantity: true, type: true } }),
  ]);
  const balances = new Map<string, number>();
  for (const move of movements) { const negative = ['SALE','WRITE_OFF','RESERVATION'].includes(move.type); balances.set(move.variantId,(balances.get(move.variantId)||0)+Number(move.quantity)*(negative?-1:1)); }
  const lowStock = variants.map(v=>({...v,balance:balances.get(v.id)||0})).filter(v=>v.balance<=1);
  return <div><div className="admin-page-header"><div><Link href="/admin/warehouse" className="admin-back-link">← До складу</Link><h1>Необхідно замовити</h1><p>Черга закупівлі ручних позицій і товари каталогу з залишком до 1 одиниці</p></div></div>
    <div className="admin-section-card"><div className="admin-section-header"><div><h2>Мінімальний залишок</h2><p>Порогове значення зараз 1 одиниця обліку; на сайті залишки не показуються</p></div></div><div className="admin-table-wrapper"><table className="admin-table"><thead><tr><th>Категорія / товар</th><th>Виробник</th><th>Товщина</th><th>Колір</th><th>Залишок</th><th>Ціна продажу</th></tr></thead><tbody>{lowStock.map(v=><tr key={v.id}><td><strong>{v.product.category}</strong><small>{v.product.title}</small></td><td>{v.metalBrand}</td><td>{Number(v.thickness)} мм</td><td>{v.color}</td><td>{v.balance.toLocaleString('uk-UA')} {v.product.unit}</td><td>{Number(v.price).toLocaleString('uk-UA')} грн</td></tr>)}</tbody></table></div>{lowStock.length===0&&<p>Немає видимих товарів із низьким залишком.</p>}</div>
    <div className="admin-section-card"><div className="admin-section-header"><div><h2>Потрібно закупити під замовлення</h2><p>Індивідуальні позиції, додані менеджером вручну</p></div></div><div className="admin-table-wrapper"><table className="admin-table"><thead><tr><th>Товар</th><th>Замовлення / клієнт</th><th>Кількість</th><th>Закупівельна ціна</th><th>Статус</th><th>Дія</th></tr></thead><tbody>{items.map(item=><tr key={item.id}><td><strong>{item.title}</strong><small>{item.note||'Ручне замовлення'}</small></td><td><Link href={`/admin/orders/${item.order.id}`}>{item.order.number}</Link><small>{item.order.customer?.companyName||item.order.customer?.name||'Клієнт не заданий'}</small></td><td>{Number(item.quantity)} {item.unit}</td><td>{item.purchasePrice===null?'—':`${Number(item.purchasePrice).toLocaleString('uk-UA')} грн / ${item.unit}`}</td><td>{labels[item.purchaseStatus]||item.purchaseStatus}</td><td><form action={async(formData:FormData)=>{'use server';await updatePurchaseQueueStatus(item.id,String(formData.get('status')))}}><select name="status" defaultValue={item.purchaseStatus}>{Object.entries(labels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><button className="admin-secondary-button">Зберегти</button></form></td></tr>)}</tbody></table></div>{items.length===0&&<p>Поки немає ручних позицій, які потрібно закупити.</p>}</div></div>;
}
