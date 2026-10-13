import Link from 'next/link';
import { Banknote, Boxes, ChartNoAxesCombined, CircleDollarSign, Factory, Package, ShoppingCart, Users } from 'lucide-react';
import { prisma } from '@/lib/prisma';

type Period = '7d' | '30d' | 'month' | 'year' | 'all';
const periodNames: Record<Period,string> = { '7d':'7 днів', '30d':'30 днів', month:'Цей місяць', year:'Цей рік', all:'Увесь час' };
const money=(value:number)=>`${value.toLocaleString('uk-UA',{maximumFractionDigits:0})} грн`;
const amount=(value:number)=>value.toLocaleString('uk-UA',{maximumFractionDigits:2});

export default async function AnalyticsPage({searchParams}:{searchParams:Promise<{period?:string}>}) {
  const params=await searchParams;
  const period=(['7d','30d','month','year','all'].includes(params.period??'')?params.period:'30d') as Period;
  const now=new Date();
  const start=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  if(period==='7d')start.setDate(start.getDate()-6);
  if(period==='30d')start.setDate(start.getDate()-29);
  if(period==='month')start.setDate(1);
  if(period==='year'){start.setMonth(0,1);}
  const createdAt=period==='all'?undefined:{gte:start};
  const [orders,payments,openOrders,production,allCustomers]=await Promise.all([
    prisma.order.findMany({where:{...(createdAt?{createdAt}:{}),status:{not:'CANCELLED'}},include:{customer:true,items:{include:{product:true}},manualItems:true},orderBy:{createdAt:'desc'}}),
    prisma.payment.findMany({where:{...(createdAt?{paidAt:createdAt}:{})},select:{amount:true,paidAt:true}}),
    prisma.order.findMany({where:{status:{notIn:['CANCELLED','COMPLETED']}},select:{totalAmount:true,paidAmount:true}}),
    prisma.production.findMany({where:{status:'COMPLETED',...(createdAt?{productionDate:createdAt}:{})},select:{usedLength:true,wasteQuantity:true,coilId:true,productionDate:true}}),
    prisma.customer.count(),
  ]);
  const revenue=orders.reduce((sum,order)=>sum+Number(order.totalAmount),0);
  const received=payments.reduce((sum,payment)=>sum+Number(payment.amount),0);
  const receivable=openOrders.reduce((sum,order)=>sum+Math.max(0,Number(order.totalAmount)-Number(order.paidAmount)),0);
  const average=orders.length?revenue/orders.length:0;
  let knownCost=0;let knownRevenue=0;let knownCostLines=0;let allItemLines=0;
  const orderStatusLabels={NEW:'Нові',CONFIRMED:'Підтверджені',IN_PRODUCTION:'У виробництві',READY:'Готові',SHIPPED:'Відвантажені',COMPLETED:'Завершені',CANCELLED:'Скасовані'} as const;
  const statusRows=Object.entries(orderStatusLabels).map(([status,label])=>({status,label,count:orders.filter(o=>o.status===status).length,total:orders.filter(o=>o.status===status).reduce((sum,o)=>sum+Number(o.totalAmount),0)})).filter(row=>row.count>0);
  const categories=new Map<string,{count:number;total:number}>();
  const products=new Map<string,{category:string;quantity:number;total:number}>();
  const customers=new Map<string,{name:string;count:number;total:number}>();
  for(const order of orders){
    const customerKey=order.customerId??'no-customer';
    const currentCustomer=customers.get(customerKey)??{name:order.customer?.name??'Без клієнта',count:0,total:0};
    currentCustomer.count++;currentCustomer.total+=Number(order.totalAmount);customers.set(customerKey,currentCustomer);
    for(const item of order.items){
      allItemLines++;
      if(item.costPrice!==null){knownCost+=Number(item.quantity)*Number(item.length??1)*Number(item.costPrice);knownRevenue+=Number(item.total);knownCostLines++;}
      const category=categories.get(item.product.category)??{count:0,total:0};category.count++;category.total+=Number(item.total);categories.set(item.product.category,category);
      const key=item.product.title;const product=products.get(key)??{category:item.product.category,quantity:0,total:0};product.quantity+=Number(item.quantity);product.total+=Number(item.total);products.set(key,product);
    }
    for(const item of order.manualItems){allItemLines++;if(item.purchasePrice!==null){knownCost+=Number(item.quantity)*Number(item.purchasePrice);knownRevenue+=Number(item.total);knownCostLines++;}const category=categories.get('Інші товари')??{count:0,total:0};category.count++;category.total+=Number(item.total);categories.set('Інші товари',category);}
  }
  const categoryRows=[...categories.entries()].map(([name,data])=>({name,...data})).sort((a,b)=>b.total-a.total);
  const topProducts=[...products.entries()].map(([name,data])=>({name,...data})).sort((a,b)=>b.total-a.total).slice(0,7);
  const topCustomers=[...customers.values()].sort((a,b)=>b.total-a.total).slice(0,7);
  const maxCategory=Math.max(1,...categoryRows.map(row=>row.total));
  const maxProduct=Math.max(1,...topProducts.map(row=>row.total));
  const maxDaily=Math.max(1,...Array.from({length:14},(_,i)=>{
    const date=new Date(now.getFullYear(),now.getMonth(),now.getDate()-13+i);
    return orders.filter(order=>order.createdAt.toDateString()===date.toDateString()).reduce((sum,order)=>sum+Number(order.totalAmount),0);
  }));
  const daily=Array.from({length:14},(_,i)=>{
    const date=new Date(now.getFullYear(),now.getMonth(),now.getDate()-13+i);
    return {date,value:orders.filter(order=>order.createdAt.toDateString()===date.toDateString()).reduce((sum,order)=>sum+Number(order.totalAmount),0)};
  });
  const producedMeters=production.reduce((sum,row)=>sum+Number(row.usedLength??0),0);
  const defectSheets=production.reduce((sum,row)=>sum+Number(row.wasteQuantity??0),0);
  const coilCount=new Set(production.map(row=>row.coilId)).size;

  return <main className="analytics-page">
    <header className="analytics-header"><div><span>КЕРІВНИКУ · ОГЛЯД</span><h1>Аналітика</h1><p>Продажі, гроші, попит і виробництво — з даних системи.</p></div><nav>{(Object.keys(periodNames) as Period[]).map(key=><Link key={key} href={`/admin/analytics?period=${key}`} className={period===key?'active':''}>{periodNames[key]}</Link>)}</nav></header>
    <section className="analytics-kpis">
      <article><span><CircleDollarSign size={17}/> Продажі за період</span><strong>{money(revenue)}</strong><small>{orders.length} замовлень · середнє {money(average)}</small></article>
      <article><span><Banknote size={17}/> Отримано оплат</span><strong>{money(received)}</strong><small>За датою внесення платежу</small></article>
      <article><span><CircleDollarSign size={17}/> До отримання</span><strong>{money(receivable)}</strong><small>Несплачений залишок відкритих замовлень</small></article>
      <article><span><ShoppingCart size={17}/> Активні замовлення</span><strong>{openOrders.length}</strong><small>Усі не скасовані й не завершені</small></article>
      <article><span><CircleDollarSign size={17}/> Результат за собівартістю</span><strong>{money(knownRevenue-knownCost)}</strong><small>Враховано {knownCostLines} із {allItemLines} позицій</small></article>
    </section>
    <section className="analytics-grid analytics-main-grid">
      <article className="analytics-card analytics-chart-card"><div className="analytics-card-title"><div><h2>Продажі по днях</h2><p>Сума створених замовлень · 14 останніх днів</p></div><ChartNoAxesCombined size={20}/></div><div className="analytics-bars">{daily.map(({date,value})=><div key={date.toISOString()} title={`${date.toLocaleDateString('uk-UA')}: ${money(value)}`}><div className="analytics-bar-value" style={{height:`${value?Math.max(5,value/maxDaily*100):1}%`}}/><small>{date.toLocaleDateString('uk-UA',{day:'2-digit',month:'2-digit'})}</small></div>)}</div></article>
      <article className="analytics-card"><div className="analytics-card-title"><div><h2>Стан замовлень</h2><p>За обраний період</p></div><ShoppingCart size={20}/></div><div className="analytics-status-list">{statusRows.map(row=><div key={row.status}><span><i className={`analytics-dot status-${row.status.toLowerCase()}`}/>{row.label}</span><b>{row.count}</b><small>{money(row.total)}</small></div>)}{!statusRows.length&&<p>За цей період замовлень немає.</p>}</div></article>
    </section>
    <section className="analytics-grid">
      <article className="analytics-card"><div className="analytics-card-title"><div><h2>Попит за категоріями</h2><p>Продажі по товарних групах</p></div><Boxes size={20}/></div><div className="analytics-rank-list">{categoryRows.map(row=><div key={row.name}><div className="analytics-rank-label"><strong>{row.name}</strong><span>{row.count} поз. · {money(row.total)}</span></div><div className="analytics-progress"><i style={{width:`${row.total/maxCategory*100}%`}}/></div></div>)}{!categoryRows.length&&<p>Немає товарних продажів за період.</p>}</div></article>
      <article className="analytics-card"><div className="analytics-card-title"><div><h2>Найпопулярніші товари</h2><p>За сумою замовлень</p></div><Package size={20}/></div><div className="analytics-rank-list">{topProducts.map((row,index)=><div key={row.name}><div className="analytics-rank-label"><strong><em>{String(index+1).padStart(2,'0')}</em>{row.name}<small>{row.category} · {amount(row.quantity)} од.</small></strong><span>{money(row.total)}</span></div><div className="analytics-progress"><i style={{width:`${row.total/maxProduct*100}%`}}/></div></div>)}{!topProducts.length&&<p>Немає товарних позицій за період.</p>}</div></article>
      <article className="analytics-card"><div className="analytics-card-title"><div><h2>Клієнти</h2><p>Провідні за сумою покупок · {allCustomers} у базі</p></div><Users size={20}/></div><div className="analytics-customer-list">{topCustomers.map((row,index)=><div key={`${row.name}-${index}`}><span className="analytics-avatar">{row.name.slice(0,1).toLocaleUpperCase('uk-UA')}</span><span><strong>{row.name}</strong><small>{row.count} замовлень</small></span><b>{money(row.total)}</b></div>)}{!topCustomers.length&&<p>Немає клієнтських продажів за період.</p>}</div><Link href="/admin/customers" className="analytics-more-link">Відкрити клієнтів →</Link></article>
      <article className="analytics-card analytics-production-card"><div className="analytics-card-title"><div><h2>Виробництво й якість</h2><p>Завершені прокатки за період</p></div><Factory size={20}/></div><div className="analytics-production-metrics"><div><strong>{amount(producedMeters)}</strong><span>м.п. прокату</span></div><div><strong>{defectSheets}</strong><span>бракованих листів</span></div><div><strong>{coilCount}</strong><span>використано рулонів</span></div></div><Link href="/admin/production" className="analytics-more-link">Перейти у виробництво →</Link></article>
    </section>
    <article className="analytics-card analytics-debt-card"><div className="analytics-card-title"><div><h2>Контроль оплат</h2><p>Залишки за активними замовленнями</p></div><Banknote size={20}/></div><p>Сума прострочення не показується, бо наразі в замовленні немає окремого строку оплати. Зараз видно загальний непогашений залишок.</p><Link href="/admin/orders" className="analytics-more-link">Переглянути замовлення →</Link></article>
  </main>;
}
