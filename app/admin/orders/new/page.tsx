import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { prisma } from '@/lib/prisma';

import OrderForm from './OrderForm';

export default async function NewOrderPage() {
  const [customers, products] = await Promise.all([
    prisma.customer.findMany({
      orderBy: {
        name: 'asc',
      },
    }),

    prisma.product.findMany({
      include: {
        variants: {
          orderBy: [
            {
              thickness: 'asc',
            },
            {
              color: 'asc',
            },
          ],
        },
      },

      orderBy: {
        title: 'asc',
      },
    }),
  ]);

  const serializedProducts = products.map(
    (product) => ({
      id: product.id,
      title: product.title,
      unit: product.unit,

      variants: product.variants.map(
        (variant) => ({
          id: variant.id,
          thickness: Number(
            variant.thickness
          ),
          color: variant.color,
          coating: variant.coating,
          paintingType:
            variant.paintingType,
          metalBrand: variant.metalBrand,
          zincContent:
            variant.zincContent,
          price: Number(variant.price),
          inStock: variant.inStock,
        })
      ),
    })
  );

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <Link
            href="/admin/orders"
            className="admin-back-link"
          >
            <ArrowLeft size={18} />

            Назад до замовлень
          </Link>

          <h1>
            Створити замовлення
          </h1>

          <p>
            Додайте клієнта та товари до замовлення
          </p>
        </div>
      </div>

      <div className="admin-section-card">
        <OrderForm
          customers={customers.map(
            (customer) => ({
              id: customer.id,
              name: customer.name,
              phone: customer.phone,
              companyName:
                customer.companyName,
            })
          )}
          products={serializedProducts}
        />
      </div>
    </div>
  );
}