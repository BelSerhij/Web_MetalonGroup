import Link from 'next/link';

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Factory,
  Package,
  Ruler,
  User,
  Weight,
} from 'lucide-react';

import { prisma } from '@/lib/prisma';

import ProductionCoilSelector from '../ProductionCoilSelector';
import CompleteProductionForm from '../CompleteProductionForm';

type ProductionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const STEEL_DENSITY = 7850;

function formatNumber(value: number) {
  return value.toLocaleString('uk-UA', {
    maximumFractionDigits: 2,
  });
}

function formatDate(value: Date) {
  return value.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function calculateKgPerMeter(
  width: number,
  thickness: number
) {
  return (
    (Number(width) / 1000) *
    (Number(thickness) / 1000) *
    STEEL_DENSITY
  );
}

function getAvailableLength(coil: {
  currentLength: unknown;
  currentWeight: unknown;
  width: unknown;
  thickness: unknown;
}) {
  if (coil.currentLength !== null) {
    return Math.max(
      0,
      Number(coil.currentLength)
    );
  }

  const kgPerMeter =
    calculateKgPerMeter(
      Number(coil.width),
      Number(coil.thickness)
    );

  return kgPerMeter > 0
    ? Math.max(
        0,
        Number(coil.currentWeight) /
          kgPerMeter
      )
    : 0;
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'CONFIRMED':
      return 'Очікує запуску';

    case 'IN_PRODUCTION':
      return 'У виробництві';

    case 'READY':
      return 'Готово';

    case 'SHIPPED':
      return 'Відвантажено';

    case 'COMPLETED':
      return 'Завершено';

    case 'CANCELLED':
      return 'Скасовано';

    case 'NEW':
    default:
      return 'Нове';
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case 'IN_PRODUCTION':
      return 'metal-production-status blue';

    case 'READY':
      return 'metal-production-status green';

    case 'SHIPPED':
    case 'COMPLETED':
      return 'metal-production-status green';

    case 'CANCELLED':
      return 'metal-production-status red';

    default:
      return 'metal-production-status gray';
  }
}

export default async function ProductionOrderPage({
  params,
}: ProductionPageProps) {
  const { id } = await params;

  const order =
    await prisma.order.findUnique({
      where: {
        id,
      },

      include: {
        customer: true,

        items: {
          include: {
            product: true,
            variant: true,
          },

          orderBy: {
            createdAt: 'asc',
          },
        },

        productions: {
          where: {
            status: 'IN_PROGRESS',
          },

          include: {
            coil: true,
            product: true,
            variant: true,
          },

          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

  if (!order) {
    return (
      <div className="metal-production-page">
        <div className="metal-production-not-found">
          <Package size={36} />

          <h1>
            Замовлення не знайдено
          </h1>

          <p>
            Таке замовлення не існує.
          </p>

          <Link
            href="/admin/production"
            className="admin-secondary-button"
          >
            <ArrowLeft size={18} />
            Назад до виробництва
          </Link>
        </div>
      </div>
    );
  }

  const activeProductions =
    order.productions;

  const hasActiveProduction =
    activeProductions.length > 0;

  const totalSheets =
    order.items.reduce(
      (total, item) =>
        total +
        Number(item.quantity),
      0
    );

  const totalMeters =
    order.items.reduce(
      (total, item) =>
        total +
        Number(item.quantity) *
          Number(item.length ?? 0),
      0
    );

  /*
   * Групуємо позиції за variant.
   *
   * Один variant = одна група
   * для вибору рулону.
   */

  const requirementMap =
    new Map<
      string,
      {
        variantId: string;
        variantName: string;
        color: string;
        thickness: number;
        coating: string;
        paintingType: string;
        metalBrand: string;
        zincContent: number;
        totalMeters: number;
        totalSheets: number;
      }
    >();

  for (const item of order.items) {
    const variant = item.variant;

    const meters =
      Number(item.quantity) *
      Number(item.length ?? 0);

    const existing =
      requirementMap.get(
        variant.id
      );

    if (existing) {
      existing.totalMeters +=
        meters;

      existing.totalSheets +=
        Number(item.quantity);
    } else {
      requirementMap.set(
        variant.id,
        {
          variantId: variant.id,

          /*
           * Назва товару використовується
           * як назва групи variant.
           */

          variantName:
            item.product.title,

          color:
            variant.color,

          thickness:
            Number(
              variant.thickness
            ),

          coating:
            variant.coating,

          paintingType:
            variant.paintingType,

          metalBrand:
            variant.metalBrand,

          zincContent:
            Number(
              variant.zincContent
            ),

          totalMeters:
            meters,

          totalSheets:
            Number(item.quantity),
        }
      );
    }
  }

  const requirements =
    Array.from(
      requirementMap.values()
    );

  /*
   * Доступні рулони.
   *
   * Основний залишок —
   * currentLength.
   *
   * currentWeight —
   * додаткова інформація.
   */

  const coils =
    await prisma.metalCoil.findMany({
      where: {
        status: 'IN_STOCK',

        OR: [
          {
            currentLength: {
              gt: 0,
            },
          },

          {
            currentWeight: {
              gt: 0,
            },
          },
        ],
      },

      orderBy: {
        receivedAt: 'asc',
      },
    });

  const serializedCoils =
    coils.map((coil) => ({
      id: coil.id,

      code: coil.code,

      color: coil.color,

      thickness:
        Number(
          coil.thickness
        ),

      coating:
        coil.coating,

      paintingType:
        coil.paintingType,

      metalBrand:
        coil.metalBrand,

      zincContent:
        Number(
          coil.zincContent
        ),

      width:
        Number(
          coil.width
        ),

      currentWeight:
        Number(
          coil.currentWeight
        ),

      currentLength:
        coil.currentLength !== null
          ? Number(
              coil.currentLength
            )
          : null,
    }));

  /*
   * Загальний план по м.п.
   */

  const plannedProductionMeters =
    activeProductions.reduce(
      (total, production) =>
        total +
        Number(
          production.usedLength ?? 0
        ),
      0
    );

  /*
   * Показник прогресу.
   */

  const completedMeters =
    activeProductions.reduce(
      (total, production) =>
        total +
        Number(
          production.usedLength ?? 0
        ),
      0
    );

  const statusLabel =
    getStatusLabel(order.status);

  const statusClass =
    getStatusClass(order.status);

  return (
    <div className="metal-production-page">
      {/* TOP HEADER */}

      <div className="metal-production-topbar">
        <div className="metal-production-topbar-left">
          <Link
            href="/admin/production"
            className="metal-production-back"
            aria-label="Назад"
          >
            <ArrowLeft size={17} />
          </Link>

          <div>
            <div className="metal-production-breadcrumb">
              Виробництво
            </div>

            <h1>
              Замовлення #{order.number}
            </h1>

            <div className="metal-production-order-meta">
              <span>
                <CalendarDays size={15} />
                {formatDate(
                  order.createdAt
                )}
              </span>

              {order.customer && (
                <span>
                  <User size={15} />
                  {order.customer.name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="metal-production-topbar-right">
          <span className={statusClass}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* SUMMARY */}

      <div className="metal-production-summary-grid">
        <div className="metal-production-summary-card primary">
          <div className="metal-production-summary-card-icon">
            <Ruler size={20} />
          </div>

          <div>
            <span>
              План виробництва
            </span>

            <strong>
              {formatNumber(
                totalMeters
              )}{' '}
              м.п.
            </strong>
          </div>
        </div>

        <div className="metal-production-summary-card">
          <div className="metal-production-summary-card-icon">
            <Package size={20} />
          </div>

          <div>
            <span>
              Кількість
            </span>

            <strong>
              {formatNumber(
                totalSheets
              )}{' '}
              шт.
            </strong>
          </div>
        </div>

        <div className="metal-production-summary-card">
          <div className="metal-production-summary-card-icon">
            <Factory size={20} />
          </div>

          <div>
            <span>
              Варіантів металу
            </span>

            <strong>
              {requirements.length}
            </strong>
          </div>
        </div>

        <div className="metal-production-summary-card">
          <div className="metal-production-summary-card-icon">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>
              Активних операцій
            </span>

            <strong>
              {activeProductions.length}
            </strong>
          </div>
        </div>
      </div>

      {/* CONTENT */}

      <div className="metal-production-layout">
        <main className="metal-production-main">
          {/* CUSTOMER */}

          <section className="metal-production-card">
            <div className="metal-production-card-header">
              <div>
                <span className="metal-production-kicker">
                  <User size={15} />
                  Клієнт
                </span>

                <h2>
                  Інформація про замовлення
                </h2>
              </div>

              <User size={21} />
            </div>

            {order.customer ? (
              <div className="metal-production-customer">
                <div>
                  <span>
                    Клієнт
                  </span>

                  <strong>
                    {order.customer.name}
                  </strong>
                </div>

                {order.customer.companyName && (
                  <div>
                    <span>
                      Компанія
                    </span>

                    <strong>
                      {
                        order.customer
                          .companyName
                      }
                    </strong>
                  </div>
                )}

                {order.customer.phone && (
                  <div>
                    <span>
                      Телефон
                    </span>

                    <strong>
                      {
                        order.customer.phone
                      }
                    </strong>
                  </div>
                )}

                {order.customer.email && (
                  <div>
                    <span>
                      Email
                    </span>

                    <strong>
                      {
                        order.customer.email
                      }
                    </strong>
                  </div>
                )}
              </div>
            ) : (
              <div className="metal-production-empty-inline">
                Клієнта не вказано
              </div>
            )}
          </section>

          {/* ORDER ITEMS */}

          <section className="metal-production-card">
            <div className="metal-production-card-header">
              <div>
                <span className="metal-production-kicker">
                  <ClipboardList size={15} />
                  Замовлення
                </span>

                <h2>
                  Позиції замовлення
                </h2>

                <p>
                  Основна одиниця виробництва
                  — м.п.
                </p>
              </div>

              <Package size={21} />
            </div>

            <div className="metal-production-table-wrap">
              <table className="metal-production-table">
                <thead>
                  <tr>
                    <th>
                      Продукт
                    </th>

                    <th>
                      Варіант
                    </th>

                    <th>
                      Кількість
                    </th>

                    <th>
                      Довжина
                    </th>

                    <th>
                      Всього
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {order.items.map(
                    (item) => {
                      const meters =
                        Number(
                          item.quantity
                        ) *
                        Number(
                          item.length ??
                            0
                        );

                      return (
                        <tr
                          key={
                            item.id
                          }
                        >
                          <td>
                            <strong>
                              {
                                item
                                  .product
                                  .title
                              }
                            </strong>
                          </td>

                          <td>
                            <span>
                              {
                                item
                                  .variant
                                  .color
                              }
                              {' • '}
                              {Number(
                                item
                                  .variant
                                  .thickness
                              )}{' '}
                              мм
                            </span>

                            <small>
                              {
                                item
                                  .variant
                                  .coating
                              }
                              {' • '}
                              {
                                item
                                  .variant
                                  .metalBrand
                              }
                            </small>
                          </td>

                          <td>
                            {formatNumber(
                              Number(
                                item.quantity
                              )
                            )}{' '}
                            шт.
                          </td>

                          <td>
                            {formatNumber(
                              Number(
                                item
                                  .length ??
                                  0
                              )
                            )}{' '}
                            м
                          </td>

                          <td>
                            <strong>
                              {formatNumber(
                                meters
                              )}{' '}
                              м.п.
                            </strong>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* PREPARATION */}

          {!hasActiveProduction &&
            order.status ===
              'IN_PRODUCTION' &&
            requirements.length > 0 && (
              <section className="metal-production-card">
                <div className="metal-production-card-header">
                  <div>
                    <span className="metal-production-kicker">
                      <Factory size={15} />
                      Крок 1
                    </span>

                    <h2>
                      Підготовка виробництва
                    </h2>

                    <p>
                      Для кожного варіанту
                      виберіть відповідний
                      рулон металу.
                    </p>
                  </div>

                  <Factory size={21} />
                </div>

                <ProductionCoilSelector
                  orderId={order.id}
                  coils={
                    serializedCoils
                  }
                  requirements={
                    requirements
                  }
                />
              </section>
            )}

          {/* ACTIVE PRODUCTION */}

          {hasActiveProduction && (
            <section className="metal-production-card">
              <div className="metal-production-card-header">
                <div>
                  <span className="metal-production-kicker">
                    <Factory size={15} />
                    Крок 2
                  </span>

                  <h2>
                    Виконання виробництва
                  </h2>

                  <p>
                    Внесіть фактичний
                    результат по кожній
                    виробничій операції.
                  </p>
                </div>

                <span className="metal-production-live-status">
                  <CheckCircle2
                    size={16}
                  />
                  Активне
                </span>
              </div>

              <div className="metal-production-completion-list">
                {activeProductions.map(
                  (production) => {
                    const plannedLength =
                      Number(
                        production.usedLength ??
                          0
                      );

                    const matchingItem =
                      order.items.find(
                        (item) =>
                          item.productId ===
                            production.productId &&
                          item.variantId ===
                            production.variantId &&
                          Math.abs(
                            Number(
                              item.quantity
                            ) *
                              Number(
                                item.length ??
                                  0
                              ) -
                              plannedLength
                          ) < 0.001
                      ) ??
                      order.items.find(
                        (item) =>
                          item.productId ===
                            production.productId &&
                          item.variantId ===
                            production.variantId
                      );

                    const plannedSheets =
                      matchingItem
                        ? Number(
                            matchingItem.quantity
                          )
                        : Number(
                            production.producedQuantity
                          );

                    const unitLength =
                      matchingItem
                        ? Number(
                            matchingItem.length ??
                              0
                          )
                        : 0;

                    const usefulWidth =
                      matchingItem
                        ? Number(
                            matchingItem
                              .product
                              .usefulWidth
                          )
                        : 0;

                    const kgPerMeter =
                      calculateKgPerMeter(
                        Number(
                          production.coil
                            .width
                        ),
                        Number(
                          production.coil
                            .thickness
                        )
                      );

                    const availableLength =
                      getAvailableLength(
                        production.coil
                      );

                    return (
                      <CompleteProductionForm
                        key={
                          production.id
                        }
                        productionId={
                          production.id
                        }
                        plannedLength={
                          plannedLength
                        }
                        plannedSheets={
                          plannedSheets
                        }
                        unitLength={
                          unitLength
                        }
                        usefulWidth={
                          usefulWidth
                        }
                        kgPerMeter={
                          kgPerMeter
                        }
                        coilCode={
                          production
                            .coil
                            .code
                        }
                        availableLength={
                          availableLength
                        }
                      />
                    );
                  }
                )}
              </div>
            </section>
          )}

          {/* ACTIVE PRODUCTION DETAILS */}

          {hasActiveProduction && (
            <section className="metal-production-card">
              <div className="metal-production-card-header">
                <div>
                  <span className="metal-production-kicker">
                    <Weight size={15} />
                    Облік металу
                  </span>

                  <h2>
                    Рулони у виробництві
                  </h2>
                </div>

                <Weight size={21} />
              </div>

              <div className="metal-production-coil-live-list">
                {Array.from(
                  new Map(
                    activeProductions.map(
                      (production) => [
                        production.coilId,
                        production.coil,
                      ]
                    )
                  ).values()
                ).map((coil) => {
                  const kgPerMeter =
                    calculateKgPerMeter(
                      Number(
                        coil.width
                      ),
                      Number(
                        coil.thickness
                      )
                    );

                  const availableLength =
                    getAvailableLength(
                      coil
                    );

                  return (
                    <div
                      key={
                        coil.id
                      }
                      className="metal-production-coil-live-card"
                    >
                      <div>
                        <span>
                          Рулон
                        </span>

                        <strong>
                          {coil.code}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Залишок
                        </span>

                        <strong>
                          {formatNumber(
                            availableLength
                          )}{' '}
                          м.п.
                        </strong>
                      </div>

                      <div>
                        <span>
                          Вага 1 м.п.
                        </span>

                        <strong>
                          {formatNumber(
                            kgPerMeter
                          )}{' '}
                          кг
                        </strong>
                      </div>

                      <div>
                        <span>
                          Залишок ваги
                        </span>

                        <strong>
                          {formatNumber(
                            Number(
                              coil.currentWeight
                            )
                          )}{' '}
                          кг
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* NOTE */}

          {order.note && (
            <section className="metal-production-card">
              <div className="metal-production-card-header">
                <div>
                  <span className="metal-production-kicker">
                    <Package size={15} />
                    Додатково
                  </span>

                  <h2>
                    Примітка
                  </h2>
                </div>
              </div>

              <div className="metal-production-note">
                {order.note}
              </div>
            </section>
          )}
        </main>

        {/* RIGHT SIDEBAR */}

        <aside className="metal-production-sidebar">
          <div className="metal-production-card metal-production-sticky-card">
            <div className="metal-production-card-header">
              <div>
                <span className="metal-production-kicker">
                  <Ruler size={15} />
                  Облік
                </span>

                <h2>
                  Показники
                </h2>
              </div>
            </div>

            <div className="metal-production-sidebar-stats">
              <div className="primary">
                <span>
                  План
                </span>

                <strong>
                  {formatNumber(
                    totalMeters
                  )}{' '}
                  м.п.
                </strong>
              </div>

              <div>
                <span>
                  Листів
                </span>

                <strong>
                  {formatNumber(
                    totalSheets
                  )}{' '}
                  шт.
                </strong>
              </div>

              <div>
                <span>
                  Варіантів
                </span>

                <strong>
                  {requirements.length}
                </strong>
              </div>

              <div>
                <span>
                  Рулонів
                </span>

                <strong>
                  {hasActiveProduction
                    ? new Set(
                        activeProductions.map(
                          (item) =>
                            item.coilId
                        )
                      ).size
                    : requirements.length}
                  {' '}
                  шт.
                </strong>
              </div>
            </div>

            {hasActiveProduction && (
              <div className="metal-production-sidebar-progress">
                <div>
                  <span>
                    Заплановано
                  </span>

                  <strong>
                    {formatNumber(
                      plannedProductionMeters
                    )}{' '}
                    м.п.
                  </strong>
                </div>

                <div>
                  <span>
                    Активні операції
                  </span>

                  <strong>
                    {
                      activeProductions.length
                    }
                  </strong>
                </div>
              </div>
            )}

            <div className="metal-production-unit-note">
              <Weight size={16} />

              <span>
                Основна одиниця виробництва
                — м.п. Кілограми не
                вводяться вручну. Вага
                1 м.п. розраховується
                автоматично за шириною
                та товщиною рулону.
              </span>
            </div>
          </div>

          {order.paymentStatus && (
            <div className="metal-production-card">
              <div className="metal-production-card-header">
                <div>
                  <span className="metal-production-kicker">
                    Оплата
                  </span>

                  <h2>
                    Стан замовлення
                  </h2>
                </div>
              </div>

              <div className="metal-production-payment">
                <div>
                  <span>
                    Статус оплати
                  </span>

                  <strong>
                    {order.paymentStatus}
                  </strong>
                </div>

                <div>
                  <span>
                    Сума замовлення
                  </span>

                  <strong>
                    {formatNumber(
                      Number(
                        order.totalAmount
                      )
                    )}{' '}
                    грн
                  </strong>
                </div>

                <div>
                  <span>
                    Сплачено
                  </span>

                  <strong>
                    {formatNumber(
                      Number(
                        order.paidAmount
                      )
                    )}{' '}
                    грн
                  </strong>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
