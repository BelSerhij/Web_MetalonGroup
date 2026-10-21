'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCartStore } from '@/store/cart-store';
import { useProductColor } from '@/components/catalog/ProductColorContext';
import { findCatalogColor } from '@/lib/catalog/colors';
import { formatMoney, roundMoney } from '@/lib/money';
import styles from './ProductConfigurator.module.css';

type Variant = { id: string; thickness: number; color: string; coating: string; paintingType: string; metalBrand: string; zincContent: number; price: number };
type Price = { metalBrand: string; thickness: number; coating: string; paintingType: string; price: number; pricePerMeter?: number };
type Product = {
  id: string; title: string; slug: string; image: string; unit: string; category: string;
  usefulWidth: number; fullWidth?: number; variants: Variant[]; manualUnitPrice?: number | null;
  availableMetalBrands?: string[]; availableThicknesses?: number[]; catalogPrices?: Price[];
};
type InitialSelection = { color?: string; thickness?: number; metalBrand?: string; coating?: string; paintingType?: string };
type SheetRow = { id: number; count: number; length: number };
type DimensionRow = { id: number; width: number; length: number };

const DEFAULT_THICKNESSES = [0.4, 0.45, 0.5, 0.6];
const FINISHES = [
  { value: 'Zinc', label: 'Оцинковане' },
  { value: 'Gloss', label: 'Глянець · РЕ' },
  { value: 'Matt', label: 'Матове · РЕМА' },
  { value: 'PEME', label: 'PEME' },
];

function finishKey(value: string) {
  const normalized = value.toLocaleLowerCase('uk-UA');
  if (/zinc|цинк|^zn$/.test(normalized)) return 'Zinc';
  if (/peme/.test(normalized)) return 'PEME';
  if (/matt|matte|мат|рема|pema/.test(normalized)) return 'Matt';
  if (/gloss|глян|\bpe\b|\bре\b/.test(normalized)) return 'Gloss';
  return value;
}

function manufacturerTier(brand: string) {
  if (/arcelor|uss steel/i.test(brand)) return 'Преміум';
  if (/polysteel|lowen|löwen|metipol/i.test(brand)) return 'Стандарт+';
  if (/коре|korea/i.test(brand)) return 'Стандарт';
  if (/в[єе]тнам|vietnam|модуль|module/i.test(brand)) return 'Економ';
  return 'Виробник';
}

export function ProductConfigurator({ product, initialSelection }: { product: Product; initialSelection?: InitialSelection }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const { color: selectedColor } = useProductColor();
  const variants = product.variants;
  const firstVariant = variants[0];
  const firstRate = product.catalogPrices?.[0];
  const initialThickness = initialSelection?.thickness ?? firstRate?.thickness ?? firstVariant?.thickness ?? DEFAULT_THICKNESSES[1];
  const initialCoating = finishKey(initialSelection?.coating ?? firstRate?.coating ?? firstVariant?.coating ?? 'Gloss');
  const [paintingType, setPaintingType] = useState(initialSelection?.paintingType ?? firstRate?.paintingType ?? firstVariant?.paintingType ?? 'OneSide');
  const [coating, setCoating] = useState(initialCoating);
  const [selectedThickness, setSelectedThickness] = useState(initialThickness);
  const [selectedMetalBrand, setSelectedMetalBrand] = useState(initialSelection?.metalBrand ?? firstRate?.metalBrand ?? firstVariant?.metalBrand ?? '');
  const [picketGapCm, setPicketGapCm] = useState(3);
  const [dimensionRows, setDimensionRows] = useState<DimensionRow[]>([
    product.slug === 'profnastyl-s10' || product.slug === 'shtahet-metalevyi'
      ? { id: 1, width: 18, length: 2 }
      : { id: 1, width: 8, length: 4 },
  ]);
  const [sheetRows, setSheetRows] = useState<SheetRow[]>([{ id: 1, count: 1, length: 1 }]);
  const [nextSheetId, setNextSheetId] = useState(2);
  const [nextDimensionId, setNextDimensionId] = useState(2);

  const isFenceCalculator = product.slug === 'profnastyl-s10';
  const isPicketCalculator = product.slug === 'shtahet-metalevyi';
  const isRoofSheetCalculator = ['profnastyl-t18', 'profnastyl-t45'].includes(product.slug) || product.category === 'Металочерепиця';
  const isAutoSheetCalculator = isFenceCalculator || isRoofSheetCalculator;
  const isDimensionCalculator = isAutoSheetCalculator || isPicketCalculator;
  const thicknesses = useMemo(() => product.availableThicknesses?.length
    ? [...new Set(product.availableThicknesses)].sort((a, b) => a - b)
    : [...new Set(variants.map((variant) => variant.thickness))].sort((a, b) => a - b), [variants, product.availableThicknesses]);
  const availableThicknesses = thicknesses.length ? thicknesses : DEFAULT_THICKNESSES;
  const priceRows = product.catalogPrices ?? [];
  const finishCombosByThickness = priceRows.filter((item) => item.thickness === selectedThickness).map((item) => ({ coating: finishKey(item.coating), paintingType: item.paintingType }));
  const fallbackFinishCombos = [
    { coating: 'Zinc', paintingType: 'OneSide' },
    { coating: 'Gloss', paintingType: 'OneSide' },
    { coating: 'Matt', paintingType: 'OneSide' },
    { coating: 'Gloss', paintingType: 'TwoSide' },
    { coating: 'Matt', paintingType: 'TwoSide' },
  ];
  const finishCombos = [...new Map((finishCombosByThickness.length ? finishCombosByThickness : fallbackFinishCombos)
    .map((item) => [JSON.stringify([item.coating, item.paintingType]), item])).values()];
  const selectedFinishKey = JSON.stringify([coating, paintingType]);
  const finishOptions = finishCombos.map((item) => {
    const coatingLabel = FINISHES.find((finish) => finish.value === item.coating)?.label ?? item.coating;
    const label = item.coating === 'Zinc' ? 'Оцинковка' : `${item.paintingType === 'OneSide' ? 'Одностороннє' : 'Двостороннє'} фарбування · ${coatingLabel.replace(' · РЕМА', '').replace(' · РЕ', '')}`;
    return { value: JSON.stringify([item.coating, item.paintingType]), label };
  });
  const finishOptionsKey = finishOptions.map((item) => item.value).join('|');
  const defaultFinishOption = finishOptions[0]?.value;
  const matchingPrices = priceRows.filter((item) => item.thickness === selectedThickness
    && finishKey(item.coating) === coating && item.paintingType === paintingType)
    .sort((a, b) => a.price - b.price || a.metalBrand.localeCompare(b.metalBrand, 'uk'));
  const selectedPrice = matchingPrices.find((item) => item.metalBrand === selectedMetalBrand);
  const metalBrands = [...new Set(matchingPrices.map((item) => item.metalBrand))];
  const metalBrandsKey = metalBrands.join('|');
  const availablePriceThicknesses = [...new Set(priceRows.map((item) => item.thickness))];
  const availablePriceThicknessesKey = availablePriceThicknesses.join('|');

  useEffect(() => {
    if (defaultFinishOption && !finishOptionsKey.split('|').includes(selectedFinishKey)) {
      const [nextCoating, nextPaintingType] = JSON.parse(defaultFinishOption) as [string, string];
      setCoating(nextCoating);
      setPaintingType(nextPaintingType);
    }
  }, [selectedFinishKey, finishOptionsKey, defaultFinishOption]);
  useEffect(() => {
    if (metalBrands.length && !metalBrands.includes(selectedMetalBrand)) setSelectedMetalBrand(metalBrands[0]);
  }, [selectedMetalBrand, metalBrandsKey]);
  useEffect(() => {
    if (availablePriceThicknesses.length && !availablePriceThicknesses.includes(selectedThickness)) setSelectedThickness(availablePriceThicknesses[0]);
  }, [selectedThickness, availablePriceThicknessesKey]);

  const effectiveRows: SheetRow[] = isDimensionCalculator
    ? dimensionRows.map((row) => ({
      id: row.id,
      count: isPicketCalculator
        ? Math.ceil(row.width / (0.11 + picketGapCm / 100))
        : Math.ceil(row.width / product.usefulWidth),
      length: row.length,
    }))
    : sheetRows;
  const totalItems = effectiveRows.reduce((sum, row) => sum + row.count, 0);
  const totalMeters = effectiveRows.reduce((sum, row) => sum + row.count * row.length, 0);
  const totalArea = totalMeters * product.usefulWidth;
  const unitPrice = selectedPrice?.price ?? product.manualUnitPrice ?? null;
  const billableQuantity = /м²|м2/i.test(product.unit) ? totalArea : totalMeters;
  const totalPrice = unitPrice === null || billableQuantity <= 0 ? null : roundMoney(unitPrice * billableQuantity);
  const selectedVariant = variants.find((variant) => {
    const colorMatches = variant.color === selectedColor || findCatalogColor(variant.color)?.code === selectedColor;
    return colorMatches && finishKey(variant.coating) === coating && variant.paintingType === paintingType
      && variant.thickness === selectedThickness && variant.metalBrand === selectedMetalBrand;
  });
  const handleAddToCart = () => {
    if (unitPrice === null || totalPrice === null) return;
    effectiveRows.forEach((row) => {
      if (row.count <= 0 || row.length <= 0) return;
      const meters = row.count * row.length;
      const area = meters * product.usefulWidth;
      const lineTotal = roundMoney(unitPrice * (/м²|м2/i.test(product.unit) ? area : meters));
      const options = { color: selectedColor, thickness: selectedThickness, metalBrand: selectedMetalBrand, coating, paintingType };
      const variantId = selectedVariant?.id;
      addToCart({
        id: product.id, ...(variantId ? { variantId } : {}),
        cartId: `${variantId ?? product.slug}:${row.length}:${JSON.stringify(options)}`,
        title: `${product.title} — ${selectedColor}, ${selectedThickness} мм, ${selectedMetalBrand}`,
        price: unitPrice, image: product.image, slug: product.slug, unit: product.unit,
        quantity: row.count, length: row.length, meters, area, total: lineTotal,
        category: product.category, usefulWidth: product.usefulWidth, fullWidth: product.fullWidth, options,
      });
    });
  };

  const updateSheetRow = (id: number, field: 'count' | 'length', value: number) => {
    setSheetRows((rows) => rows.map((row) => row.id === id ? { ...row, [field]: value } : row));
  };
  const updateDimensionRow = (id: number, field: 'width' | 'length', value: number) => {
    setDimensionRows((rows) => rows.map((row) => row.id === id ? { ...row, [field]: value } : row));
  };
  return (
    <section className={styles.calculator} aria-labelledby="product-calculator-title">
      <div className={styles.calculatorHeading}>
        <div>
          <h2 id="product-calculator-title">{isFenceCalculator ? 'Розрахунок паркану із С-10' : isPicketCalculator ? 'Розрахунок металевого штахету' : isRoofSheetCalculator ? `Розрахунок покрівлі із ${product.title}` : `Розрахунок · ${product.title}`}</h2>
          <p>Оберіть параметри — покажемо попередню вартість за актуальним прайсом.</p>
        </div>
      </div>

      <div className={styles.calculatorGrid}>
        <div className={styles.calculatorForm}>
          {isDimensionCalculator && <div className={styles.group}>
            <span className={styles.label}>{isPicketCalculator ? 'Розміри огорожі' : isFenceCalculator ? 'Розміри огорожі' : 'Розміри скату даху'}</span>
            <div className={styles.dimensionRows}>
              {dimensionRows.map((row, index) => <div className={`${styles.dimensionRow} ${isPicketCalculator ? styles.picketDimensionRow : ''}`} key={row.id}>
                <span className={styles.rowNumber}>{dimensionRows.length > 1 ? `${String(index + 1).padStart(2, '0')}` : ''}</span>
                <label><span>{isFenceCalculator || isPicketCalculator ? 'Довжина паркану, м' : 'Ширина скату, м'}</span><NumericInput min={0.1} value={row.width} onChange={(value) => updateDimensionRow(row.id, 'width', value)} /></label>
                <label><span>{isFenceCalculator ? 'Висота листа, м' : isPicketCalculator ? 'Висота штахетини, м' : 'Довжина листа, м'}</span><NumericInput min={0.1} value={row.length} onChange={(value) => updateDimensionRow(row.id, 'length', value)} /></label>
                {isPicketCalculator && index === 0 && <label><span>Просвіт, см</span><NumericInput min={0} value={picketGapCm} onChange={setPicketGapCm} /></label>}
                {isPicketCalculator && index > 0 && <span className={styles.dimensionSpacer} />}
                {dimensionRows.length > 1 && index > 0 && <button type="button" className={styles.removeRow} aria-label={`Прибрати розмір ${index + 1}`} onClick={() => setDimensionRows((rows) => rows.filter((item) => item.id !== row.id))}>×</button>}
              </div>)}
            </div>
            <div className={styles.sheetActions}>
              <button type="button" className={styles.addRow} onClick={() => { setDimensionRows((rows) => [...rows, { id: nextDimensionId, width: rows[rows.length - 1]?.width ?? 8, length: rows[rows.length - 1]?.length ?? 4 }]); setNextDimensionId((id) => id + 1); }}>+ Додати інший розмір</button>
            </div>
            <p className={styles.hint}>{isPicketCalculator ? 'Ширина штахетини — 11 см. Початковий просвіт між планками — 3 см; його можна змінити.' : `Кількість листів рахуємо за корисною шириною ${product.usefulWidth.toLocaleString('uk-UA')} м для кожного розміру окремо.`}</p>
          </div>}

          {!isDimensionCalculator && <div className={styles.group}>
            <span className={styles.label}>{product.category === 'Паркан' ? 'Кількість секцій і довжина' : 'Кількість листів і довжина'}</span>
            <div className={styles.sheetRows}>{sheetRows.map((row, index) => <div className={styles.sheetRow} key={row.id}>
              <span className={styles.rowNumber}>{String(index + 1).padStart(2, '0')}</span>
              <label><span>Кількість, шт.</span><NumericInput min={1} integer value={row.count} onChange={(value) => updateSheetRow(row.id, 'count', value)} /></label>
              <label><span>Довжина, м</span><NumericInput min={0.1} value={row.length} onChange={(value) => updateSheetRow(row.id, 'length', value)} /></label>
              {sheetRows.length > 1 && <button type="button" className={styles.removeRow} aria-label={`Прибрати рядок ${index + 1}`} onClick={() => setSheetRows((rows) => rows.filter((item) => item.id !== row.id))}>×</button>}
            </div>)}</div>
            <button type="button" className={styles.addRow} onClick={() => { setSheetRows((rows) => [...rows, { id: nextSheetId, count: 1, length: rows[rows.length - 1]?.length ?? 1 }]); setNextSheetId((id) => id + 1); }}>+ Додати інший розмір</button>
          </div>}

          <OptionGroup label="Тип покриття та фарбування" options={finishOptions} selected={selectedFinishKey} onSelect={(value) => {
            const [nextCoating, nextPaintingType] = JSON.parse(value) as [string, string];
            setCoating(nextCoating);
            setPaintingType(nextPaintingType);
          }} styles={styles} />
          <OptionGroup label="Товщина металу" options={availableThicknesses.map((thickness) => ({ value: String(thickness), label: `${thickness} мм` }))} selected={String(selectedThickness)} onSelect={(value) => setSelectedThickness(Number(value))} styles={styles} />
        </div>

        <div className={styles.pricePicker}>
          <div className={styles.priceHeading}><div><h3>Виробники та ціни з прайсу</h3><p>Варіанти, що відповідають обраним параметрам</p></div></div>
          {matchingPrices.length ? <div className={styles.priceList}>{matchingPrices.map((item) => <button type="button" key={`${item.metalBrand}:${item.price}`} className={`${styles.priceCard} ${selectedMetalBrand === item.metalBrand ? styles.priceCardActive : ''}`} onClick={() => setSelectedMetalBrand(item.metalBrand)} aria-pressed={selectedMetalBrand === item.metalBrand}>
            <span className={styles.tier}>{manufacturerTier(item.metalBrand)}</span><strong>{item.metalBrand}</strong><span className={styles.price}>{formatMoney(item.price)} грн/{product.unit}{item.pricePerMeter !== undefined && (product.category === 'Профнастил' || product.category === 'Металочерепиця') && <> <small>({formatMoney(item.pricePerMeter)} грн/м.п.)</small></>}</span>
          </button>)}</div> : <p className={styles.quoteNote}>Для цієї комбінації параметрів ціни ще не внесені до прайсу. Зверніться до менеджера.</p>}
        </div>

        <aside className={styles.summary} aria-live="polite">
          <span className={styles.summaryKicker}>ПОПЕРЕДНІЙ РОЗРАХУНОК</span>
          {isDimensionCalculator ? <>
            <SummaryRow label={isPicketCalculator ? 'Кількість штахетин' : 'Кількість листів'} value={`${totalItems} шт.`} />
            {effectiveRows.map((row, index) => <SummaryRow key={row.id} label={`${isPicketCalculator ? 'Штахетини' : 'Листи'} · розмір ${index + 1}`} value={`${row.count} шт. × ${row.length.toLocaleString('uk-UA')} м`} />)}
            {isPicketCalculator && <SummaryRow label="Просвіт між штахетинами" value={`${picketGapCm.toLocaleString('uk-UA')} см`} />}
            <SummaryRow label="Загальна довжина металу" value={`${totalMeters.toLocaleString('uk-UA', { maximumFractionDigits: 2 })} м.п.`} />
            {isRoofSheetCalculator && <SummaryRow label="Площа замовлення" value={`${totalArea.toLocaleString('uk-UA', { maximumFractionDigits: 2 })} м²`} />}
          </> : <SummaryRow label="Загальна довжина" value={`${totalMeters.toFixed(2)} м.п.`} />}
          <div className={styles.total}><span>Разом</span><strong>{totalPrice === null ? '—' : `${formatMoney(totalPrice)} грн`}</strong></div>
          <p className={styles.note}>Орієнтовно за прайсом. Остаточну ціну та наявність менеджер підтвердить перед оплатою.</p>
          {totalPrice !== null && <button type="button" onClick={handleAddToCart} className={styles.addButton}>Додати розрахунок у кошик</button>}
        </aside>
      </div>
    </section>
  );
}

function NumericInput({ value, min, integer = false, onChange }: { value: number; min: number; integer?: boolean; onChange: (value: number) => void }) {
  const [draft, setDraft] = useState(String(value));

  const normalize = (raw: string) => {
    const parsed = Number(raw.replace(',', '.'));
    const safeValue = Number.isFinite(parsed) ? Math.max(min, parsed) : min;
    return integer ? Math.max(1, Math.floor(safeValue)) : safeValue;
  };

  return <input
    type="text"
    inputMode={integer ? 'numeric' : 'decimal'}
    value={draft}
    onChange={(event) => {
      const raw = event.target.value;
      if (!/^\d*(?:[.,]\d*)?$/.test(raw)) return;
      setDraft(raw);
      if (!raw || /[.,]$/.test(raw)) return;
      const parsed = Number(raw.replace(',', '.'));
      if (Number.isFinite(parsed) && parsed >= min) onChange(integer ? Math.floor(parsed) : parsed);
    }}
    onBlur={() => {
      const normalized = normalize(draft);
      setDraft(String(normalized));
      onChange(normalized);
    }}
  />;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className={styles.summaryRow}><span>{label}</span><b>{value}</b></div>;
}

function OptionGroup({ label, options, selected, onSelect, styles }: {
  label: string; options: Array<{ value: string; label: string }>; selected: string;
  onSelect: (value: string) => void; styles: Record<string, string>;
}) {
  return <div className={styles.group}><span className={styles.label}>{label}</span><div className={styles.options}>
    {options.map((option) => <button type="button" key={option.value} onClick={() => onSelect(option.value)} aria-pressed={selected === option.value}
      className={`${styles.option} ${selected === option.value ? styles.optionActive : ''}`}>{option.label}</button>)}
    {!options.length && <span className={styles.quoteNote}>Параметри узгоджуються під час замовлення.</span>}
  </div></div>;
}
