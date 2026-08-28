import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { prisma } from '@/lib/prisma';

import { createProductVariant } from '@/app/admin/products/actions';

type NewVariantPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function NewVariantPage({
  params,
}: NewVariantPageProps) {
  const { id } = await params;

  const product =
    await prisma.product.findUnique({
      where: {
        id,
      },
    });

  if (!product) {
    notFound();
  }
    
const createVariant =
  createProductVariant.bind(
    null,
    product.id
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
            Додати варіант
          </h1>

          <p>
            {product.title}
          </p>
        </div>
      </div>

      <div className="admin-section-card">
        <form action={createVariant} className="admin-form">
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
                placeholder="Наприклад: 0.45"
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
                placeholder="Наприклад: RAL 7016"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="coating">
                Покриття
              </label>

              <select
                id="coating"
                name="coating"
                defaultValue=""
              >
                <option value="" disabled>
                  Оберіть покриття
                </option>

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
                defaultValue=""
              >
                <option value="" disabled>
                  Оберіть тип
                </option>

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
                placeholder="Наприклад: POLYSTEEL"
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
                placeholder="Наприклад: 100"
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
                placeholder="Наприклад: 280"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="inStock">
                Статус
              </label>

              <select
                id="inStock"
                name="inStock"
                defaultValue="true"
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
              Додати варіант
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}