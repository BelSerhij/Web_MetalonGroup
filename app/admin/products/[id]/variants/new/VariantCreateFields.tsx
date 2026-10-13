'use client';

import { useMemo, useState } from 'react';

type Props = {
  manufacturers: string[];
  zincByManufacturer: Record<string, number>;
  defaultManufacturer?: string;
  defaultMarkupPercent: number;
};

export function VariantCreateFields({ manufacturers, zincByManufacturer, defaultManufacturer = '', defaultMarkupPercent }: Props) {
  const [manufacturer, setManufacturer] = useState(defaultManufacturer);
  const [purchasePrice, setPurchasePrice] = useState('');
  const [markupType, setMarkupType] = useState('PERCENT');
  const [markupValue, setMarkupValue] = useState(String(defaultMarkupPercent));
  const zincContent = zincByManufacturer[manufacturer] ?? '';
  const salePrice = useMemo(() => {
    const purchase = Number(purchasePrice);
    const markup = Number(markupValue);
    if (purchasePrice === '' || markupValue === '' || !Number.isFinite(purchase) || !Number.isFinite(markup) || purchase < 0) return '';
    const value = markupType === 'FIXED' ? purchase + markup : purchase * (1 + markup / 100);
    return value >= 0 ? value.toFixed(2) : '';
  }, [purchasePrice, markupType, markupValue]);

  return <>
    <div className="admin-form-group">
      <label htmlFor="metalBrand">Виробник металу</label>
      <select id="metalBrand" name="metalBrand" required value={manufacturer} onChange={(event) => setManufacturer(event.target.value)}>
        <option value="">Оберіть виробника</option>
        {defaultManufacturer && !manufacturers.includes(defaultManufacturer) && <option value={defaultManufacturer}>{defaultManufacturer}</option>}
        {manufacturers.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
      </select>
    </div>

    <div className="admin-form-group">
      <label htmlFor="zincContent">Вміст цинку, г/м²</label>
      <input id="zincContent" name="zincContent" type="number" value={zincContent} readOnly required placeholder="Автоматично за виробником" />
      <small>Значення підтягується з варіантів цього виробника.</small>
    </div>

    <div className="admin-form-group">
      <label htmlFor="purchasePrice">Закупівельна ціна, грн</label>
      <input id="purchasePrice" name="purchasePrice" type="number" min="0" step="0.01" required value={purchasePrice} onChange={(event) => setPurchasePrice(event.target.value)} placeholder="Введіть закупівельну ціну" />
    </div>

    <div className="admin-form-group">
      <label htmlFor="markupType">Тип націнки</label>
      <select id="markupType" name="markupType" value={markupType} onChange={(event) => setMarkupType(event.target.value)}>
        <option value="PERCENT">Відсоток</option>
        <option value="FIXED">Сума, грн</option>
      </select>
    </div>

    <div className="admin-form-group">
      <label htmlFor="markupValue">Націнка {markupType === 'FIXED' ? ', грн' : ', %'}</label>
      <input id="markupValue" name="markupValue" type="number" step="0.01" required value={markupValue} onChange={(event) => setMarkupValue(event.target.value)} />
    </div>

    <div className="admin-form-group">
      <label htmlFor="price">Ціна продажу, грн</label>
      <input id="price" name="price" type="number" step="0.01" value={salePrice} readOnly required placeholder="Розрахується автоматично" />
      <small>Закупівельна ціна + націнка.</small>
    </div>
  </>;
}
