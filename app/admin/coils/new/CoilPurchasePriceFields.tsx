'use client';

import { useMemo, useState } from 'react';
import { coilKgPerLinearMeter, normalizeCoilPurchasePrice, type CoilPriceUnit } from '@/lib/pricing-core';

const units: { value: CoilPriceUnit; label: string; rate: string }[] = [
  { value: 'PER_KG', label: 'за кг', rate: 'грн/кг' },
  { value: 'PER_LINEAR_METER', label: 'за погонний метр', rate: 'грн/м.п.' },
  { value: 'PER_SQUARE_METER', label: 'за м² рулону', rate: 'грн/м²' },
];

export function CoilPurchasePriceFields() {
  const [thickness, setThickness] = useState(0.45);
  const [weight, setWeight] = useState(5000);
  const [unit, setUnit] = useState<CoilPriceUnit>('PER_KG');
  const [unitPrice, setUnitPrice] = useState(70);

  const kgPerMeter = coilKgPerLinearMeter(thickness);
  const resolvedLength = weight / kgPerMeter;
  const prices = useMemo(() => normalizeCoilPurchasePrice({ unit, unitPrice, thicknessMm: thickness, weightKg: weight, lengthMeters: resolvedLength }), [unit, unitPrice, thickness, weight, resolvedLength]);
  const selectedUnit = units.find((item) => item.value === unit)!;

  return <>
    <div className="admin-form-group">
      <label htmlFor="thickness">Товщина металу, мм</label>
      <input id="thickness" name="thickness" type="number" min="0.1" step="0.001" value={thickness} onChange={(event) => setThickness(Number(event.target.value) || 0.45)} required />
    </div>
    <div className="admin-form-group">
      <label htmlFor="width">Ширина рулону</label>
      <input id="width" name="width" value="1.25" readOnly />
      <small>Фіксована ширина заготовки — 1250 мм</small>
    </div>
    <div className="admin-form-group">
      <label htmlFor="initialWeight">Вага рулону, кг</label>
      <input id="initialWeight" name="initialWeight" type="number" min="0.001" step="0.001" value={weight} onChange={(event) => setWeight(Number(event.target.value) || 0.001)} required />
    </div>
    <div className="admin-form-group">
      <label htmlFor="initialLength">Розрахункова довжина рулону, м</label>
      <input id="initialLength" name="initialLength" type="number" value={resolvedLength.toFixed(3)} readOnly />
      <small>Автоматично визначена з ваги, товщини та ширини 1250 мм.</small>
    </div>
    <div className="admin-form-group">
      <label htmlFor="purchaseUnit">Постачальник указав ціну</label>
      <select id="purchaseUnit" name="purchaseUnit" value={unit} onChange={(event) => setUnit(event.target.value as CoilPriceUnit)}>
        {units.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
    </div>
    <div className="admin-form-group">
      <label htmlFor="purchaseUnitPrice">Ціна постачальника, {selectedUnit.rate}</label>
      <input id="purchaseUnitPrice" name="purchaseUnitPrice" type="number" min="0.01" step="0.01" value={unitPrice} onChange={(event) => setUnitPrice(Number(event.target.value) || 0.01)} required />
    </div>
    <input type="hidden" name="productSlug" value="profnastyl-s10" />
    <div className="admin-form-group" style={{ gridColumn: '1 / -1', padding: '14px 16px', borderRadius: 8, background: '#f4f7f1', color: '#39483b', fontSize: 13 }}>
      <strong>Автоматичний перерахунок для С-10</strong>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 22px', marginTop: 9 }}>
        <span>Вага: {kgPerMeter.toFixed(3)} кг/м.п.</span>
        <span>Ціна: {prices.pricePerKg.toFixed(2)} грн/кг</span>
        <span>{prices.pricePerMeter.toFixed(2)} грн/м.п.</span>
        <span>{prices.pricePerSquareMeter.toFixed(2)} грн/м² рулону</span>
        <span>Закупівля всього рулону: {prices.totalPrice.toLocaleString('uk-UA', { maximumFractionDigits: 2 })} грн</span>
      </div>
    </div>
  </>;
}
