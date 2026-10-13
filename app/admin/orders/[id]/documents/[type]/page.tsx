import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import PrintButton from './PrintButton';

const titles: Record<string, string> = { invoice: 'Рахунок на оплату', waybill: 'Видаткова накладна', ttn: 'Транспортна накладна' };

export default async function OrderDocumentPage({ params }: { params: Promise<{ id: string; type: string }> }) {
  const { id, type } = await params;
  if (!titles[type]) notFound();
  const order = await prisma.order.findUnique({ where: { id }, include: { customer: true, items: { include: { product: true, variant: true } }, manualItems: true } });
  if (!order) notFound();
  return <main className="admin-print-page">
    <div className="admin-print-toolbar"><Link href={`/admin/orders/${id}`}>← До замовлення</Link><PrintButton /></div>
    <article className="admin-print-document">
      <h1 contentEditable suppressContentEditableWarning>{titles[type]}</h1>
      <div className="admin-print-meta"><span>№ <b contentEditable suppressContentEditableWarning>{order.number}</b></span><span>Дата: <b contentEditable suppressContentEditableWarning>{new Date().toLocaleDateString('uk-UA')}</b></span></div>
      <p>Постачальник: <b contentEditable suppressContentEditableWarning>ТОВ «Металон Груп»</b></p>
      <p>Покупець: <b contentEditable suppressContentEditableWarning>{order.customer?.companyName || order.customer?.name || '________________________'}</b></p>
      <p>ЄДРПОУ / телефон: <b contentEditable suppressContentEditableWarning>{order.customer?.edrpou || order.customer?.phone || '________________________'}</b></p>
      {type === 'ttn' && <p>Доставка: <b contentEditable suppressContentEditableWarning>{order.deliveryService || '________________'}</b> · Адреса: <b contentEditable suppressContentEditableWarning>{order.deliveryAddress || '________________________'}</b> · ТТН: <b contentEditable suppressContentEditableWarning>{order.trackingNumber || '________________'}</b></p>}
      <table><thead><tr><th>№</th><th>Найменування</th><th>Характеристики</th><th>К-сть</th><th>Од.</th><th>Ціна</th><th>Сума</th></tr></thead><tbody>{order.items.map((item, i) => <tr key={item.id}><td>{i + 1}</td><td>{item.product.title}</td><td>{item.variant.color}; {Number(item.variant.thickness)} мм; {item.variant.metalBrand}</td><td>{Number(item.quantity)} × {Number(item.length ?? 1)} м</td><td>м.п.</td><td>{Number(item.price).toFixed(2)}</td><td>{Number(item.total).toFixed(2)}</td></tr>)}{order.manualItems.map((item,i)=><tr key={item.id}><td>{order.items.length+i+1}</td><td>{item.title}</td><td>{item.note||'Індивідуальна позиція'}</td><td>{Number(item.quantity)}</td><td>{item.unit}</td><td>{Number(item.price).toFixed(2)}</td><td>{Number(item.total).toFixed(2)}</td></tr>)}</tbody><tfoot><tr><td colSpan={6}>Разом, грн</td><td>{Number(order.totalAmount).toFixed(2)}</td></tr></tfoot></table>
      <p className="admin-print-note" contentEditable suppressContentEditableWarning>Примітка: {order.note || '________________________________________________________'}</p>
      <div className="admin-print-signatures"><span>Відпустив __________________</span><span>Отримав __________________</span></div>
    </article>
    <style>{`.admin-print-page{max-width:1000px;margin:20px auto;color:#111}.admin-print-toolbar{display:flex;justify-content:space-between;margin-bottom:20px}.admin-print-toolbar button{padding:10px 16px;border:0;background:#171717;color:white;border-radius:6px;cursor:pointer}.admin-print-document{background:#fff;padding:48px;min-height:700px;border:1px solid #ddd}.admin-print-document h1{text-align:center;text-transform:uppercase}.admin-print-meta{display:flex;justify-content:space-between;margin:30px 0}.admin-print-document table{width:100%;border-collapse:collapse;margin:28px 0}.admin-print-document th,.admin-print-document td{border:1px solid #777;padding:8px;text-align:left}.admin-print-document tfoot td{text-align:right;font-weight:bold}.admin-print-signatures{display:flex;justify-content:space-between;margin-top:80px}.admin-print-document [contenteditable=true]{outline:1px dashed transparent}.admin-print-document [contenteditable=true]:focus{outline-color:#aaa}@media print{.admin-sidebar,.admin-header,.admin-print-toolbar{display:none!important}.admin-main{margin:0!important;width:100%!important}.admin-content{padding:0!important}.admin-print-page{margin:0;max-width:none}.admin-print-document{padding:12mm;border:0;min-height:0}}`}</style>
  </main>;
}
