import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';

import { prisma } from '@/lib/prisma';
import { deleteProductVariant } from '@/app/admin/products/actions';

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  const product =
    await prisma.product.findUnique({
      where: {
        id,
      },

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
    });

  if (!product) {
    notFound();
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <Link
            href="/admin/products"
            className="admin-back-link"
          >
            <ArrowLeft size={18} />

            Назад до товарів
          </Link>

          <h1>{product.title}</h1>

          <p>
            Управління товаром та його варіантами
          </p>
        </div>

        <Link
          href={`/admin/products/${product.id}/edit`}
          className="admin-secondary-button"
        >
          <Pencil size={18} />

          Редагувати товар
        </Link>
      </div>

      {/* ОСНОВНА ІНФОРМАЦІЯ */}

      <div className="admin-section-card">
        <div className="admin-section-header">
          <h2>
            Основна інформація
          </h2>
        </div>

        <div className="admin-product-details">
          <div>
            <span>Назва</span>

            <strong>
              {product.title}
            </strong>
          </div>

          <div>
            <span>Категорія</span>

            <strong>
              {product.category}
            </strong>
          </div>

          <div>
            <span>Slug</span>

            <strong>
              {product.slug}
            </strong>
          </div>

          <div>
            <span>Одиниця виміру</span>

            <strong>
              {product.unit}
            </strong>
          </div>

          <div>
            <span>Корисна ширина</span>

            <strong>
              {Number(product.usefulWidth)} м
            </strong>
          </div>

          <div>
            <span>Повна ширина</span>

            <strong>
              {Number(product.fullWidth)} м
            </strong>
          </div>
        </div>

        {product.description && (
          <div className="admin-product-description">
            <span>Опис</span>

            <p>
              {product.description}
            </p>
          </div>
        )}
      </div>

      {/* ВАРІАНТИ */}

      <div className="admin-section-card">
        <div className="admin-section-header">
          <div>
            <h2>
              Варіанти товару
            </h2>

            <p>
              Усього: {product.variants.length}
            </p>
          </div>

          <Link
            href={`/admin/products/${product.id}/variants/new`}
            className="admin-primary-button"
          >
            <Plus size={18} />

            Додати варіант
          </Link>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Товщина</th>
                <th>Колір</th>
                <th>Покриття</th>
                <th>Фарбування</th>
                <th>Виробник</th>
                <th>Цинк</th>
                <th>Ціна</th>
                <th>Наявність</th>
                <th>Дії</th>
              </tr>
            </thead>

            <tbody>
              {product.variants.map(
                (variant) => (
                  <tr key={variant.id}>
                    <td>
                      {Number(
                        variant.thickness
                      )} мм
                    </td>

                    <td>
                      {variant.color}
                    </td>

                    <td>
                      {variant.coating}
                    </td>

                    <td>
                      {variant.paintingType}
                    </td>

                    <td>
                      {variant.metalBrand}
                    </td>

                    <td>
                      {variant.zincContent} г/м²
                    </td>

                    <td>
                      {Number(
                        variant.price
                      ).toLocaleString(
                        'uk-UA'
                      )}{' '}
                      грн
                    </td>

                    <td>
                      <span
                        className={
                          variant.inStock
                            ? 'admin-status admin-status-success'
                            : 'admin-status admin-status-muted'
                        }
                      >
                        {variant.inStock
                          ? 'В наявності'
                          : 'Під замовлення'}
                      </span>
                    </td>

<td>
  <div className="admin-actions">
    <Link
      href={`/admin/products/${product.id}/variants/${variant.id}`}
      className="admin-action-button"
      aria-label="Редагувати варіант"
    >
      <Pencil size={18} />
    </Link>

    <form
      action={deleteProductVariant.bind(
        null,
        product.id,
        variant.id
      )}
    >
      <button
        type="submit"
        className="admin-action-button admin-action-button-danger"
        aria-label="Видалити варіант"
      >
        <Trash2 size={18} />
      </button>
    </form>
  </div>
</td>
                  </tr>
                )
              )}

              {product.variants.length ===
                0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="admin-empty"
                  >
                    У цього товару поки немає
                    варіантів
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