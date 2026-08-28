import Link from 'next/link';

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Factory,
  Package,
  PlayCircle,
  Ruler,
  User,
} from 'lucide-react';

import { prisma } from '@/lib/prisma';

function formatNumber(
  value: number
): string {
  return value.toLocaleString(
    'uk-UA',
    {
      maximumFractionDigits: 2,
    }
  );
}

function formatDate(
  value: Date
): string {
  return value.toLocaleDateString(
    'uk-UA',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }
  );
}

function getStatusLabel(
  status: string
): string {
  switch (status) {
    case 'CONFIRMED':
      return 'Очікує запуску';

    case 'IN_PRODUCTION':
      return 'У виробництві';

    case 'READY':
      return 'Готово';

    default:
      return status;
  }
}

function getStatusClass(
  status: string
): string {
  switch (status) {
    case 'IN_PRODUCTION':
      return 'metal-production-status blue';

    case 'READY':
      return 'metal-production-status green';

    case 'CONFIRMED':
      return 'metal-production-status gray';

    default:
      return 'metal-production-status gray';
  }
}

export default async function Page() {
  const orders =
    await prisma.order.findMany({
      where: {
        status: {
          in: [
            'CONFIRMED',
            'IN_PRODUCTION',
            'READY',
          ],
        },
      },

      include: {
        customer: true,

        items: {
          select: {
            quantity: true,
            length: true,
          },
        },

        productions: {
          select: {
            id: true,
            status: true,
            usedLength: true,
            producedQuantity: true,
          },
        },
      },

      orderBy: {
        updatedAt: 'desc',
      },
    });

  const productionOrders =
    orders.map((order) => {
      const plannedMeters =
        order.items.reduce(
          (
            total,
            item
          ) =>
            total +
            Number(
              item.quantity
            ) *
              Number(
                item.length ??
                  0
              ),
          0
        );

      const actualMeters =
        order.productions.reduce(
          (
            total,
            production
          ) =>
            total +
            Number(
              production.usedLength ??
                0
            ),
          0
        );

      const producedQuantity =
        order.productions.reduce(
          (
            total,
            production
          ) =>
            total +
            Number(
              production.producedQuantity ??
                0
            ),
          0
        );

      const totalSheets =
        order.items.reduce(
          (
            total,
            item
          ) =>
            total +
            Number(
              item.quantity
            ),
          0
        );

      const completedProductions =
        order.productions.filter(
          (production) =>
            production.status ===
            'COMPLETED'
        ).length;

      const activeProductions =
        order.productions.filter(
          (production) =>
            production.status ===
            'IN_PROGRESS'
        ).length;

      const progress =
        plannedMeters > 0
          ? Math.min(
              100,
              (actualMeters /
                plannedMeters) *
                100
            )
          : 0;

      return {
        id: order.id,
        number: order.number,
        status: order.status,
        customerName:
          order.customer?.name ??
          'Клієнт не вказаний',
        updatedAt:
          order.updatedAt,
        plannedMeters,
        actualMeters,
        producedQuantity,
        totalSheets,
        completedProductions,
        activeProductions,
        progress,
      };
    });

  const totalMeters =
    productionOrders.reduce(
      (
        total,
        order
      ) =>
        total +
        order.plannedMeters,
      0
    );

  const actualMeters =
    productionOrders.reduce(
      (
        total,
        order
      ) =>
        total +
        order.actualMeters,
      0
    );

  const waitingCount =
    productionOrders.filter(
      (order) =>
        order.status ===
        'CONFIRMED'
    ).length;

  const activeCount =
    productionOrders.filter(
      (order) =>
        order.status ===
        'IN_PRODUCTION'
    ).length;

  const readyCount =
    productionOrders.filter(
      (order) =>
        order.status ===
        'READY'
    ).length;

  return (
    <main className="metal-production-page">
      {/* HEADER */}

      <div className="metal-production-topbar">
        <div>
          <div className="metal-production-breadcrumb">
            METALON GROUP
          </div>

          <h1>
            Виробництво
          </h1>

          <p>
            Керування виробничими
            замовленнями
          </p>
        </div>

        <Factory size={28} />
      </div>

      {/* SUMMARY */}

      <section className="metal-production-summary-grid">
        <div className="metal-production-summary-card">
          <div>
            <span>
              Всього
            </span>

            <strong>
              {
                productionOrders.length
              }
            </strong>
          </div>

          <ClipboardList
            size={22}
          />
        </div>

        <div className="metal-production-summary-card">
          <div>
            <span>
              Очікують запуску
            </span>

            <strong>
              {waitingCount}
            </strong>
          </div>

          <PlayCircle
            size={22}
          />
        </div>

        <div className="metal-production-summary-card">
          <div>
            <span>
              У виробництві
            </span>

            <strong>
              {activeCount}
            </strong>
          </div>

          <Factory
            size={22}
          />
        </div>

        <div className="metal-production-summary-card">
          <div>
            <span>
              Готові
            </span>

            <strong>
              {readyCount}
            </strong>
          </div>

          <CheckCircle2
            size={22}
          />
        </div>
      </section>

      {/* MAIN CARD */}

      <section className="metal-production-card">
        <div className="metal-production-card-header">
          <div>
            <span className="metal-production-kicker">
              <Factory size={15} />
              Виробництво
            </span>

            <h2>
              Замовлення
            </h2>

            <p>
              Основна одиниця
              виробництва — м.п.
            </p>
          </div>
        </div>

        {/* TOP METRICS */}

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
              Факт
            </span>

            <strong>
              {formatNumber(
                actualMeters
              )}{' '}
              м.п.
            </strong>
          </div>
        </div>

        {/* LIST */}

        {productionOrders.length ===
        0 ? (
          <div className="metal-production-not-found">
            <Factory size={36} />

            <h2>
              Немає виробничих
              замовлень
            </h2>

            <p>
              Замовлення, передані
              у виробництво, зявляться
              тут.
            </p>
          </div>
        ) : (
          <div className="metal-production-order-list">
            {productionOrders.map(
              (order) => (
                <Link
                  key={order.id}
                  href={`/admin/production/${order.id}`}
                  className="metal-production-order-card"
                >
                  <div className="metal-production-order-main">
                    <div className="metal-production-order-heading">
                      <strong>
                        #{order.number}
                      </strong>

                      <span
                        className={getStatusClass(
                          order.status
                        )}
                      >
                        {getStatusLabel(
                          order.status
                        )}
                      </span>
                    </div>

                    <div className="metal-production-order-meta">
                      <span>
                        <User
                          size={15}
                        />

                        {
                          order.customerName
                        }
                      </span>

                      <span>
                        <Package
                          size={15}
                        />

                        {formatNumber(
                          order.totalSheets
                        )}{' '}
                        шт.
                      </span>

                      <span>
                        <CalendarDays
                          size={15}
                        />

                        {formatDate(
                          order.updatedAt
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="metal-production-order-progress">
                    <div className="metal-production-progress-top">
                      <span>
                        Прокат
                      </span>

                      <strong>
                        {formatNumber(
                          order.actualMeters
                        )}{' '}
                        /{' '}
                        {formatNumber(
                          order.plannedMeters
                        )}{' '}
                        м.п.
                      </strong>
                    </div>

                    <div className="metal-production-progress-track">
                      <div
                        className="metal-production-progress-value"
                        style={{
                          width: `${order.progress}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="metal-production-order-result">
                    <span>
                      Виготовлено
                    </span>

                    <strong>
                      {formatNumber(
                        order.producedQuantity
                      )}{' '}
                      шт.
                    </strong>
                  </div>

                  <div className="metal-production-order-result">
                    <span>
                      Операції
                    </span>

                    <strong>
                      {
                        order.completedProductions
                      }
                      {' / '}
                      {
                        order.activeProductions +
                        order.completedProductions
                      }
                    </strong>
                  </div>

                  <ArrowRight
                    size={20}
                  />
                </Link>
              )
            )}
          </div>
        )}
      </section>

      {/* FOOTER NOTE */}

      <div className="metal-production-unit-note">
        <Ruler size={16} />

        <span>
          м.п. — основна одиниця
          обліку виробництва.
          Кілограми використовуються
          як додаткова автоматично
          розрахована інформація.
        </span>
      </div>
    </main>
  );
}