'use client';

import { useMemo, useState } from 'react';
import { Phone } from 'lucide-react';
import styles from './FacadeCalculator.module.css';

export const FacadeCalculator = ({ initialLength = '', initialHeight = '' }: { initialLength?: string; initialHeight?: string }) => {
  const [length, setLength] = useState(initialLength);
  const [height, setHeight] = useState(initialHeight);
  const [facades, setFacades] = useState('1');
  const area = useMemo(() => (Number(length) || 0) * (Number(height) || 0) * (Number(facades) || 1), [length, height, facades]);

  return <div className={styles.layout}>
    <section className={styles.form}>
      <div className={styles.eyebrow}>ПАРАМЕТРИ ПРОЄКТУ <b>ФАСАД</b></div>
      <h2>Площа облицювання</h2>
      <p>Внесіть розміри стіни й кількість однакових площин. Віконні та дверні прорізи поки не віднімаються.</p>
      <div className={styles.fields}>
        <label>Довжина фасаду<div><input type="number" min="0" step="0.1" value={length} onChange={(event) => setLength(event.target.value)} placeholder="10" /><small>м</small></div></label>
        <label>Висота фасаду<div><input type="number" min="0" step="0.1" value={height} onChange={(event) => setHeight(event.target.value)} placeholder="3" /><small>м</small></div></label>
      </div>
      <label className={styles.facades}>Кількість однакових стін<select value={facades} onChange={(event) => setFacades(event.target.value)}><option value="1">1 стіна</option><option value="2">2 стіни</option><option value="3">3 стіни</option><option value="4">4 стіни</option></select></label>
    </section>
    <aside className={styles.result}>
      <span>ПОПЕРЕДНІЙ РОЗРАХУНОК</span>
      <p>Площа фасаду</p><h3>{area.toFixed(1)} <small>м²</small></h3>
      <div><p>Наступний крок</p><b>Підберемо профіль і комплектуючі під вашу стіну.</b></div>
      <a href="tel:+380733885299"><Phone size={15} /> Уточнити комплектацію</a>
      <small>Розрахунок не віднімає площу вікон і дверей.</small>
    </aside>
  </div>;
};
