'use client';

import { useMemo, useState } from 'react';
import type { CalculatorProduct } from './CalculatorTabs';
import styles from './RoofCalculator.module.css';

type Props = {
  products: CalculatorProduct[];
  initialLength?: string;
  initialWidth?: string;
  initialPlanes?: string;
};

export const RoofCalculator = ({ products, initialLength = '', initialWidth = '', initialPlanes = '2' }: Props) => {
  const [length, setLength] = useState(initialLength);
  const [width, setWidth] = useState(initialWidth);
  const [planes, setPlanes] = useState(initialPlanes);
  const [productId, setProductId] = useState(products[0]?.id ?? '');
  const [variantId, setVariantId] = useState('');
  const product = products.find((item) => item.id === productId) ?? products[0];
  const variant = product?.variants.find((item) => item.id === variantId) ?? product?.variants[0];
  const values = useMemo(() => {
    const slopeLength = Number(length) || 0;
    const slopeWidth = Number(width) || 0;
    const roofPlanes = Number(planes) || 1;
    const area = slopeLength * slopeWidth * roofPlanes;
    const sheetsPerPlane = product ? Math.ceil(slopeWidth / (product.usefulWidth || 1.1)) : 0;
    const sheets = sheetsPerPlane * roofPlanes;
    const estimated = variant && product?.unit.includes('м²') ? area * variant.price : null;
    return { area, sheets, estimated };
  }, [length, width, planes, product, variant]);

  return (
    <div className={styles.layout}>
      <section className={styles.form}>
        <div className={styles.formTop}><span>ПАРАМЕТРИ ПРОЄКТУ</span><b>ДАХ</b></div>
        <h2>Розміри ската</h2>
        <p className={styles.description}>Вкажіть довжину та ширину одного ската. Для двосхилого даху оберіть дві площини.</p>
        <div className={styles.measurements}>
          <label><span>Довжина ската</span><div><input type="number" min="0" step="0.1" value={length} onChange={(event) => setLength(event.target.value)} placeholder="12" /><small>м</small></div></label>
          <label><span>Ширина ската</span><div><input type="number" min="0" step="0.1" value={width} onChange={(event) => setWidth(event.target.value)} placeholder="8" /><small>м</small></div></label>
        </div>
        <label className={styles.selectLabel}><span>Кількість однакових скатів</span><select value={planes} onChange={(event) => setPlanes(event.target.value)}><option value="1">Один скат</option><option value="2">Два скати</option><option value="3">Три скати</option><option value="4">Чотири скати</option></select></label>
        {products.length > 0 && <>
          <label className={styles.selectLabel}><span>Профіль</span><select value={product?.id ?? ''} onChange={(event) => { setProductId(event.target.value); setVariantId(''); }}>{products.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
          {product?.variants.length ? <label className={styles.selectLabel}><span>Метал і покриття</span><select value={variant?.id ?? ''} onChange={(event) => setVariantId(event.target.value)}>{product.variants.map((item) => <option key={item.id} value={item.id}>{item.metalBrand} · {item.thickness} мм · {item.color} · {item.coating}</option>)}</select></label> : null}
        </>}
        <p className={styles.note}>Попередній розрахунок не враховує нахлести, карнизні звиси й додаткові елементи покрівлі.</p>
      </section>
      <aside className={styles.result}>
        <div className={styles.resultLabel}>ВАШ ПОПЕРЕДНІЙ РОЗРАХУНОК <span>↗</span></div>
        <p>Площа покрівлі</p><h3>{values.area.toFixed(1)} <small>м²</small></h3>
        <div className={styles.resultLine}><span>Кількість листів*</span><b>{values.sheets} шт.</b></div>
        <div className={styles.resultLine}><span>Матеріал</span><b>{product?.title ?? 'Профнастил'}</b></div>
        <div className={styles.estimated}><span>Орієнтовна вартість матеріалу</span><b>{values.estimated !== null ? `${values.estimated.toLocaleString('uk-UA', { maximumFractionDigits: 0 })} грн` : 'Уточнюйте ціну'}</b></div>
        <small className={styles.disclaimer}>* Кількість листів розрахована без запасу на підрізання. Остаточний комплект узгодить фахівець.</small>
      </aside>
    </div>
  );
};
