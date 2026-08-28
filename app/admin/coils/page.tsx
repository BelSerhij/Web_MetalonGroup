import Link from 'next/link';
import {
  Plus,
  Pencil,
} from 'lucide-react';

import { prisma } from '@/lib/prisma';

export default async function CoilsPage() {
  const coils =
    await prisma.metalCoil.findMany({
      include: {
        supplier: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

  return (
    <div>
      <div className="admin-page-header admin-page-header-row">
        <div>
          <h1>
            Рулони металу
          </h1>

          <p>
            Управління металом на складі
          </p>
        </div>

        <Link
          href="/admin/coils/new"
          className="admin-primary-button"
        >
          <Plus size={20} />

          Додати рулон
        </Link>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Код</th>
                <th>Постачальник</th>
                <th>Колір</th>
                <th>Товщина</th>
                <th>Виробник</th>
                <th>Залишок</th>
                <th>Статус</th>
                <th>Дії</th>
              </tr>
            </thead>

            <tbody>
              {coils.map((coil) => (
                <tr key={coil.id}>
                  <td>
                    <strong>
                      {coil.code}
                    </strong>
                  </td>

                  <td>
                    {coil.supplier?.name ?? '—'}
                  </td>

                  <td>
                    {coil.color}
                  </td>

                  <td>
                    {Number(
                      coil.thickness
                    )}{' '}
                    мм
                  </td>

                  <td>
                    {coil.metalBrand}
                  </td>

                  <td>
                    <div className="admin-coil-stock">
                      <strong>
                        {Number(
                          coil.currentWeight
                        ).toLocaleString('uk-UA')}{' '}
                        кг
                      </strong>

                      {coil.currentLength && (
                        <span>
                          {Number(
                            coil.currentLength
                          ).toLocaleString('uk-UA')}{' '}
                          м
                        </span>
                      )}
                    </div>
                  </td>

                  <td>
                    <CoilStatus
                      status={coil.status}
                    />
                  </td>

                  <td>
                    <Link
                      href={`/admin/coils/${coil.id}`}
                      className="admin-action-button"
                      aria-label="Відкрити рулон"
                    >
                      <Pencil size={18} />
                    </Link>
                  </td>
                </tr>
              ))}

              {coils.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="admin-empty"
                  >
                    Рулонів металу поки немає
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

type CoilStatusProps = {
  status:
    | 'IN_STOCK'
    | 'IN_USE'
    | 'FINISHED'
    | 'WRITTEN_OFF';
};

function CoilStatus({
  status,
}: CoilStatusProps) {
  const statuses = {
    IN_STOCK: {
      label: 'На складі',
      className:
        'admin-status admin-status-success',
    },

    IN_USE: {
      label: 'У виробництві',
      className:
        'admin-status admin-status-warning',
    },

    FINISHED: {
      label: 'Використаний',
      className:
        'admin-status admin-status-muted',
    },

    WRITTEN_OFF: {
      label: 'Списаний',
      className:
        'admin-status admin-status-danger',
    },
  };

  const currentStatus =
    statuses[status];

  return (
    <span
      className={
        currentStatus.className
      }
    >
      {currentStatus.label}
    </span>
  );
}