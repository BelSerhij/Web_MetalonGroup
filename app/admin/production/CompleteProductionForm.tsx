'use client';

import { useMemo, useState, useTransition } from 'react';
import { CheckCircle2, Factory, Loader2, Package, Ruler, Weight } from 'lucide-react';
import { completeProduction } from './actions';

type CompleteProductionFormProps = {
  productionId: string;
  plannedLength: number;
  plannedSheets: number;
  unitLength: number;
  usefulWidth: number;
  kgPerMeter: number;
  coilCode: string;
  availableLength: number;
};

function formatNumber(value: number) {
  return value.toLocaleString('uk-UA', { maximumFractionDigits: 2 });
}

export default function CompleteProductionForm({
  productionId,
  plannedLength,
  plannedSheets,
  unitLength,
  usefulWidth,
  kgPerMeter,
  coilCode,
  availableLength,
}: CompleteProductionFormProps) {
  const [isPending, startTransition] = useTransition();
  const [usedLength, setUsedLength] = useState(plannedLength);
  const [producedSheets, setProducedSheets] = useState(plannedSheets);
  const [wasteSheets, setWasteSheets] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const actualUsedWeight = useMemo(
    () => Math.max(0, Number(usedLength) * Number(kgPerMeter)),
    [usedLength, kgPerMeter]
  );

  const producedMeters = useMemo(
    () => Math.max(0, Number(producedSheets) * Number(unitLength)),
    [producedSheets, unitLength]
  );

  const producedArea = useMemo(
    () => Math.max(0, producedMeters * Number(usefulWidth)),
    [producedMeters, usefulWidth]
  );

  const remainingLength = Math.max(0, Number(availableLength) - Number(usedLength));
  const remainingWeight = remainingLength * Number(kgPerMeter);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!Number.isFinite(usedLength) || !Number.isFinite(producedSheets) || !Number.isFinite(wasteSheets)) {
      setError('Заповніть усі поля коректними числами');
      return;
    }

    if (usedLength < 0 || usedLength > availableLength + 0.0001) {
      setError(`У рулоні ${coilCode} доступно лише ${formatNumber(availableLength)} м.п.`);
      return;
    }

    if (!Number.isInteger(producedSheets) || producedSheets < 0) {
      setError('Кількість готових листів повинна бути цілим числом');
      return;
    }

    if (!Number.isInteger(wasteSheets) || wasteSheets < 0) {
      setError('Кількість відходів повинна бути цілим числом');
      return;
    }

    startTransition(async () => {
      try {
        await completeProduction({
          productionId,
          usedLength,
          producedSheets,
          wasteSheets,
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Не вдалося завершити виробництво');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="metal-production-complete">
      <div className="metal-production-complete-header">
        <div>
          <div className="metal-production-kicker"><Factory size={15} /> Виробнича операція</div>
          <h3>Рулон {coilCode}</h3>
          <p>Оператор вводить фактичний прокат у м.п.; вага та складська кількість розраховуються автоматично.</p>
        </div>
        <div className="metal-production-live-weight">
          <Weight size={18} />
          <span>Вага 1 м.п.</span>
          <strong>{formatNumber(kgPerMeter)} кг</strong>
        </div>
      </div>

      <div className="metal-production-facts">
        <div className="metal-production-fact-primary">
          <label htmlFor={`usedLength-${productionId}`}><Ruler size={16} /> Фактично прокатано</label>
          <div className="metal-production-input-with-unit">
            <input id={`usedLength-${productionId}`} type="number" min="0" max={availableLength} step="0.01" value={usedLength} disabled={isPending} onChange={(e) => setUsedLength(e.target.value === '' ? 0 : Number(e.target.value))} />
            <span>м.п.</span>
          </div>
          <small>План: {formatNumber(plannedLength)} м.п. · доступно: {formatNumber(availableLength)} м.п.</small>
        </div>

        <div className="metal-production-form-field">
          <label htmlFor={`produced-${productionId}`}><Package size={16} /> Готові листи</label>
          <div className="metal-production-input-with-unit">
            <input id={`produced-${productionId}`} type="number" min="0" step="1" value={producedSheets} disabled={isPending} onChange={(e) => setProducedSheets(e.target.value === '' ? 0 : Number(e.target.value))} />
            <span>шт.</span>
          </div>
          <small>На склад: {formatNumber(producedMeters)} м.п. · {formatNumber(producedArea)} м²</small>
        </div>

        <div className="metal-production-form-field">
          <label htmlFor={`waste-${productionId}`}><Package size={16} /> Брак / відходи</label>
          <div className="metal-production-input-with-unit">
            <input id={`waste-${productionId}`} type="number" min="0" step="1" value={wasteSheets} disabled={isPending} onChange={(e) => setWasteSheets(e.target.value === '' ? 0 : Number(e.target.value))} />
            <span>шт.</span>
          </div>
          <small>Фіксується окремо від готової продукції.</small>
        </div>
      </div>

      <div className="metal-production-auto-summary">
        <div><span>Автоматично використано</span><strong>{formatNumber(actualUsedWeight)} кг</strong></div>
        <div><span>Готова продукція</span><strong>{formatNumber(producedMeters)} м.п.</strong><small>{formatNumber(producedArea)} м²</small></div>
        <div><span>Залишок рулону</span><strong>{formatNumber(remainingLength)} м.п.</strong><small>≈ {formatNumber(remainingWeight)} кг</small></div>
      </div>

      {error && <div className="metal-production-error">{error}</div>}

      <div className="metal-production-complete-actions">
        <span>Після завершення рулон оновлюється, а готова продукція автоматично потрапляє в складський рух.</span>
        <button type="submit" className="admin-primary-button" disabled={isPending}>
          {isPending ? <><Loader2 size={18} className="admin-spin" /> Завершення...</> : <><CheckCircle2 size={18} /> Завершити виробництво</>}
        </button>
      </div>
    </form>
  );
}
