import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { prisma } from '@/lib/prisma';

import { updateProductVariant } from '@/app/admin/products/actions';

type EditVariantPageProps = {
  params: Promise<{
    id: string;
    variantId: string;
  }>;
};

export default async function EditVariantPage({
  params,
}: EditVariantPageProps) {
  const { id, variantId } = await params;

  const product =
    await prisma.product.findUnique({
      where: {
        id,
      },
    });

  if (!product) {
    notFound();
  }

  const variant =
    await prisma.productVariant.findFirst({
      where: {
        id: variantId,
        productId: product.id,
      },
    });

  if (!variant) {
    notFound();
  }

  const updateVariant =
    updateProductVariant.bind(
      null,
      product.id,
      variant.id
    );

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <Link
            href={`/admin/products/${product.id}`}
            className="admin-back-link"
          >
            <ArrowLeft size={18} />

            Назад до товару
          </Link>

          <h1>
            Редагувати варіант
          </h1>

          <p>
            {product.title}
          </p>
        </div>
      </div>

      <div className="admin-section-card">
        <form
          action={updateVariant}
          className="admin-form"
        >
          <div className="admin-form-grid">

            <div className="admin-form-group">
              <label htmlFor="thickness">
                Товщина металу, мм
              </label>

              <input
                id="thickness"
                name="thickness"
                type="number"
                step="0.01"
                min="0.1"
                required
                defaultValue={Number(variant.thickness)}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="color">
                Колір
              </label>

              <input
                id="color"
                name="color"
                required
                defaultValue={variant.color}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="coating">
                Покриття
              </label>

              <select
                id="coating"
                name="coating"
                required
                defaultValue={variant.coating}
              >
                <option value="Gloss">
                  Глянець
                </option>

                <option value="Matt">
                  Матове
                </option>

                <option value="Zinc">
                  Цинк
                </option>
              </select>
            </div>

            <div className="admin-form-group">
              <label htmlFor="paintingType">
                Тип фарбування
              </label>

              <select
                id="paintingType"
                name="paintingType"
                required
                defaultValue={
                  variant.paintingType
                }
              >
                <option value="OneSide">
                  Одностороннє
                </option>

                <option value="TwoSide">
                  Двостороннє
                </option>
              </select>
            </div>

            <div className="admin-form-group">
              <label htmlFor="metalBrand">
                Виробник металу
              </label>

              <input
                id="metalBrand"
                name="metalBrand"
                required
                defaultValue={
                  variant.metalBrand
                }
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="zincContent">
                Вміст цинку, г/м²
              </label>

              <input
                id="zincContent"
                name="zincContent"
                type="number"
                required
                defaultValue={
                  variant.zincContent
                }
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="price">
                Ціна, грн
              </label>

              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                required
                defaultValue={Number(variant.price)}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="inStock">
                Статус
              </label>

              <select
                id="inStock"
                name="inStock"
                defaultValue={
                  variant.inStock
                    ? 'true'
                    : 'false'
                }
              >
                <option value="true">
                  В наявності
                </option>

                <option value="false">
                  Під замовлення
                </option>
              </select>
            </div>

          </div>

          <div className="admin-form-actions">

            <Link
              href={`/admin/products/${product.id}`}
              className="admin-secondary-button"
            >
              Скасувати
            </Link>

            <button
              type="submit"
              className="admin-primary-button"
            >
              Зберегти зміни
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}