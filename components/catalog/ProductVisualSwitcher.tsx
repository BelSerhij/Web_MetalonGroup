'use client';

import { useState } from 'react';
import { ProductDrawing } from './ProductDrawing';
import { ProductImagePreview } from './ProductImagePreview';
import styles from './ProductVisualSwitcher.module.css';

type Props = {
  src: string;
  alt: string;
  imagesByColor: Record<string, string>;
  drawing: { kind: import('@/lib/catalog/series').DrawingKind; title: string; fullWidth?: number; usefulWidth?: number; height?: number; asset?: string };
};

export function ProductVisualSwitcher({ src, alt, imagesByColor, drawing }: Props) {
  const [showDrawing, setShowDrawing] = useState(false);

  return (
    <div className={styles.visual}>
      {showDrawing ? (
        <div className={styles.drawing} role="button" tabIndex={0} onClick={() => setShowDrawing(false)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setShowDrawing(false); } }} aria-label={`Показати фото ${drawing.title}`}>
          <ProductDrawing {...drawing} />
          <span className={styles.drawingHint}>Натисніть, щоб повернутися до фото</span>
        </div>
      ) : (
        <button className={styles.photo} type="button" onClick={() => setShowDrawing(true)} aria-label={`Показати креслення профілю ${drawing.title}`}>
          <ProductImagePreview src={src} alt={alt} imagesByColor={imagesByColor} />
          <span className={styles.hint}>Є креслення профілю · натисніть, щоб переглянути</span>
        </button>
      )}
    </div>
  );
}
