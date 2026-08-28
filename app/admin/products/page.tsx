import Link from 'next/link';
import { Plus, Pencil } from 'lucide-react';

import { prisma } from '@/lib/prisma';

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      variants: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div>
      <div className="admin-page-header admin-page-header-row">
        <div>
          <h1>Товари</h1>

          <p>
            Управління товарами та їх варіантами
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="admin-primary-button"
        >
          <Plus size={20} />

          Додати товар
        </Link>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Товар</th>
                <th>Категорія</th>
                <th>Одиниця</th>
                <th>Корисна ширина</th>
                <th>Варіанти</th>
                <th>Дії</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="admin-product-cell">
                      <div className="admin-product-image">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.title}
                          />
                        ) : (
                          <span>—</span>
                        )}
                      </div>

                      <div>
                        <strong>
                          {product.title}
                        </strong>

                        <span>
                          {product.slug}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    {product.category}
                  </td>

                  <td>
                    {product.unit}
                  </td>

                  <td>
                    {Number(product.usefulWidth)}
                  </td>

                  <td>
                    <span className="admin-badge">
                      {product.variants.length}
                    </span>
                  </td>

                  <td>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="admin-action-button"
                      aria-label={`Редагувати ${product.title}`}
                    >
                      <Pencil size={18} />
                    </Link>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="admin-empty"
                  >
                    Товарів поки немає
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}