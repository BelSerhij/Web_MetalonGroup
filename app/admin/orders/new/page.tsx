import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { prisma } from '@/lib/prisma';

import OrderForm from './OrderForm';

export default async function NewOrderPage() {
  const [customers, products, movements, salesManagers] = await Promise.all([
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
    prisma.stockMovement.findMany({ select: { variantId: true, quantity: true, type: true } }),
    prisma.employee.findMany({ where: { employeeType: 'SALES', isActive: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ]);

  const stockByVariant = new Map<string, number>();
  for (const movement of movements) {
    const sign = ['SALE', 'WRITE_OFF', 'RESERVATION'].includes(movement.type) ? -1 : 1;
    stockByVariant.set(movement.variantId, (stockByVariant.get(movement.variantId) ?? 0) + Number(movement.quantity) * sign);
  }

  const serializedProducts = products.map(
    (product) => ({
      id: product.id,
      title: product.title,
      category: product.category,
      unit: product.unit,

      variants: product.variants.filter((variant) => product.isVisible && variant.isVisible || (stockByVariant.get(variant.id) ?? 0) > 0).map(
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
          stock: stockByVariant.get(variant.id) ?? 0,
        })
      ),
    })
  ).filter((product) => product.variants.length > 0);

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
          salesManagers={salesManagers}
          products={serializedProducts}
        />
      </div>
    </div>
  );
}
