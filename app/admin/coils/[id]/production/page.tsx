import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Factory,
} from 'lucide-react';

import { prisma } from '@/lib/prisma';
import { createProduction } from '@/app/admin/coils/actions';

type ProductionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductionPage({
  params,
}: ProductionPageProps) {
  const { id } = await params;

  const coil =
    await prisma.metalCoil.findUnique({
      where: {
        id,
      },
    });

  if (!coil) {
    notFound();
  }

  const products =
    await prisma.product.findMany({
      include: {
        variants: {
          where: {
            inStock: true,
          },

          orderBy: {
            thickness: 'asc',
          },
        },
      },

      orderBy: {
        title: 'asc',
      },
    });

  const warehouses =
    await prisma.warehouse.findMany({
      where: {
        isActive: true,
      },

      orderBy: {
        name: 'asc',
      },
    });

  const createProductionAction =
    createProduction.bind(
      null,
      coil.id
    );

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <Link
            href={`/admin/coils/${coil.id}`}
            className="admin-back-link"
          >
            <ArrowLeft size={18} />

            Назад до рулону
          </Link>

          <h1>
            Виробництво
          </h1>

          <p>
            Рулон: {coil.code}
          </p>
        </div>
      </div>

      <div className="admin-section-card">
        <div className="admin-section-header">
          <div>
            <h2>
              Залишок рулону
            </h2>

            <p>
              Поточна кількість металу
            </p>
          </div>

          <Factory size={24} />
        </div>

        <div className="admin-product-details">
          <div>
            <span>
              Поточна вага
            </span>

            <strong>
              {Number(
                coil.currentWeight
              ).toLocaleString(
                'uk-UA'
              )}{' '}
              кг
            </strong>
          </div>

          {coil.currentLength !== null && (
            <div>
              <span>
                Поточна довжина
              </span>

              <strong>
                {Number(
                  coil.currentLength
                ).toLocaleString(
                  'uk-UA'
                )}{' '}
                м
              </strong>
            </div>
          )}

          <div>
            <span>
              Метал
            </span>

            <strong>
              {coil.color},{' '}
              {Number(coil.thickness)} мм
            </strong>
          </div>
        </div>
      </div>

      <div className="admin-section-card">
        <form
          action={createProductionAction}
          className="admin-form"
        >
          <div className="admin-form-grid">

            {/* ТОВАР */}

            <div className="admin-form-group">
              <label htmlFor="productId">
                Товар
              </label>

              <select
                id="productId"
                name="productId"
                required
              >
                <option value="">
                  Оберіть товар
                </option>

                {products.map(
                  (product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.title}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* ВАРІАНТ */}

            <div className="admin-form-group">
              <label htmlFor="variantId">
                Варіант
              </label>

              <select
                id="variantId"
                name="variantId"
                required
              >
                <option value="">
                  Оберіть варіант
                </option>

                {products.flatMap(
                  (product) =>
                    product.variants.map(
                      (variant) => (
                        <option
                          key={variant.id}
                          value={variant.id}
                        >
                          {product.title} —
                          {' '}
                          {Number(
                            variant.thickness
                          )} мм,
                          {' '}
                          {variant.color}
                        </option>
                      )
                    )
                )}
              </select>
            </div>

            {/* СКЛАД */}

            <div className="admin-form-group">
              <label htmlFor="warehouseId">
                Склад
              </label>

              <select
                id="warehouseId"
                name="warehouseId"
              >
                <option value="">
                  Без складу
                </option>

                {warehouses.map(
                  (warehouse) => (
                    <option
                      key={warehouse.id}
                      value={warehouse.id}
                    >
                      {warehouse.name}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* ВИКОРИСТАНА ВАГА */}

            <div className="admin-form-group">
              <label htmlFor="usedWeight">
                Використано металу, кг
              </label>

              <input
                id="usedWeight"
                name="usedWeight"
                type="number"
                step="0.001"
                max={Number(
                  coil.currentWeight
                )}
                placeholder="Наприклад: 350"
              />
            </div>

            {/* ВИКОРИСТАНА ДОВЖИНА */}

            {coil.currentLength !== null && (
              <div className="admin-form-group">
                <label htmlFor="usedLength">
                  Використано довжини, м
                </label>

                <input
                  id="usedLength"
                  name="usedLength"
                  type="number"
                  step="0.001"
                  max={Number(
                    coil.currentLength
                  )}
                  placeholder="Наприклад: 500"
                />
              </div>
            )}

            {/* ВИРОБЛЕНО */}

            <div className="admin-form-group">
              <label htmlFor="producedQuantity">
                Вироблено, м²
              </label>

              <input
                id="producedQuantity"
                name="producedQuantity"
                type="number"
                step="0.001"
                required
                placeholder="Наприклад: 580"
              />
            </div>

            {/* ВІДХОДИ */}

            <div className="admin-form-group">
              <label htmlFor="wasteQuantity">
                Відходи
              </label>

              <input
                id="wasteQuantity"
                name="wasteQuantity"
                type="number"
                step="0.001"
                defaultValue="0"
              />
            </div>

          </div>

          {/* ПРИМІТКА */}

          <div className="admin-form-group">
            <label htmlFor="note">
              Примітка
            </label>

            <textarea
              id="note"
              name="note"
              rows={4}
              placeholder="Додаткова інформація про виробництво"
            />
          </div>

          <div className="admin-form-actions">
            <Link
              href={`/admin/coils/${coil.id}`}
              className="admin-secondary-button"
            >
              Скасувати
            </Link>

            <button
              type="submit"
              className="admin-primary-button"
            >
              <Factory size={18} />

              Завершити виробництво
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}