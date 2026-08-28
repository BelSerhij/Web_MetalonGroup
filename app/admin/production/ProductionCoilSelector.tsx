'use client';

import {
  useMemo,
  useState,
  useTransition,
} from 'react';

import {
  Check,
  ChevronDown,
  Factory,
  Package,
  Play,
  Ruler,
  Weight,
} from 'lucide-react';

import { startProduction } from './actions';

type Coil = {
  id: string;
  code: string;
  color: string;
  thickness: number;
  coating: string;
  paintingType: string;
  metalBrand: string;
  zincContent: number;
  width: number;
  currentWeight: number;
  currentLength: number | null;
};

type ProductionRequirement = {
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
};

type ProductionCoilSelectorProps = {
  orderId: string;
  coils: Coil[];
  requirements: ProductionRequirement[];
};

const STEEL_DENSITY = 7850;

function formatNumber(value: number) {
  return value.toLocaleString('uk-UA', {
    maximumFractionDigits: 2,
  });
}

function kgPerMeter(coil: Coil) {
  return (
    (Number(coil.width) / 1000) *
    (Number(coil.thickness) / 1000) *
    STEEL_DENSITY
  );
}

function availableMeters(coil: Coil) {
  if (coil.currentLength !== null) {
    return Math.max(0, Number(coil.currentLength));
  }

  const weightPerMeter = kgPerMeter(coil);

  return weightPerMeter > 0
    ? Math.max(
        0,
        Number(coil.currentWeight) /
          weightPerMeter
      )
    : 0;
}

export default function ProductionCoilSelector({
  orderId,
  coils,
  requirements,
}: ProductionCoilSelectorProps) {
  const [selectedCoils, setSelectedCoils] =
    useState<Record<string, string>>({});

  const [openVariant, setOpenVariant] =
    useState<string | null>(
      requirements[0]?.variantId ?? null
    );

  const [error, setError] =
    useState('');

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const selectionSummary = useMemo(() => {
    let totalMeters = 0;
    let totalWeight = 0;

    requirements.forEach((requirement) => {
      const coilId =
        selectedCoils[requirement.variantId];

      const coil = coils.find(
        (item) => item.id === coilId
      );

      if (!coil) return;

      const weight =
        requirement.totalMeters *
        kgPerMeter(coil);

      totalMeters +=
        requirement.totalMeters;
      totalWeight += weight;
    });

    return {
      totalMeters,
      totalWeight,
    };
  }, [
    coils,
    requirements,
    selectedCoils,
  ]);

  const allRequirementsSelected =
    requirements.every(
      (requirement) =>
        Boolean(
          selectedCoils[
            requirement.variantId
          ]
        )
    );

  const handleSelectCoil = (
    variantId: string,
    coilId: string
  ) => {
    setError('');

    setSelectedCoils((previous) => ({
      ...previous,
      [variantId]: coilId,
    }));
  };

  const handleStartProduction = () => {
    setError('');

    if (!allRequirementsSelected) {
      setError(
        'Оберіть рулон для кожної позиції виробництва'
      );
      return;
    }

    for (const requirement of requirements) {
      const coilId =
        selectedCoils[requirement.variantId];

      const coil = coils.find(
        (item) => item.id === coilId
      );

      if (!coil) {
        setError(
          `Не знайдено рулон для ${requirement.variantName}`
        );
        return;
      }

      const available =
        availableMeters(coil);

      if (
        requirement.totalMeters >
        available + 0.0001
      ) {
        setError(
          `Рулон ${coil.code}: потрібно ${formatNumber(
            requirement.totalMeters
          )} м.п., доступно ${formatNumber(
            available
          )} м.п.`
        );
        return;
      }
    }

    const coilAssignments =
      requirements.map((requirement) => ({
        variantId:
          requirement.variantId,
        coilId:
          selectedCoils[
            requirement.variantId
          ],
      }));

    startTransition(async () => {
      try {
        await startProduction({
          orderId,
          coilAssignments,
        });
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Не вдалося запустити виробництво'
        );
      }
    });
  };

  return (
    <div className="metal-production-selector">
      <div className="metal-production-selector-head">
        <div>
          <div className="metal-production-kicker">
            <Factory size={15} />
            Підготовка виробництва
          </div>

          <h2>
            Вибір рулонів
          </h2>

          <p>
            Для кожної групи продукції
            виберіть сумісний рулон.
            Основна одиниця — м.п.
          </p>
        </div>

        <div className="metal-production-selector-total">
          <span>Всього до виробництва</span>
          <strong>
            {formatNumber(
              selectionSummary.totalMeters
            )}{' '}
            м.п.
          </strong>
          <small>
            ≈{' '}
            {formatNumber(
              selectionSummary.totalWeight
            )}{' '}
            кг
          </small>
        </div>
      </div>

      <div className="metal-production-requirements">
        {requirements.map((requirement, index) => {
          const isOpen =
            openVariant ===
            requirement.variantId;

          const selectedCoilId =
            selectedCoils[
              requirement.variantId
            ];

          const selectedCoil =
            coils.find(
              (coil) =>
                coil.id === selectedCoilId
            );

          const compatibleCoils =
            coils.filter(
              (coil) =>
                coil.color ===
                  requirement.color &&
                Math.abs(
                  Number(coil.thickness) -
                    Number(
                      requirement.thickness
                    )
                ) < 0.001 &&
                coil.coating ===
                  requirement.coating &&
                coil.paintingType ===
                  requirement.paintingType &&
                coil.metalBrand ===
                  requirement.metalBrand
            );

          const selectedAvailable =
            selectedCoil
              ? availableMeters(
                  selectedCoil
                )
              : 0;

          const selectedWeightPerMeter =
            selectedCoil
              ? kgPerMeter(selectedCoil)
              : 0;

          const selectedRequiredWeight =
            selectedCoil
              ? requirement.totalMeters *
                selectedWeightPerMeter
              : 0;

          const selectedRemaining =
            selectedCoil
              ? Math.max(
                  0,
                  selectedAvailable -
                    requirement.totalMeters
                )
              : 0;

          return (
            <div
              key={
                requirement.variantId
              }
              className={`metal-production-requirement ${
                isOpen
                  ? 'metal-production-requirement-open'
                  : ''
              }`}
            >
              <button
                type="button"
                className="metal-production-requirement-header"
                onClick={() =>
                  setOpenVariant(
                    isOpen
                      ? null
                      : requirement.variantId
                  )
                }
              >
                <span className="metal-production-requirement-index">
                  {index + 1}
                </span>

                <span className="metal-production-requirement-title">
                  <strong>
                    {requirement.variantName}
                  </strong>

                  <small>
                    {requirement.color}
                    {' • '}
                    {requirement.thickness} мм
                    {' • '}
                    {requirement.coating}
                  </small>
                </span>

                <span className="metal-production-requirement-meters">
                  <strong>
                    {formatNumber(
                      requirement.totalMeters
                    )}{' '}
                    м.п.
                  </strong>

                  <small>
                    {formatNumber(
                      requirement.totalSheets
                    )}{' '}
                    шт.
                  </small>
                </span>

                {selectedCoil && (
                  <span className="metal-production-selected-coil">
                    <Check size={15} />
                    {selectedCoil.code}
                  </span>
                )}

                <ChevronDown
                  size={19}
                  className={
                    isOpen
                      ? 'metal-production-chevron-open'
                      : ''
                  }
                />
              </button>

              {isOpen && (
                <div className="metal-production-requirement-body">
                  <div className="metal-production-material-specs">
                    <div>
                      <span>Колір</span>
                      <strong>
                        {requirement.color}
                      </strong>
                    </div>

                    <div>
                      <span>Товщина</span>
                      <strong>
                        {requirement.thickness} мм
                      </strong>
                    </div>

                    <div>
                      <span>Покриття</span>
                      <strong>
                        {requirement.coating}
                      </strong>
                    </div>

                    <div>
                      <span>Фарбування</span>
                      <strong>
                        {
                          requirement.paintingType
                        }
                      </strong>
                    </div>

                    <div>
                      <span>Метал</span>
                      <strong>
                        {requirement.metalBrand}
                      </strong>
                    </div>

                    <div>
                      <span>Цинк</span>
                      <strong>
                        {requirement.zincContent}{' '}
                        г/м²
                      </strong>
                    </div>
                  </div>

                  <div className="metal-production-coil-title">
                    <div>
                      <Package size={18} />
                      <strong>
                        Доступні рулони
                      </strong>
                    </div>

                    <span>
                      Потрібно{' '}
                      {formatNumber(
                        requirement.totalMeters
                      )}{' '}
                      м.п.
                    </span>
                  </div>

                  {compatibleCoils.length ===
                  0 ? (
                    <div className="metal-production-empty">
                      <Package size={30} />
                      <strong>
                        Немає сумісних рулонів
                      </strong>
                      <span>
                        Потрібен метал з
                        відповідними
                        характеристиками.
                      </span>
                    </div>
                  ) : (
                    <div className="metal-production-coils">
                      {compatibleCoils.map(
                        (coil) => {
                          const available =
                            availableMeters(
                              coil
                            );

                          const canProduce =
                            available + 0.0001 >=
                            requirement.totalMeters;

                          const isSelected =
                            coil.id ===
                            selectedCoilId;

                          const weightPerMeter =
                            kgPerMeter(
                              coil
                            );

                          return (
                            <button
                              key={coil.id}
                              type="button"
                              disabled={
                                !canProduce ||
                                isPending
                              }
                              className={`metal-production-coil ${
                                isSelected
                                  ? 'metal-production-coil-selected'
                                  : ''
                              } ${
                                !canProduce
                                  ? 'metal-production-coil-disabled'
                                  : ''
                              }`}
                              onClick={() =>
                                handleSelectCoil(
                                  requirement.variantId,
                                  coil.id
                                )
                              }
                            >
                              <div className="metal-production-coil-check">
                                {isSelected ? (
                                  <Check
                                    size={17}
                                  />
                                ) : null}
                              </div>

                              <div className="metal-production-coil-main">
                                <strong>
                                  {coil.code}
                                </strong>

                                <span>
                                  {coil.color}
                                  {' • '}
                                  {
                                    coil.thickness
                                  }{' '}
                                  мм
                                  {' • '}
                                  {
                                    coil.metalBrand
                                  }
                                </span>
                              </div>

                              <div className="metal-production-coil-metrics">
                                <div>
                                  <span>
                                    Залишок
                                  </span>
                                  <strong>
                                    {formatNumber(
                                      available
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
                                      weightPerMeter
                                    )}{' '}
                                    кг
                                  </strong>
                                </div>

                                <div>
                                  <span>
                                    Вага рулону
                                  </span>
                                  <strong>
                                    {formatNumber(
                                      coil.currentWeight
                                    )}{' '}
                                    кг
                                  </strong>
                                </div>
                              </div>

                              {!canProduce && (
                                <span className="metal-production-coil-warning">
                                  Недостатньо
                                  м.п.
                                </span>
                              )}
                            </button>
                          );
                        }
                      )}
                    </div>
                  )}

                  {selectedCoil && (
                    <div className="metal-production-selected-summary">
                      <div>
                        <span>
                          Вага 1 м.п.
                        </span>
                        <strong>
                          {formatNumber(
                            selectedWeightPerMeter
                          )}{' '}
                          кг
                        </strong>
                      </div>

                      <div>
                        <span>
                          Потрібно
                        </span>
                        <strong>
                          {formatNumber(
                            requirement.totalMeters
                          )}{' '}
                          м.п.
                        </strong>
                      </div>

                      <div>
                        <span>
                          Розрахункова вага
                        </span>
                        <strong>
                          {formatNumber(
                            selectedRequiredWeight
                          )}{' '}
                          кг
                        </strong>
                      </div>

                      <div>
                        <span>
                          Залишиться
                        </span>
                        <strong>
                          {formatNumber(
                            selectedRemaining
                          )}{' '}
                          м.п.
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="metal-production-error">
          {error}
        </div>
      )}

      <div className="metal-production-start-bar">
        <div>
          <span>Готовність до запуску</span>
          <strong>
            {Object.keys(selectedCoils).length}{' '}
            / {requirements.length}
          </strong>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          disabled={
            !allRequirementsSelected ||
            isPending
          }
          onClick={
            handleStartProduction
          }
        >
          <Play size={18} />
          {isPending
            ? 'Запуск...'
            : 'Запустити виробництво'}
        </button>
      </div>
    </div>
  );
}
