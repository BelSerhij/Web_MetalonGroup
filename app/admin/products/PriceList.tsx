'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition, type FormEvent } from 'react';
import { Check, Pencil, X } from 'lucide-react';
import { setGroupedVariantPrice } from './actions';
import styles from './PriceList.module.css';

type PriceVariant = { id: string; metalBrand: string; thickness: number; coating: string; paintingType: string; color: string; pricePerMeter: number };
type PriceProduct = { id: string | null; slug: string; title: string; category: string; unit: string; fullWidth: number | null; usefulWidth: number | null; isVisible: boolean; variants: PriceVariant[] };
type PriceGroup = { key: string; profileKey: string; metalBrand: string; label: string; sourceBrands: string[]; thickness: number; coating: string; sourceCoatings: string[]; coatingLabel: string; paintingType: string };
type Rate = { metalBrand: string; thickness: number; coating: string; paintingType: string; pricePerMeter: number };

const finishes = {
  PEMA: { canonical: 'Matt', match: /^(matt|pema|rema)$/i },
  PE: { canonical: 'Gloss', match: /^(gloss|pe)$/i },
  PEME: { canonical: 'PEME', match: /^peme$/i },
  Zinc: { canonical: 'Zinc', match: /^(zinc|цинк|zn)$/i },
} as const;
type Finish = keyof typeof finishes;
type Profile = { key: string; label: string; matches: RegExp; thicknesses: number[]; combinations: { finish: Finish; painting: 'OneSide' | 'TwoSide' }[] };
const oneSide: Profile['combinations'] = [{ finish: 'PEMA', painting: 'OneSide' }];
const profiles: Profile[] = [
  { key: 'arcelor-de', label: 'ArcelorMittal · Німеччина', matches: /arcelor.*(німеч|german|germany)/i, thicknesses: [.5], combinations: oneSide },
  { key: 'arcelor-pl-peme', label: 'ArcelorMittal · Польща', matches: /arcelor.*(поль|poland|polska)/i, thicknesses: [.5], combinations: [{ finish: 'PEME', painting: 'OneSide' }] },
  { key: 'arcelor-pl-pe', label: 'ArcelorMittal · Польща', matches: /arcelor.*(поль|poland|polska)/i, thicknesses: [.5], combinations: [{ finish: 'PE', painting: 'OneSide' }] },
  { key: 'uss', label: 'USS Steel · Словаччина', matches: /u\.?\s*s\.?\s*steel|uss steel/i, thicknesses: [.45], combinations: [{ finish: 'PEMA', painting: 'OneSide' }, { finish: 'PE', painting: 'OneSide' }] },
  { key: 'polysteel-alliance', label: 'Polysteel · Lowen Stahl · Metipol', matches: /polysteel|lowen|löwen|metipol/i, thicknesses: [.4, .45], combinations: (['PEMA', 'PE'] as Finish[]).flatMap((finish) => (['OneSide', 'TwoSide'] as const).map((painting) => ({ finish, painting }))) },
  { key: 'vietnam', label: 'Вʼєтнам', matches: /в[єе]тнам|vietnam/i, thicknesses: [.45], combinations: oneSide },
  { key: 'korea', label: 'Корея', matches: /коре|korea|korean/i, thicknesses: [.4], combinations: [{ finish: 'PEMA', painting: 'OneSide' }, { finish: 'PEMA', painting: 'TwoSide' }] },
  { key: 'module-zinc', label: 'Модуль · оцинковка', matches: /модуль|module/i, thicknesses: [.4, .45, .5, .8], combinations: [{ finish: 'Zinc', painting: 'OneSide' }] },
];
function tintIndex(profileKey: string) {
  if (profileKey.startsWith('arcelor-de')) return 0;
  if (profileKey.startsWith('arcelor-pl')) return 1;
  if (profileKey === 'uss') return 2;
  if (profileKey === 'polysteel-alliance') return 3;
  if (profileKey === 'vietnam') return 4;
  if (profileKey === 'korea') return 5;
  return 6;
}

function paintingLabel(value: string) { return value === 'TwoSide' ? '2 стор.' : '1 стор.'; }
function groupKey(profileKey: string, thickness: number, coating: string, paintingType: string) { return JSON.stringify([profileKey, thickness, coating, paintingType]); }
function formatPrice(value: number) { return value.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function isSquareMeter(unit: string) { return /м²|м2/i.test(unit); }
function valuesFrom<T>(items: T[], selector: (item: T) => string) { return [...new Set(items.map(selector))]; }

export function PriceList({ products, rates }: { products: PriceProduct[]; rates: Rate[] }) {
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [editingKey, setEditingKey] = useState('');
  const [editingRate, setEditingRate] = useState('');
  const [savedRates, setSavedRates] = useState<Record<string, number>>({});
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const categories = useMemo(() => [...new Set(products.map((product) => product.category))].sort((a, b) => a.localeCompare(b, 'uk')), [products]);
  const knownBrands = useMemo(() => valuesFrom([...rates, ...products.flatMap((product) => product.variants)], (item) => item.metalBrand), [products, rates]);
  const knownCoatings = useMemo(() => valuesFrom([...rates, ...products.flatMap((product) => product.variants)], (item) => item.coating), [products, rates]);
  const groups = useMemo(() => profiles.flatMap((profile) => {
    const sourceBrands = [...new Set([profile.label, ...knownBrands.filter((brand) => profile.matches.test(brand))])];
    return profile.thicknesses.flatMap((thickness) => profile.combinations.map(({ finish, painting }) => {
      const finishInfo = finishes[finish];
      const sourceCoatings = [...new Set([finishInfo.canonical, ...knownCoatings.filter((coating) => finishInfo.match.test(coating))])];
      const key = groupKey(profile.key, thickness, finishInfo.canonical, painting);
      return { key, profileKey: profile.key, metalBrand: profile.label, label: profile.label, sourceBrands, thickness, coating: finishInfo.canonical, sourceCoatings, coatingLabel: finish, paintingType: painting } satisfies PriceGroup;
    }));
  }), [knownBrands, knownCoatings]);
  const shownGroups = groups.filter((group) => !brandFilter || group.profileKey === brandFilter);
  const shownProducts = products.filter((product) => !categoryFilter || product.category === categoryFilter);
  const groupedColumns = profiles.filter((profile) => !brandFilter || profile.key === brandFilter).map((profile) => ({ profile, columns: shownGroups.filter((group) => group.profileKey === profile.key) })).filter(({ columns }) => columns.length);
  const columnCount = 2 + Math.max(shownGroups.length, 1);

  function rateFor(group: PriceGroup) {
    const override = savedRates[group.key];
    if (override !== undefined) return override;
    const matchingRates = rates.filter((rate) => group.sourceBrands.includes(rate.metalBrand) && rate.thickness === group.thickness && group.sourceCoatings.includes(rate.coating) && rate.paintingType === group.paintingType);
    if (matchingRates.length) return matchingRates[0].pricePerMeter;
    const historic = products.flatMap((product) => product.variants.filter((variant) => group.sourceBrands.includes(variant.metalBrand) && variant.thickness === group.thickness && group.sourceCoatings.includes(variant.coating) && variant.paintingType === group.paintingType).map((variant) => variant.pricePerMeter)).sort((a, b) => a - b);
    if (!historic.length) return null;
    const middle = Math.floor(historic.length / 2);
    return historic.length % 2 ? historic[middle] : (historic[middle - 1] + historic[middle]) / 2;
  }

  function beginEdit(editorKey: string, group: PriceGroup) {
    const rate = rateFor(group);
    setEditingKey(editorKey);
    setEditingRate(rate === null ? '' : String(rate));
    setError('');
  }

  function saveEdit(event: FormEvent<HTMLFormElement>, group: PriceGroup) {
    event.preventDefault();
    const pricePerMeter = Number(editingRate);
    if (editingRate === '' || !Number.isFinite(pricePerMeter) || pricePerMeter < 0) {
      setError('Введіть коректну ціну за погонний метр, не меншу за нуль.');
      return;
    }
    setError('');
    startTransition(async () => {
      try {
        await setGroupedVariantPrice(group.metalBrand, group.sourceBrands, group.thickness, group.coating, group.sourceCoatings, group.paintingType, pricePerMeter);
        setSavedRates((current) => ({ ...current, [group.key]: pricePerMeter }));
        setEditingKey('');
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Не вдалося зберегти ціну.');
      }
    });
  }

  return <div className={styles.priceList}>
    <div className={styles.toolbar}>
      <div><strong>Прайс-лист товарів</strong><span>Ціни показані лише для обраних виробників. За м² рахується за повною шириною листа.</span></div>
      <div className={styles.filters}>
        <label><span>Категорія</span><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="">Усі категорії</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
        <label><span>Виробник</span><select value={brandFilter} onChange={(event) => setBrandFilter(event.target.value)}><option value="">Усі виробники</option>{profiles.map((profile) => <option key={profile.key} value={profile.key}>{profile.label}{profile.key === 'arcelor-pl-peme' ? ' · PEME' : profile.key === 'arcelor-pl-pe' ? ' · PE' : ''}</option>)}</select></label>
      </div>
    </div>
    {error && <p className={styles.error} role="alert">{error}</p>}
    <div className={styles.tableScroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th rowSpan={2} className={styles.stickyProduct}>Тип виробу</th><th rowSpan={2}>Ширина листа<br /><small>повна / робоча</small></th>
            {groupedColumns.map(({ profile, columns }) => <th key={profile.key} colSpan={columns.length} className={`${styles.brandHeader} ${styles[`brandTint${tintIndex(profile.key)}`]}`}>{profile.label}</th>)}
            {!shownGroups.length && <th>Цінові варіанти ще не додані</th>}
          </tr>
          <tr>{shownGroups.map((group) => {
            const profileIndex = tintIndex(group.profileKey);
            return <th key={group.key} className={`${styles.variantHeader} ${styles[`brandTint${profileIndex % 7}`]}`}><span>{group.thickness} мм · {group.coatingLabel}</span><small>{paintingLabel(group.paintingType)}</small></th>;
          })}{!shownGroups.length && <th />}</tr>
        </thead>
        {categories.filter((category) => !categoryFilter || category === categoryFilter).map((category) => {
          const categoryProducts = shownProducts.filter((product) => product.category === category);
          if (!categoryProducts.length) return null;
          return <tbody key={category}>
            <tr className={styles.categoryRow}>
              <th colSpan={2}>{category}<small>грн/м.п.</small></th>
              {shownGroups.map((group) => {
                const editorKey = `category:${category}:${group.key}`;
                const currentRate = rateFor(group);
                if (editingKey === editorKey) return <td key={group.key} className={styles.meterEditCell}>
                  <form onSubmit={(event) => saveEdit(event, group)}>
                    <input autoFocus type="number" min="0" step="0.01" value={editingRate} onChange={(event) => setEditingRate(event.target.value)} aria-label={`Ціна за м.п. ${group.label}, ${group.thickness} мм`} />
                    <button type="submit" disabled={isPending} aria-label="Зберегти ціну за м.п."><Check size={13} /></button>
                    <button type="button" disabled={isPending} onClick={() => setEditingKey('')} aria-label="Скасувати"><X size={13} /></button>
                  </form>
                </td>;
                return <td key={group.key}><button type="button" className={styles.meterPrice} onClick={() => beginEdit(editorKey, group)}>{currentRate === null ? 'Додати' : formatPrice(currentRate)} <small>грн/м.п.</small></button></td>;
              })}
              {!shownGroups.length && <td />}
            </tr>
            {categoryProducts.map((product) => <tr key={product.slug} className={!product.isVisible ? styles.productHidden : ''}>
              <th scope="row" className={`${styles.productName} ${styles.stickyProduct}`}>{product.id ? <Link href={`/admin/products/${product.id}`}>{product.title}</Link> : <Link href={`/catalog/${product.slug}`} target="_blank">{product.title}</Link>}{!product.isVisible && <small>Приховано на сайті</small>}</th>
              <td className={styles.widthCell}><strong>{product.fullWidth ? `${product.fullWidth.toLocaleString('uk-UA')} м` : '—'}</strong><small>{product.usefulWidth ? `${product.usefulWidth.toLocaleString('uk-UA')} м` : 'робоча —'}</small></td>
              {shownGroups.map((group) => {
                const currentRate = rateFor(group);
                const editorKey = `${product.slug}:${group.key}`;
                const hasSquarePrice = isSquareMeter(product.unit) && Boolean(product.fullWidth);
                const profileIndex = tintIndex(group.profileKey);
                const tintClass = styles[`brandTint${profileIndex % 7}`];
                if (editingKey === editorKey) return <td key={group.key} className={`${styles.editCell} ${tintClass}`}>
                  <form onSubmit={(event) => saveEdit(event, group)}>
                    <label><span>{hasSquarePrice ? 'грн/м²' : 'грн/м.п.'}</span><input autoFocus type="number" min="0" step="0.01" value={editingRate === '' ? '' : hasSquarePrice ? (Number(editingRate) / product.fullWidth!).toFixed(2) : editingRate} onChange={(event) => setEditingRate(event.target.value === '' ? '' : hasSquarePrice ? String(Number((Number(event.target.value) * product.fullWidth!).toFixed(2))) : event.target.value)} aria-label={`Ціна за ${hasSquarePrice ? 'м²' : 'м.п.'} ${product.title}`} /></label>
                    <div><button type="submit" disabled={isPending} aria-label="Зберегти ціну"><Check size={14} /></button><button type="button" disabled={isPending} onClick={() => { setEditingKey(''); setError(''); }} aria-label="Скасувати"><X size={14} /></button></div>
                  </form>
                </td>;
                const squarePrice = currentRate !== null && hasSquarePrice ? currentRate / product.fullWidth! : null;
                return <td key={group.key} className={`${styles.priceCell} ${tintClass}`}>
                  <button type="button" onClick={() => beginEdit(editorKey, group)} title={`Редагувати ціну для ${group.label}, ${group.thickness} мм`}>
                    {currentRate === null ? <strong className={styles.emptyRate}>Додати</strong> : squarePrice !== null ? <strong>{formatPrice(squarePrice)} <small>грн/м²</small></strong> : <strong>{formatPrice(currentRate)} <small>грн/м.п.</small></strong>}
                    <small><Pencil size={10} /> Змінити</small>
                  </button>
                </td>;
              })}
              {!shownGroups.length && <td className={styles.noPrice}>Цінові варіанти не додані</td>}
            </tr>)}
          </tbody>;
        })}
      </table>
    </div>
    <p className={styles.footnote}>Зміна ціни оновлює відтінки цього виробника й товщини для відповідного покриття та типу фарбування. Ціна за м² автоматично рахується за повною шириною; введення будь-якої одиниці перераховує іншу.</p>
  </div>;
}
