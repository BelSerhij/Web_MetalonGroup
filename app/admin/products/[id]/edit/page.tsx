import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { updateProduct } from '../../actions';
import { ProductForm } from '../../ProductForm';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();
  return <div><div className="admin-page-header"><div><h1>Редагувати товар</h1><p>{product.title}</p></div></div><ProductForm action={updateProduct.bind(null, product.id)} product={product} /></div>;
}
