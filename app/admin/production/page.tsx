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
import { saveProductionPlan, saveShiftEmployeesForm } from './actions';

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
  const [orders, shifts, productionEmployees] = await Promise.all([
    prisma.order.findMany({
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
            wasteQuantity: true,
            product: { select: { usefulWidth: true } },
          },
        },
        manualItems: { select: { id: true } },
        productionPlan: { select: { id: true } },
      },

      orderBy: {
        updatedAt: 'desc',
      },
    }),
    prisma.productionShift.findMany({
      include: {
        plans: {
          include: {
            order: {
              include: {
                customer: true,
                productions: { select: { usedLength: true, coilId: true, status: true } },
              },
            },
          },
        },
        employees: { include: { employee: true } },
      },
      orderBy: { workDate: 'asc' },
    }),
    prisma.employee.findMany({ where: { employeeType: 'PRODUCTION', isActive: true }, orderBy: { name: 'asc' } }),
  ]);

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
        order.productions.filter((p)=>p.status==='COMPLETED').reduce(
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
        order.productions.filter((p)=>p.status==='COMPLETED').reduce(
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

      const defectSheets=order.productions.filter((p)=>p.status==='COMPLETED').reduce((sum,p)=>sum+Number(p.wasteQuantity||0),0);
      const estimatedWasteMeters=order.productions.filter((p)=>p.status==='COMPLETED').reduce((sum,p)=>sum+Math.max(0,Number(p.usedLength||0)-Number(p.producedQuantity||0)/Number(p.product.usefulWidth||1)),0);

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
        defectSheets,
        estimatedWasteMeters,
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
  const defectSheets=productionOrders.reduce((sum,o)=>sum+o.defectSheets,0);
  const estimatedWasteMeters=productionOrders.reduce((sum,o)=>sum+o.estimatedWasteMeters,0);

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

      <div className="production-quality-strip"><strong>Контроль якості</strong><span>Браковані листи: <b>{formatNumber(defectSheets)} шт.</b></span><span>Орієнтовний невихід матеріалу: <b>{formatNumber(estimatedWasteMeters)} м.п.</b></span><small>Розрахунок: прокатано мінус придатна площа, перерахована в м.п.</small></div>

      <section className="metal-production-card metal-production-planner">
        <div className="metal-production-card-header"><div><span className="metal-production-kicker"><CalendarDays size={15}/> Планування</span><h2>План по днях</h2><p>Оберіть день для кожного замовлення та вкажіть бригаду зміни.</p></div></div>
        <form action={saveProductionPlan} className="production-plan-form">
          <label>Замовлення<select name="orderId" required defaultValue=""><option value="" disabled>Оберіть замовлення</option>{orders.filter((o)=>(o.status==='CONFIRMED'||o.status==='IN_PRODUCTION')&&o.manualItems.length===0).map(o=><option value={o.id} key={o.id}>№ {o.number} · {o.customer?.name||'Клієнт не вказаний'} · {formatNumber(o.items.reduce((s,i)=>s+Number(i.quantity)*Number(i.length||0),0))} м.п.</option>)}</select></label>
          <label>День виконання<input type="date" name="workDate" required defaultValue={new Date().toISOString().slice(0,10)}/></label>
          <button className="admin-primary-button" type="submit">Додати в план</button>
        </form>
        {shifts.length===0?<div className="metal-production-empty-inline">План ще порожній. Оберіть замовлення та дату вище.</div>:<div className="production-days">{shifts.map((shift)=>{
          const meters=shift.plans.reduce((s,p)=>s+Number(p.plannedMeters),0);
          const completedRuns=shift.plans.flatMap(p=>p.order.productions).filter(r=>r.status==='COMPLETED');
          const usedMeters=completedRuns.reduce((n,r)=>n+Number(r.usedLength||0),0);
          const coils=new Set(completedRuns.map(r=>r.coilId)).size;
          const selected=new Set(shift.employees.map(a=>a.employeeId));
          return <article className="production-day-card" key={shift.id}>
            <header><div><CalendarDays size={19}/><strong>{formatDate(shift.workDate)}</strong></div><span>{shift.plans.length} замовлень · {formatNumber(meters)} м.п.</span></header>
            <div className="production-day-orders">{shift.plans.map(plan=><Link href={`/admin/production/${plan.orderId}`} key={plan.id} className="production-day-order"><span><b>№ {plan.order.number}</b><small>{plan.order.customer?.name||'Клієнт не вказаний'}</small></span><span>{formatNumber(Number(plan.plannedMeters))} м.п.</span></Link>)}</div>
            <div className="production-day-facts"><span>Виконано: <b>{formatNumber(usedMeters)} м.п.</b></span><span>Задіяно рулонів: <b>{coils}</b></span></div>
            <form action={saveShiftEmployeesForm.bind(null,shift.id)} className="production-day-team"><strong>Працівники зміни</strong><div>{productionEmployees.map(emp=><label key={emp.id}><input type="checkbox" name="employeeIds" value={emp.id} defaultChecked={selected.has(emp.id)}/>{emp.name}</label>)}</div><button type="submit" className="admin-secondary-button">Зберегти бригаду</button></form>
          </article>;
        })}</div>}
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
