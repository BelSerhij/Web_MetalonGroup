'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function updateCustomer(id: string, formData: FormData) {
  await requireRole('ADMIN', 'MANAGER');
  const name=String(formData.get('name')??'').trim();
  if(!name) throw new Error('Ім’я клієнта обов’язкове');
  await prisma.customer.update({where:{id},data:{name,companyName:String(formData.get('companyName')??'')||null,phone:String(formData.get('phone')??'')||null,email:String(formData.get('email')??'')||null,edrpou:String(formData.get('edrpou')??'')||null,address:String(formData.get('address')??'')||null,note:String(formData.get('note')??'')||null}});
  revalidatePath(`/admin/customers/${id}`); revalidatePath('/admin/customers');
}
