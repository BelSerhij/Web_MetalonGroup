import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function addSupplier(formData: FormData) {
  'use server';
  await requireRole('ADMIN', 'MANAGER');
  const name=String(formData.get('name')??'').trim();
  if(!name) throw new Error('Вкажіть назву постачальника');
  await prisma.supplier.create({data:{name,companyName:String(formData.get('companyName')??'')||null,phone:String(formData.get('phone')??'')||null,email:String(formData.get('email')??'')||null,edrpou:String(formData.get('edrpou')??'')||null,address:String(formData.get('address')??'')||null,note:String(formData.get('note')??'')||null}});
  revalidatePath('/admin/suppliers');
}

export default async function SuppliersPage(){
  const suppliers=await prisma.supplier.findMany({include:{coils:{select:{purchasePrice:true,initialWeight:true,currentWeight:true,status:true}}},orderBy:{name:'asc'}});
  return <div><div className="admin-page-header"><div><h1>Постачальники</h1><p>Контакти, закупівлі рулонів і суми закупівель</p></div></div>
    <div className="admin-section-card"><div className="admin-section-header"><div><h2>Новий постачальник</h2><p>Додайте компанію або контакт</p></div></div><form action={addSupplier} className="admin-form-grid"><label className="admin-form-group">Назва / контакт<input name="name" required /></label><label className="admin-form-group">Компанія<input name="companyName" /></label><label className="admin-form-group">Телефон<input name="phone" /></label><label className="admin-form-group">Email<input type="email" name="email" /></label><label className="admin-form-group">ЄДРПОУ<input name="edrpou" /></label><label className="admin-form-group">Адреса<input name="address" /></label><label className="admin-form-group">Нотатка<input name="note" /></label><button className="admin-primary-button">Створити постачальника</button></form></div>
    <div className="admin-section-card"><div className="admin-section-header"><div><h2>Реєстр постачальників</h2><p>{suppliers.length} записів</p></div></div><div className="admin-table-wrapper"><table className="admin-table"><thead><tr><th>Постачальник</th><th>Контакти</th><th>Рулонів закуплено</th><th>Вага отримана</th><th>Вартість закупівель</th><th></th></tr></thead><tbody>{suppliers.map(s=><tr key={s.id}><td><strong>{s.companyName||s.name}</strong><small>{s.companyName?s.name:''}</small></td><td>{s.phone||'—'}<small>{s.email||''}</small></td><td>{s.coils.length}</td><td>{s.coils.reduce((n,c)=>n+Number(c.initialWeight),0).toLocaleString('uk-UA')} кг</td><td>{s.coils.reduce((n,c)=>n+Number(c.purchasePrice),0).toLocaleString('uk-UA')} грн</td><td><Link href={`/admin/suppliers/${s.id}`}>Деталі</Link></td></tr>)}</tbody></table></div></div></div>;
}
