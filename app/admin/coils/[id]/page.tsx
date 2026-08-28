import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Pencil,
  Factory,
} from 'lucide-react';

import { prisma } from '@/lib/prisma';

type CoilPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CoilPage({
  params,
}: CoilPageProps) {
  const { id } = await params;

  const coil = await prisma.metalCoil.findUnique({
    where: {
      id,
    },

    include: {
      supplier: true,

      productions: {
        include: {
          product: true,
          variant: true,
        },

        orderBy: {
          productionDate: 'desc',
        },
      },
    },
  });

  if (!coil) {
    notFound();
  }

  const coilStatusLabels = {
    IN_STOCK: 'На складі',
    IN_USE: 'У виробництві',
    FINISHED: 'Використаний',
    WRITTEN_OFF: 'Списаний',
  };

  const productionStatusLabels = {
    PLANNED: 'Заплановано',
    IN_PROGRESS: 'У виробництві',
    COMPLETED: 'Завершено',
    CANCELLED: 'Скасовано',
  };

  const getCoilStatusClass = () => {
    switch (coil.status) {
      case 'IN_STOCK':
        return 'admin-status-success';

      case 'IN_USE':
        return 'admin-status-warning';

      case 'FINISHED':
      case 'WRITTEN_OFF':
        return 'admin-status-muted';

      default:
        return '';
    }
  };

  const getProductionStatusClass = (
    status: keyof typeof productionStatusLabels
  ) => {
    switch (status) {
      case 'COMPLETED':
        return 'admin-status-success';

      case 'IN_PROGRESS':
        return 'admin-status-warning';

      case 'CANCELLED':
        return 'admin-status-danger';

      case 'PLANNED':
      default:
        return 'admin-status-muted';
    }
  };

  const initialWeight = Number(coil.initialWeight);
  const currentWeight = Number(coil.currentWeight);

  const usedWeight =
    initialWeight - currentWeight;

  const initialLength =
    coil.initialLength !== null
      ? Number(coil.initialLength)
      : null;

  const currentLength =
    coil.currentLength !== null
      ? Number(coil.currentLength)
      : null;

  const usedLength =
    initialLength !== null &&
    currentLength !== null
      ? initialLength - currentLength
      : null;

  const remainingPercent =
    initialWeight > 0
      ? Math.round(
          (currentWeight / initialWeight) * 100
        )
      : 0;

  const formatNumber = (
    value: number
  ) =>
    value.toLocaleString('uk-UA', {
      maximumFractionDigits: 2,
    });

  return (
    <div>
      {/* HEADER */}

      <div className="admin-page-header admin-page-header-row">
        <div>
          <Link
            href="/admin/coils"
            className="admin-back-link"
          >
            <ArrowLeft size={18} />

            Назад до рулонів
          </Link>

          <h1>
            {coil.code}
          </h1>

          <p>
            Детальна інформація про рулон металу
          </p>
        </div>

        <div className="admin-page-actions">
          <Link
            href={`/admin/coils/${coil.id}/production`}
            className="admin-primary-button"
          >
            <Factory size={18} />

            Запустити виробництво
          </Link>

          <Link
            href={`/admin/coils/${coil.id}/edit`}
            className="admin-secondary-button"
          >
            <Pencil size={18} />

            Редагувати
          </Link>
        </div>
      </div>

      {/* ХАРАКТЕРИСТИКИ */}

      <div className="admin-section-card">
        <div className="admin-section-header">
          <h2>
            Характеристики металу
          </h2>

          <span
            className={`admin-status ${getCoilStatusClass()}`}
          >
            {coilStatusLabels[coil.status]}
          </span>
        </div>

        <div className="admin-product-details">
          <div>
            <span>Код рулону</span>

            <strong>
              {coil.code}
            </strong>
          </div>

          <div>
            <span>Колір</span>

            <strong>
              {coil.color}
            </strong>
          </div>

          <div>
            <span>Товщина</span>

            <strong>
              {Number(coil.thickness)} мм
            </strong>
          </div>

          <div>
            <span>Ширина рулону</span>

            <strong>
              {Number(coil.width)} м
            </strong>
          </div>

          <div>
            <span>Покриття</span>

            <strong>
              {coil.coating}
            </strong>
          </div>

          <div>
            <span>Тип фарбування</span>

            <strong>
              {coil.paintingType}
            </strong>
          </div>

          <div>
            <span>Виробник металу</span>

            <strong>
              {coil.metalBrand}
            </strong>
          </div>

          <div>
            <span>Вміст цинку</span>

            <strong>
              {coil.zincContent} г/м²
            </strong>
          </div>

          <div>
            <span>Постачальник</span>

            <strong>
              {coil.supplier?.name ?? '—'}
            </strong>
          </div>
        </div>
      </div>

      {/* ЗАЛИШКИ */}

      <div className="admin-section-card">
        <div className="admin-section-header">
          <h2>
            Залишки рулону
          </h2>
        </div>

        <div className="admin-product-details">
          <div>
            <span>
              Початкова вага
            </span>

            <strong>
              {formatNumber(initialWeight)} кг
            </strong>
          </div>

          <div>
            <span>
              Поточна вага
            </span>

            <strong>
              {formatNumber(currentWeight)} кг
            </strong>
          </div>

          <div>
            <span>
              Використано
            </span>

            <strong>
              {formatNumber(usedWeight)} кг
            </strong>
          </div>

          <div>
            <span>
              Залишок
            </span>

            <strong>
              {remainingPercent}%
            </strong>
          </div>

          {initialLength !== null && (
            <div>
              <span>
                Початкова довжина
              </span>

              <strong>
                {formatNumber(initialLength)} м
              </strong>
            </div>
          )}

          {currentLength !== null && (
            <div>
              <span>
                Поточна довжина
              </span>

              <strong>
                {formatNumber(currentLength)} м
              </strong>
            </div>
          )}

          {usedLength !== null && (
            <div>
              <span>
                Використано довжини
              </span>

              <strong>
                {formatNumber(usedLength)} м
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* ЗАКУПІВЛЯ */}

      <div className="admin-section-card">
        <div className="admin-section-header">
          <h2>
            Закупівля
          </h2>
        </div>

        <div className="admin-product-details">
          <div>
            <span>
              Загальна вартість
            </span>

            <strong>
              {formatNumber(
                Number(coil.purchasePrice)
              )}{' '}
              грн
            </strong>
          </div>

          <div>
            <span>
              Ціна за кг
            </span>

            <strong>
              {coil.purchasePricePerKg !== null
                ? `${formatNumber(
                    Number(
                      coil.purchasePricePerKg
                    )
                  )} грн`
                : '—'}
            </strong>
          </div>

          <div>
            <span>
              Дата надходження
            </span>

            <strong>
              {coil.receivedAt.toLocaleDateString(
                'uk-UA'
              )}
            </strong>
          </div>
        </div>
      </div>

      {/* ІСТОРІЯ ВИРОБНИЦТВА */}

      <div className="admin-section-card">
        <div className="admin-section-header">
          <div>
            <h2>
              Історія виробництва
            </h2>

            <p>
              Усього партій:{' '}
              {coil.productions.length}
            </p>
          </div>

          <Factory size={24} />
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Товар</th>
                <th>Варіант</th>
                <th>Використано</th>
                <th>Вироблено</th>
                <th>Відходи</th>
                <th>Статус</th>
              </tr>
            </thead>

            <tbody>
              {coil.productions.map(
                (production) => (
                  <tr key={production.id}>
                    <td>
                      {production.productionDate.toLocaleDateString(
                        'uk-UA'
                      )}
                    </td>

                    <td>
                      {production.product.title}
                    </td>

                    <td>
                      {production.variant
                        ? `${Number(
                            production.variant
                              .thickness
                          )} мм, ${
                            production.variant.color
                          }`
                        : '—'}
                    </td>

                    <td>
                      {production.usedWeight !== null
                        ? `${formatNumber(
                            Number(
                              production.usedWeight
                            )
                          )} кг`
                        : '—'}
                    </td>

                    <td>
                      {formatNumber(
                        Number(
                          production.producedQuantity
                        )
                      )}
                    </td>

                    <td>
                      {formatNumber(
                        Number(
                          production.wasteQuantity
                        )
                      )}
                    </td>

                    <td>
                      <span
                        className={`admin-status ${getProductionStatusClass(
                          production.status
                        )}`}
                      >
                        {
                          productionStatusLabels[
                            production.status
                          ]
                        }
                      </span>
                    </td>
                  </tr>
                )
              )}

              {coil.productions.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="admin-empty"
                  >
                    Виробництва з цього рулону
                    ще не було
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