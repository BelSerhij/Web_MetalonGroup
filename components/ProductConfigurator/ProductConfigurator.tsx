'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCartStore } from '@/store/cart-store';
import { useProductColor } from '@/components/catalog/ProductColorContext';
import { CATALOG_COLORS, findCatalogColor } from '@/lib/catalog/colors';
import { formatMoney, roundMoney } from '@/lib/money';
import styles from './ProductConfigurator.module.css';

type Variant = {
  id: string; thickness: number; color: string; coating: string; paintingType: string;
  metalBrand: string; zincContent: number; price: number;
};
type Product = {
  id: string; title: string; slug: string; image: string; unit: string;
  category: string; usefulWidth: number; fullWidth?: number; variants: Variant[]; manualUnitPrice?: number | null;
  availableMetalBrands?: string[]; availableThicknesses?: number[];
  catalogPrices?: Array<{ metalBrand: string; thickness: number; coating: string; paintingType: string; price: number }>;
};
type InitialSelection = { color?: string; thickness?: number; metalBrand?: string; coating?: string; paintingType?: string };

const DEFAULT_THICKNESSES = [0.4, 0.45, 0.5, 0.6];
const PAINTING_TYPES = [
  { value: 'OneSide', label: 'Одностороннє' },
  { value: 'TwoSide', label: 'Двостороннє' },
];
const FINISHES = [
  { value: 'Gloss', label: 'Глянець · РЕ' },
  { value: 'Matt', label: 'Матове · РЕМА' },
  { value: 'PEME', label: 'PEME' },
];

function finishKey(value: string) {
  const normalized = value.toLocaleLowerCase('uk-UA');
  if (/peme/.test(normalized)) return 'PEME';
  if (/matt|matte|мат|рема|pema/.test(normalized)) return 'Matt';
  if (/gloss|глян|\bpe\b|\bре\b/.test(normalized)) return 'Gloss';
  return value;
}

export function ProductConfigurator({ product, initialSelection }: { product: Product; initialSelection?: InitialSelection }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const { setColor: setPreviewColor } = useProductColor();
  const variants = product.variants;
  const initial = variants[0];
  const defaultPrice = product.catalogPrices?.[0];
  const initialColor = findCatalogColor(initial?.color ?? '')?.code ?? initial?.color ?? 'RAL 3005';
  const initialFinish = defaultPrice ? finishKey(defaultPrice.coating) : initial ? finishKey(initial.coating) : 'Gloss';
  const initialColorFinish = findCatalogColor(initialColor)?.finishes.includes(initialFinish as 'Gloss' | 'Matt')
    ? initialFinish
    : findCatalogColor(initialColor)?.finishes[0] ?? 'Gloss';
  const [selectedColor, setSelectedColor] = useState(initialSelection?.color ?? initialColor);
  const [paintingType, setPaintingType] = useState(initialSelection?.paintingType ?? defaultPrice?.paintingType ?? initial?.paintingType ?? 'OneSide');
  const [coating, setCoating] = useState(initialSelection?.coating ?? defaultPrice?.coating ?? initialColorFinish);
  const [selectedThickness, setSelectedThickness] = useState(initialSelection?.thickness ?? defaultPrice?.thickness ?? initial?.thickness ?? DEFAULT_THICKNESSES[1]);
  const defaultBrand = product.availableMetalBrands?.includes(initial?.metalBrand ?? '') ? initial?.metalBrand : defaultPrice?.metalBrand ?? product.availableMetalBrands?.[0] ?? initial?.metalBrand ?? '';
  const [selectedMetalBrand, setSelectedMetalBrand] = useState(initialSelection?.metalBrand ?? defaultBrand);
  useEffect(() => setPreviewColor(selectedColor), [selectedColor, setPreviewColor]);
  const [sheetRows, setSheetRows] = useState([{ id: 1, count: 1, length: 1 }]);
  const [nextSheetId, setNextSheetId] = useState(2);

  const thicknesses = useMemo(() => product.availableThicknesses?.length ? [...new Set(product.availableThicknesses)].sort((a, b) => a - b) : [...new Set(variants.map((v) => v.thickness))].sort((a, b) => a - b), [variants, product.availableThicknesses]);
  const metalBrands = useMemo(() => product.availableMetalBrands?.length ? [...new Set(product.availableMetalBrands)].sort((a, b) => a.localeCompare(b, 'uk')) : [...new Set(variants.map((v) => v.metalBrand))].sort((a, b) => a.localeCompare(b, 'uk')), [variants, product.availableMetalBrands]);
  const availableThicknesses = thicknesses.length ? thicknesses : DEFAULT_THICKNESSES;
  const colors = CATALOG_COLORS;
  const selectedVariant = variants.find((variant) => {
    const colorMatches = variant.color === selectedColor || findCatalogColor(variant.color)?.code === selectedColor;
    const finishMatches = finishKey(variant.coating) === coating;
    return colorMatches && finishMatches && variant.paintingType === paintingType
      && variant.thickness === selectedThickness && variant.metalBrand === selectedMetalBrand;
  });
  const catalogPrice = product.catalogPrices?.find((item) => item.metalBrand === selectedMetalBrand
    && item.thickness === selectedThickness && finishKey(item.coating) === coating && item.paintingType === paintingType)?.price;

  const totalMeters = sheetRows.reduce((sum, row) => sum + row.count * row.length, 0);
  const totalArea = totalMeters * product.usefulWidth;
  const unitPrice = catalogPrice ?? product.manualUnitPrice ?? null;
  const totalPrice = unitPrice === null ? null : roundMoney(unitPrice * (product.unit === 'м²' ? totalArea : totalMeters));
  const dimensions = sheetRows.map((row) => `${row.count} шт. × ${row.length} м`).join('; ');
  const availableFinishes = product.catalogPrices?.filter((item) => item.metalBrand === selectedMetalBrand && item.thickness === selectedThickness && item.paintingType === paintingType).map((item) => finishKey(item.coating));
  const coatingOptions = availableFinishes?.length
    ? [...new Set(availableFinishes)].map((value) => FINISHES.find((finish) => finish.value === value) ?? { value, label: value })
    : FINISHES.filter((finish) => finish.value !== 'PEME' && Boolean(findCatalogColor(selectedColor)?.finishes.includes(finish.value as 'Gloss' | 'Matt')));
  const quoteHref = `mailto:metalongroup@gmail.com?subject=${encodeURIComponent(`Запит ціни: ${product.title}`)}&body=${encodeURIComponent(`Прошу уточнити ціну та термін виготовлення.\nТовар: ${product.title}\nКолір: ${selectedColor} — ${findCatalogColor(selectedColor)?.name ?? ''}\nФарбування: ${paintingType === 'OneSide' ? 'одностороннє' : 'двостороннє'}\nПокриття: ${coating === 'Matt' ? 'матове РЕМА' : 'глянцеве РЕ'}\nТовщина: ${selectedThickness} мм\nВиробник металу: ${selectedMetalBrand}\nРозміри: ${dimensions}`)}`;

  const handleAddToCart = () => {
    if (unitPrice === null) return;
    sheetRows.forEach((row) => {
      const meters = row.count * row.length;
      const area = meters * product.usefulWidth;
      const total = roundMoney(unitPrice! * (product.unit === 'м²' ? area : meters));
      const options = { color: selectedColor, thickness: selectedThickness, metalBrand: selectedMetalBrand, coating, paintingType };
      const variantId = selectedVariant?.id;
      addToCart({
        id: product.id, ...(variantId ? { variantId } : {}),
        cartId: `${variantId ?? product.slug}:${row.length}:${JSON.stringify(options)}`,
        title: `${product.title} — ${selectedColor}, ${selectedThickness} мм, ${selectedMetalBrand}`,
        price: unitPrice!, image: product.image, slug: product.slug, unit: product.unit,
        quantity: row.count, length: row.length, meters, area, total,
        category: product.category, usefulWidth: product.usefulWidth, fullWidth: product.fullWidth, options,
      });
    });
  };

  const updateSheetRow = (id: number, field: 'count' | 'length', value: number) => {
    setSheetRows((rows) => rows.map((row) => row.id === id ? { ...row, [field]: value } : row));
  };

  return (
    <div className={styles.configurator}>
      <h3 className={styles.title}>Оберіть параметри</h3>

      <div className={styles.group}>
        <span className={styles.label}>Колір</span>
        <div className={styles.colorGrid}>
          {colors.map((color) => (
            <button key={color.code} type="button" onClick={() => { setSelectedColor(color.code); setPreviewColor(color.code); if (!color.finishes.includes(coating === 'Matt' ? 'Matt' : 'Gloss')) setCoating(color.finishes[0] ?? 'Gloss'); }}
              className={`${styles.colorCard} ${selectedColor === color.code ? styles.colorCardActive : ''}`}
              aria-pressed={selectedColor === color.code} aria-label={`${color.code}, ${color.name}`}>
              <span className={styles.colorPreview} style={{ backgroundColor: color.hex }} />
              <span className={styles.colorInfo}><span className={styles.colorCode}>{color.code}</span><span className={styles.colorName}>{color.name}</span></span>
            </button>
          ))}
        </div>
      </div>

      <OptionGroup label="Тип фарбування" options={PAINTING_TYPES} selected={paintingType} onSelect={setPaintingType} styles={styles} />
      <OptionGroup label="Тип поверхні" options={coatingOptions} selected={finishKey(coating)} onSelect={setCoating} styles={styles} />
      <OptionGroup label="Товщина металу" options={availableThicknesses.map((thickness) => ({ value: String(thickness), label: `${thickness} мм` }))} selected={String(selectedThickness)} onSelect={(value) => setSelectedThickness(Number(value))} styles={styles} />
      <OptionGroup label="Виробник металу" options={metalBrands.map((brand) => ({ value: brand, label: brand }))} selected={selectedMetalBrand} onSelect={setSelectedMetalBrand} styles={styles} />

      <div className={styles.group}>
        <span className={styles.label}>{product.category === 'Паркан' ? 'Кількість секцій і довжина' : 'Кількість листів і довжина'}</span>
        <div className={styles.sheetRows}>
          {sheetRows.map((row, index) => <div className={styles.sheetRow} key={row.id}>
            <span className={styles.rowNumber}>{String(index + 1).padStart(2, '0')}</span>
            <label><span>Кількість, шт.</span><input type="number" min="1" step="1" value={row.count} onChange={(event) => updateSheetRow(row.id, 'count', Math.max(1, Math.floor(Number(event.target.value) || 1)))} /></label>
            <label><span>Довжина, м</span><input type="number" min="0.1" step="0.01" value={row.length} onChange={(event) => updateSheetRow(row.id, 'length', Math.max(0.1, Number(event.target.value) || 0.1))} /></label>
            {sheetRows.length > 1 && <button type="button" className={styles.removeRow} aria-label={`Прибрати рядок ${index + 1}`} onClick={() => setSheetRows((rows) => rows.filter((item) => item.id !== row.id))}>×</button>}
          </div>)}
        </div>
        <button type="button" className={styles.addRow} onClick={() => { setSheetRows((rows) => [...rows, { id: nextSheetId, count: 1, length: rows[rows.length - 1]?.length ?? 1 }]); setNextSheetId((id) => id + 1); }}>+ Додати іншу довжину</button>
        <span className={styles.calculation}>Разом: {totalMeters.toFixed(2)} м.п. · {totalArea.toFixed(2)} м²</span>
      </div>

      {totalPrice !== null ? <div className={styles.total}><span className={styles.totalLabel}>Разом:</span><span className={styles.totalPrice}>{formatMoney(totalPrice)} грн</span></div> : <p className={styles.quoteNote}>Ціну для цієї комбінації уточнюйте телефоном.</p>}
      {totalPrice !== null && <button type="button" onClick={handleAddToCart} className={styles.addButton}>Додати в кошик</button>}
      <a href={quoteHref} className={`${styles.addButton} ${styles.quoteButton}`}>Уточнити вартість</a>
    </div>
  );
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
