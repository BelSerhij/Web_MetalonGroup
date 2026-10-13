'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function updateSupplier(id: string, formData: FormData) {
  await requireRole('ADMIN', 'MANAGER');
  const name=String(formData.get('name')??'').trim(); if(!name) throw new Error('Назва постачальника обов’язкова');
  await prisma.supplier.update({where:{id},data:{name,companyName:String(formData.get('companyName')??'')||null,phone:String(formData.get('phone')??'')||null,email:String(formData.get('email')??'')||null,edrpou:String(formData.get('edrpou')??'')||null,address:String(formData.get('address')??'')||null,note:String(formData.get('note')??'')||null}});
  revalidatePath(`/admin/suppliers/${id}`); revalidatePath('/admin/suppliers');
}
