'use client';

import { useMemo, useState } from 'react';
import { CATALOG_COLORS } from '@/lib/catalog/colors';
import { canonicalFinish } from '@/lib/catalog/manufacturers';
import styles from '@/app/(site)/calculator/CalculatorPage.module.css';

export type CalculatorProduct = { id: string; title: string; slug: string; category: string; unit: string; usefulWidth: number; fullWidth: number; variants: { id: string; thickness: number; color: string; coating: string; paintingType: string; metalBrand: string; price: number }[] };
type Product = CalculatorProduct;
type Rate = { metalBrand: string; thickness: number; coating: string; paintingType: string; pricePerMeter: number };
type Dimension = { id: number; width: string; length: string };
type Props = { profnastylProducts: Product[]; shtaketProducts: Product[]; metalTileProducts: Product[]; rates: Rate[] };
const kinds = [
  { id: 'fence', label: 'Паркан · С-10' },
  { id: 'roof', label: 'Дах · Т-18 / Т-45' },
  { id: 'tile', label: 'Металочерепиця' },
  { id: 'picket', label: 'Металевий штахет' },
] as const;
type Kind = typeof kinds[number]['id'];
const finishLabel = (coating: string, painting: string) => coating === 'Zinc' ? 'Оцинковка' : `${painting === 'TwoSide' ? 'Двостороннє' : 'Одностороннє'} фарбування · ${coating === 'Matt' ? 'матове' : coating === 'PEME' ? 'PEME' : 'глянцеве'}`;
const tier = (brand: string) => /arcelor|uss steel/i.test(brand) ? 'Преміум сегмент' : /polysteel|lowen|löwen|metipol/i.test(brand) ? 'Стандарт+' : /коре|korea/i.test(brand) ? 'Стандарт' : /в[єе]тнам|vietnam|модуль|module/i.test(brand) ? 'Економ' : 'Виробник';

export function CalculatorTabs({ profnastylProducts, shtaketProducts, metalTileProducts, rates }: Props) {
  const [kind, setKind] = useState<Kind>('fence');
  const products = kind === 'picket' ? shtaketProducts : kind === 'tile' ? metalTileProducts : profnastylProducts;
  const suitableProducts = kind === 'fence' ? products.filter((p) => /s10|с-10/i.test(`${p.slug} ${p.title}`)) : kind === 'roof' ? products.filter((p) => /t18|t45|т-18|т-45/i.test(`${p.slug} ${p.title}`)) : products;
  const [productId, setProductId] = useState('');
  const product = suitableProducts.find((item) => item.id === productId) ?? suitableProducts[0];
  const [thickness, setThickness] = useState('');
  const [coating, setCoating] = useState('');
  const [painting, setPainting] = useState('');
  const [brand, setBrand] = useState('');
  const [gap, setGap] = useState('3');
  const [dimensions, setDimensions] = useState<Dimension[]>([{ id: 1, width: '', length: '' }]);
  const [nextId, setNextId] = useState(2);
  const thicknessOptions = [...new Set(rates.map((r) => String(r.thickness)))].sort((a, b) => Number(a) - Number(b));
  const selectedThickness = thickness || thicknessOptions[0] || '';
  const rateOptions = rates.filter((r) => String(r.thickness) === selectedThickness);
  const finishOptions = [...new Map(rateOptions.map((r) => [`${canonicalFinish(r.coating)}|${r.paintingType}`, { coating: canonicalFinish(r.coating), painting: r.paintingType }])).values()];
  const selectedFinish = finishOptions.find((f) => f.coating === coating && f.painting === painting) ?? finishOptions[0];
  const matchingRates = selectedFinish ? rateOptions.filter((r) => canonicalFinish(r.coating) === selectedFinish.coating && r.paintingType === selectedFinish.painting).sort((a, b) => a.pricePerMeter - b.pricePerMeter) : [];
  const selectedRate = matchingRates.find((r) => r.metalBrand === brand) ?? matchingRates[0];
  const values = useMemo(() => {
    const usefulWidth = Math.max(0.01, product?.usefulWidth || (kind === 'fence' ? 1.16 : 1.1));
    const rows = dimensions.map((row) => {
      const width = Number(row.width.replace(',', '.')) || 0;
      const length = Number(row.length.replace(',', '.')) || 0;
      const count = kind === 'picket' ? Math.ceil(width / (0.11 + (Number(gap.replace(',', '.')) || 0) / 100)) : Math.ceil(width / usefulWidth);
      return { ...row, width, length, count: width > 0 && length > 0 ? count : 0, meters: width > 0 && length > 0 ? count * length : 0 };
    });
    const sheets = rows.reduce((sum, row) => sum + row.count, 0);
    const meters = rows.reduce((sum, row) => sum + row.meters, 0);
    const area = meters * usefulWidth;
    const price = selectedRate && product ? selectedRate.pricePerMeter / (product.fullWidth || usefulWidth) : 0;
    const total = selectedRate ? selectedRate.pricePerMeter * meters : 0;
    return { rows, sheets, meters, area, price, total };
  }, [dimensions, product, kind, gap, selectedRate]);
  const title = kind === 'fence' ? 'Розрахунок паркану із профнастилу С-10' : kind === 'roof' ? 'Розрахунок покрівлі з профнастилу' : kind === 'tile' ? 'Розрахунок покрівлі з металочерепиці' : 'Розрахунок металевого штахету';

  return <section className={styles.calculator}>
    <div className={styles.calculatorIntro}><span>ПОПЕРЕДНІЙ ПРОРАХУНОК</span><h2>{title}</h2><p>Вкажіть розміри та параметри матеріалу — вартість порахуємо за актуальним прайсом.</p></div>
    <div className={styles.calculatorTabs}>{kinds.map((item) => <button key={item.id} type="button" onClick={() => { setKind(item.id); setProductId(''); setDimensions([{ id: 1, width: '', length: '' }]); }} className={kind === item.id ? styles.calculatorTabActive : ''}>{item.label}</button>)}</div>
    <div className={styles.calculatorGrid}>
      <section className={styles.calculatorForm}>
        <h3>Розміри {kind === 'fence' || kind === 'picket' ? 'огорожі' : 'скатів'}</h3>
        {dimensions.map((row, index) => <div className={styles.measureRow} key={row.id}>
          <b>{dimensions.length > 1 ? `${index + 1}.` : ''}</b>
          <label><span>{kind === 'fence' || kind === 'picket' ? 'Довжина паркану, м' : 'Ширина ската, м'}</span><input inputMode="decimal" value={row.width} placeholder="Наприклад, 18" onChange={(e) => setDimensions((all) => all.map((d) => d.id === row.id ? { ...d, width: e.target.value } : d))} /></label>
          <label><span>{kind === 'fence' ? 'Висота листа, м' : kind === 'picket' ? 'Висота штахетини, м' : 'Довжина листа, м'}</span><input inputMode="decimal" value={row.length} placeholder="Наприклад, 2" onChange={(e) => setDimensions((all) => all.map((d) => d.id === row.id ? { ...d, length: e.target.value } : d))} /></label>
          {dimensions.length > 1 && <button type="button" aria-label="Видалити розмір" onClick={() => setDimensions((all) => all.filter((d) => d.id !== row.id))}>×</button>}
        </div>)}
        <button className={styles.addDimension} type="button" onClick={() => { setDimensions((all) => [...all, { id: nextId, width: '', length: '' }]); setNextId((n) => n + 1); }}>+ Додати інший розмір</button>
        {kind === 'picket' && <label className={styles.singleField}><span>Просвіт між штахетинами, см (ширина планки — 11 см)</span><input inputMode="decimal" value={gap} onChange={(e) => setGap(e.target.value)} /></label>}
        {suitableProducts.length > 1 && <label className={styles.singleField}><span>Профіль</span><select value={product?.id ?? ''} onChange={(e) => setProductId(e.target.value)}>{suitableProducts.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select></label>}
        <label className={styles.singleField}><span>Тип покриття</span><select value={selectedFinish ? `${selectedFinish.coating}|${selectedFinish.painting}` : ''} onChange={(e) => { const [c, p] = e.target.value.split('|'); setCoating(c); setPainting(p); }}>{finishOptions.map((f) => <option key={`${f.coating}|${f.painting}`} value={`${f.coating}|${f.painting}`}>{finishLabel(f.coating, f.painting)}</option>)}</select></label>
        <label className={styles.singleField}><span>Товщина металу</span><select value={selectedThickness} onChange={(e) => setThickness(e.target.value)}>{thicknessOptions.map((item) => <option key={item} value={item}>{item} мм</option>)}</select></label>
      </section>
      <section className={styles.pricePicker}><h3>Виробники та ціни з прайсу</h3><p>Показані варіанти з обраними параметрами</p>
        <div className={styles.priceList}>{matchingRates.map((item) => <button type="button" key={item.metalBrand} onClick={() => setBrand(item.metalBrand)} className={selectedRate?.metalBrand === item.metalBrand ? styles.priceCardActive : ''}><small>{tier(item.metalBrand)}</small><strong>{item.metalBrand}</strong><b>{item.pricePerMeter.toLocaleString('uk-UA')} грн/м.п. {product && /м²|м2/i.test(product.unit) && `· ${values.price.toLocaleString('uk-UA')} грн/м²`}</b></button>)}{!matchingRates.length && <p className={styles.noRates}>Для цих параметрів у прайсі немає вартості.</p>}</div>
      </section>
      <aside className={styles.calculatorSummary}><span>ВАШ ПОПЕРЕДНІЙ РОЗРАХУНОК</span><div className={styles.summaryMain}><small>{kind === 'picket' ? 'Кількість штахетин' : 'Кількість листів'}</small><strong>{values.sheets} <i>шт.</i></strong></div>{values.rows.map((row, index) => row.count > 0 && <p key={row.id}>Розмір {index + 1}: {row.count} шт. × {row.length} м</p>)}<p>Загальна довжина металу <b>{values.meters.toLocaleString('uk-UA', { maximumFractionDigits: 2 })} м.п.</b></p><p>Загальна площа <b>{values.area.toLocaleString('uk-UA', { maximumFractionDigits: 2 })} м²</b></p><div className={styles.summaryTotal}><span>Орієнтовна вартість</span><strong>{selectedRate && values.meters > 0 ? `${values.total.toLocaleString('uk-UA', { maximumFractionDigits: 0 })} грн` : '—'}</strong></div><small>Ціну та наявність остаточно підтвердить менеджер.</small></aside>
    </div>
    <section className={styles.informationalColors}><div><h3>Кольори продукції</h3><p>Палітра для ознайомлення. Відтінки на екрані можуть відрізнятися від реальних.</p></div><div className={styles.colorGrid}>{CATALOG_COLORS.map((color) => <div className={styles.colorItem} key={color.code}><span style={{ backgroundColor: color.hex }} /><b>{color.code}</b><small>{color.name}</small></div>)}</div></section>
  </section>;
}
