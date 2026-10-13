'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function createEmployee(formData:FormData){
  await requireRole('ADMIN','MANAGER');
  const name=String(formData.get('name')??'').trim();
  const employeeType=String(formData.get('employeeType')??'');
  const bonus=Number(formData.get('bonusPerMeter'));
  if(!name||!['PRODUCTION','SALES'].includes(employeeType)||!Number.isFinite(bonus)||bonus<0) throw new Error('Перевірте ім’я, роль і бонус за метр');
  const employee=await prisma.employee.create({data:{name,employeeType:employeeType as 'PRODUCTION'|'SALES',bonusPerMeter:bonus,phone:String(formData.get('phone')??'')||null,email:String(formData.get('email')??'')||null}});
  revalidatePath('/admin/employees'); redirect(`/admin/employees/${employee.id}`);
}

export async function updateEmployee(id:string,formData:FormData){
  await requireRole('ADMIN','MANAGER');
  const bonus=Number(formData.get('bonusPerMeter'));
  const employeeType=String(formData.get('employeeType')??'');
  if(!String(formData.get('name')??'').trim()||!Number.isFinite(bonus)||bonus<0||!['PRODUCTION','SALES'].includes(employeeType)) throw new Error('Перевірте ім’я, роль і ставку бонусу');
  await prisma.employee.update({where:{id},data:{name:String(formData.get('name')).trim(),employeeType:employeeType as 'PRODUCTION'|'SALES',bonusPerMeter:bonus,phone:String(formData.get('phone')??'')||null,email:String(formData.get('email')??'')||null,isActive:formData.get('isActive')==='on'}});
  revalidatePath('/admin/employees'); revalidatePath(`/admin/employees/${id}`);
}

export async function recordEmployeePayment(id:string,formData:FormData){
  await requireRole('ADMIN','MANAGER');
  const amount=Number(formData.get('amount'));
  if(!Number.isFinite(amount)||amount<=0) throw new Error('Сума виплати має бути більшою за 0');
  await prisma.employeePayment.create({data:{employeeId:id,amount,note:String(formData.get('note')??'')||null}});
  revalidatePath(`/admin/employees/${id}`); revalidatePath('/admin/employees');
}
