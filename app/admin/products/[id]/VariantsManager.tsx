'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { CATALOG_COLORS, findCatalogColor } from '@/lib/catalog/colors';
import { deleteProductVariant, toggleVariantVisibility } from '@/app/admin/products/actions';
import styles from './VariantsManager.module.css';

type Variant = {
  id: string;
  thickness: number;
  color: string;
  coating: string;
  paintingType: string;
  metalBrand: string;
  zincContent: number;
  price: number;
  purchasePrice: number | null;
  markupType: string;
  markupValue: number | null;
  isVisible: boolean;
};

function finishKey(value: string) {
  if (/matt|matte|мат|рема|pema/i.test(value)) return 'Matt';
  if (/zinc|цинк|^zn$/i.test(value)) return 'Zinc';
  return 'Gloss';
}

function ColorSwatch({ code }: { code: string }) {
  const catalogColor = findCatalogColor(code);
  return <span
    className={`${styles.colorSwatch} ${!catalogColor ? styles.colorSwatchUnknown : ''}`}
    style={catalogColor ? { backgroundColor: catalogColor.hex } : undefined}
    aria-hidden="true"
  />;
}

export function VariantsManager({ productId, productSlug, variants, siteManufacturers, siteThicknesses }: {
  productId: string;
  productSlug: string;
  variants: Variant[];
  siteManufacturers: string[];
  siteThicknesses: number[];
}) {
  const [manufacturer, setManufacturer] = useState('');
  const [thickness, setThickness] = useState('');
  const [color, setColor] = useState('');

  const manufacturers = useMemo(() => [...new Set([...siteManufacturers, ...variants.map((variant) => variant.metalBrand)])].sort((a, b) => a.localeCompare(b, 'uk')), [variants, siteManufacturers]);
  const thicknesses = useMemo(() => [...new Set([...siteThicknesses, ...variants.filter((variant) => variant.metalBrand === manufacturer).map((variant) => variant.thickness)])].sort((a, b) => a - b), [variants, manufacturer, siteThicknesses]);
  // The website configurator exposes the complete catalog palette regardless of stock.
  const colorOptions = useMemo(() => {
    const extraColors = [...new Set(variants.map((variant) => findCatalogColor(variant.color)?.code ?? variant.color))]
      .filter((value) => !CATALOG_COLORS.some((item) => item.code === value))
      .sort((a, b) => a.localeCompare(b, 'uk'));
    return [...CATALOG_COLORS.map((item) => item.code), ...extraColors];
  }, [variants]);

  const filteredVariants = useMemo(() => variants.filter((variant) =>
    (!manufacturer || variant.metalBrand === manufacturer)
    && (!thickness || variant.thickness === Number(thickness))
    && (!color || (findCatalogColor(variant.color)?.code ?? variant.color) === color),
  ).sort((a, b) => a.metalBrand.localeCompare(b.metalBrand, 'uk') || a.thickness - b.thickness || (findCatalogColor(a.color)?.code ?? a.color).localeCompare(findCatalogColor(b.color)?.code ?? b.color, 'uk') || a.coating.localeCompare(b.coating, 'uk') || a.paintingType.localeCompare(b.paintingType, 'uk')), [variants, manufacturer, thickness, color]);

  const selectedColor = colorOptions.find((item) => item === color);
  const selectedCatalogColor = CATALOG_COLORS.find((item) => item.code === color);
  const selectionComplete = Boolean(manufacturer && thickness && color);
  const selectedFinishOptions = selectedCatalogColor?.finishes ?? ['Gloss' as const];
  const selectedCombinations = selectionComplete ? selectedFinishOptions.flatMap((finish) => ['OneSide', 'TwoSide'].map((paintingType) => {
    const combinationVariants = filteredVariants.filter((variant) => finishKey(variant.coating) === finish && variant.paintingType === paintingType);
    const params = new URLSearchParams({ color, thickness, metalBrand: manufacturer, coating: finish, paintingType });
    return { finish, paintingType, variants: combinationVariants, addHref: `/admin/products/${productId}/variants/new?${params.toString()}`, previewHref: `/catalog/${productSlug}?${params.toString()}` };
  })) : [];

  return (
    <div className={styles.manager}>
      <div className={styles.filters}>
        <label>
          <span>1. Виробник</span>
          <select value={manufacturer} onChange={(event) => { setManufacturer(event.target.value); setThickness(''); setColor(''); }}>
            <option value="">Оберіть виробника</option>
            {manufacturers.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>2. Товщина</span>
          <select value={thickness} disabled={!manufacturer} onChange={(event) => { setThickness(event.target.value); setColor(''); }}>
            <option value="">{manufacturer ? 'Оберіть товщину' : 'Спочатку виробника'}</option>
            {thicknesses.map((item) => <option key={item} value={item}>{item} мм</option>)}
          </select>
        </label>
        {(manufacturer || thickness || color) && <button type="button" className={styles.reset} onClick={() => { setManufacturer(''); setThickness(''); setColor(''); }}>Скинути вибір</button>}
      </div>

      <section className={`${styles.colorPicker} ${!thickness ? styles.colorPickerDisabled : ''}`} aria-label="Оберіть колір">
        <div className={styles.pickerHeading}><strong>3. Колір</strong><span>{thickness ? 'Доступні кольори каталогу' : 'Спочатку оберіть виробника й товщину'}</span></div>
        <div className={styles.colorGrid}>
          {colorOptions.map((item) => {
            const colorInfo = findCatalogColor(item);
            const count = variants.filter((variant) => variant.metalBrand === manufacturer && variant.thickness === Number(thickness) && (findCatalogColor(variant.color)?.code ?? variant.color) === item).length;
            return <button key={item} type="button" disabled={!thickness} onClick={() => setColor(item)} aria-pressed={color === item} className={`${styles.colorOption} ${color === item ? styles.colorOptionActive : ''}`}>
              <ColorSwatch code={item} />
              <span className={styles.colorOptionText}><strong>{item}</strong><small>{colorInfo?.name ?? item}</small></span>
              {count > 0 && <span className={styles.colorCount}>{count}</span>}
            </button>;
          })}
        </div>
      </section>

      <div className={styles.resultHeading}>
        <div>{selectionComplete ? <>Асортимент: <strong>{selectedColor}</strong> · {selectedFinishOptions.length} типи покриття</> : 'Оберіть параметри, щоб переглянути асортимент'}</div>
      </div>

      <div className={styles.list}>
        {selectionComplete && selectedCombinations.map((combination) => (
          <section key={`${combination.finish}-${combination.paintingType}`} className={styles.combination}>
            <div className={styles.combinationHeading}>
              <div><strong>{combination.finish === 'Matt' ? 'Матове · РЕМА' : 'Глянець · РЕ'}</strong><span>{combination.paintingType === 'OneSide' ? 'Одностороннє фарбування' : 'Двостороннє фарбування'}</span></div>
              <div className={styles.combinationActions}>
                <Link href={combination.previewHref} className={styles.previewLink} aria-label={`Переглянути ${selectedColor}, ${combination.finish === 'Matt' ? 'матове покриття' : 'глянцеве покриття'} на сайті`} title="Переглянути на сайті"><Eye size={16} /><span>Переглянути</span></Link>
                {!combination.variants.length && <Link href={combination.addHref} className={styles.addPrice}>Додати ціну</Link>}
              </div>
            </div>
            {combination.variants.length ? combination.variants.map((variant) => (
          <article key={variant.id} className={`${styles.variant} ${!variant.isVisible ? styles.hidden : ''}`}>
            <div className={styles.variantMain}>
              <div className={styles.variantTitle}>
                <ColorSwatch code={variant.color} />
                <strong>{variant.metalBrand}</strong>
                <span>{variant.thickness} мм · {findCatalogColor(variant.color)?.code ?? variant.color}</span>
              </div>
              <div className={styles.variantMeta}>
                <span>{variant.coating === 'Matt' || /мат|рема|pema/i.test(variant.coating) ? 'Матове · РЕМА' : variant.coating === 'Zinc' ? 'Оцинковане' : 'Глянець · РЕ'}</span>
                <span>{variant.paintingType === 'TwoSide' ? 'Двостороннє' : 'Одностороннє'}</span>
                <span>{variant.zincContent} г/м² цинку</span>
              </div>
            </div>
            <div className={styles.priceBlock}>
              <strong>{variant.price.toLocaleString('uk-UA')} грн</strong>
              <span>Закупівля: {variant.purchasePrice === null ? 'не задана' : `${variant.purchasePrice.toLocaleString('uk-UA')} грн`}</span>
              {variant.markupValue !== null && <span className={variant.markupValue < 0 ? styles.discount : styles.markup}>{variant.markupValue > 0 ? '+' : ''}{variant.markupValue.toLocaleString('uk-UA')}{variant.markupType === 'FIXED' ? ' грн' : '%'}</span>}
            </div>
            <span className={variant.isVisible ? styles.published : styles.unpublished}>{variant.isVisible ? 'На сайті' : 'Приховано'}</span>
            <div className={styles.actions}>
              <Link href={`/admin/products/${productId}/variants/${variant.id}`} className={styles.iconButton} aria-label="Редагувати"><Pencil size={17} /></Link>
              <form action={toggleVariantVisibility.bind(null, productId, variant.id, !variant.isVisible)}><button className={styles.iconButton} type="submit">{variant.isVisible ? 'Сховати' : 'Показати'}</button></form>
              <form action={deleteProductVariant.bind(null, productId, variant.id)}><button className={`${styles.iconButton} ${styles.delete}`} type="submit" aria-label="Видалити"><Trash2 size={17} /></button></form>
            </div>
          </article>
            )) : <p className={styles.missingPrice}>Варіант є в асортименті сайту, ціна ще не задана. Додайте закупівлю та націнку, щоб показати ціну покупцям.</p>}
          </section>
        ))}

        {!selectionComplete && <div className={styles.empty}>
          <strong>Оберіть виробника, товщину та колір</strong><span>В асортименті з’являться всі відповідні варіанти, незалежно від залишків на складі.</span>
        </div>}
      </div>
    </div>
  );
}
