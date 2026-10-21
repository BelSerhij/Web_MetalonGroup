'use client';

import { useMemo } from 'react';
import { CATALOG_COLORS } from '@/lib/catalog/colors';
import { useProductColor } from './ProductColorContext';
import styles from './CatalogColorSelector.module.css';

export function CatalogColorSelector() {
  const { color: selectedColor, setColor } = useProductColor();
  const visibleColors = useMemo(() => {
    const selected = CATALOG_COLORS.find((item) => item.code === selectedColor);
    const firstColors = CATALOG_COLORS.slice(0, 10);
    if (!selected || firstColors.some((item) => item.code === selected.code)) return firstColors;
    return [selected, ...firstColors.slice(0, 9)];
  }, [selectedColor]);
  const hiddenColors = CATALOG_COLORS.filter((item) => !visibleColors.some((visible) => visible.code === item.code));

  return (
    <section className={styles.section} aria-labelledby="catalog-colors-heading">
      <div className={styles.heading}>
        <div>
          <h2 id="catalog-colors-heading">Кольори</h2>
          <p>Оберіть колір покриття, щоб переглянути зразок.</p>
        </div>
        <span className={styles.selected}>{selectedColor}</span>
      </div>
      <div className={styles.palette}>
        <div className={styles.colors}>
          {visibleColors.map((item) => <button key={item.code} type="button" className={`${styles.color} ${selectedColor === item.code ? styles.active : ''}`} onClick={() => setColor(item.code)} aria-pressed={selectedColor === item.code} aria-label={`${item.code} — ${item.name}`} title={`${item.code} — ${item.name}`}>
            <span style={{ backgroundColor: item.hex }} />
            <b><span className={styles.colorName}>{item.name}</span><span>{item.code}</span></b>
          </button>)}
        </div>
        {hiddenColors.length > 0 && <details className={styles.more}>
          <summary>Усі кольори <span>+{hiddenColors.length}</span></summary>
          <div className={styles.colors}>
            {hiddenColors.map((item) => <button key={item.code} type="button" className={`${styles.color} ${selectedColor === item.code ? styles.active : ''}`} onClick={() => setColor(item.code)} aria-pressed={selectedColor === item.code} aria-label={`${item.code} — ${item.name}`} title={`${item.code} — ${item.name}`}>
              <span style={{ backgroundColor: item.hex }} />
              <b><span className={styles.colorName}>{item.name}</span><span>{item.code}</span></b>
            </button>)}
          </div>
        </details>}
      </div>
    </section>
  );
}
