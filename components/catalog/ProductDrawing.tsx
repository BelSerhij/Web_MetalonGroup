import type { DrawingKind } from '@/lib/catalog/series';
import Image from 'next/image';
import styles from './ProductDrawing.module.css';

type Props = { kind: DrawingKind; title: string; fullWidth?: number; usefulWidth?: number; height?: number; asset?: string };

export function ProductDrawing({ kind, title, fullWidth, usefulWidth, height, asset }: Props) {
  let profile: string;
  if (kind === 'tile') {
    profile = 'M55 155 H95 V98 H130 V75 H167 V98 H204 V155 H246 V98 H283 V75 H320 V98 H357 V155 H399 V98 H436 V75 H473 V98 H510 V155 H545';
  } else if (kind === 'profile') {
    const peak = kind === 'profile' ? Math.max(18, Math.min(68, (height ?? 18) * 1.25)) : 30;
    profile = `M55 155 H90 L110 ${155 - peak} H150 L170 155 H210 L230 ${155 - peak} H270 L290 155 H330 L350 ${155 - peak} H390 L410 155 H450 L470 ${155 - peak} H510 L530 155 H545`;
  } else if (kind === 'rhomb') {
    profile = 'M92 100 L165 70 L238 100 L165 130 Z M262 100 L335 70 L408 100 L335 130 Z M432 100 L505 70 L545 86';
  } else if (kind === 'louver') {
    profile = 'M75 90 L510 75 L525 98 L90 113 Z M75 120 L510 105 L525 128 L90 143 Z M75 150 L510 135 L525 158 L90 173 Z';
  } else if (kind === 'farm') {
    profile = 'M80 75 H520 V98 H80 Z M80 122 H520 V145 H80 Z M80 169 H520 V192 H80 Z';
  } else if (kind === 'blockhouse') {
    profile = 'M70 86 H480 Q530 86 530 112 Q530 138 480 138 H70 Q48 138 48 112 Q48 86 70 86 Z M70 150 H480 Q530 150 530 176 Q530 202 480 202 H70 Q48 202 48 176 Q48 150 70 150 Z';
  } else {
    profile = 'M65 95 L520 95 L500 125 L85 125 Z M65 150 L520 150 L500 180 L85 180 Z';
  }

  const label = fullWidth ? `Повна ширина ${Math.round(fullWidth * 1000)} мм` : 'Переріз профілю';

  return (
    <figure className={styles.figure}>
      <figcaption><span>КРЕСЛЕННЯ ПРОФІЛЮ</span><b>{title}</b></figcaption>
      {asset ? <Image className={`${styles.asset} ${kind === 'profile' ? styles.profileAsset : ''}`} src={asset} width={1400} height={420} alt={`Креслення виробника: ${title}`} /> : <svg viewBox="0 0 600 250" role="img" aria-label={`Схематичне креслення профілю: ${title}`}>
        <defs><marker id="arrowHead" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto"><path d="M7 0 L0 3.5 L7 7" fill="none" stroke="currentColor" strokeWidth="1" /></marker></defs>
        <path d={profile} className={styles.profile} />
        <path d="M75 218 H525" className={styles.dimension} markerStart="url(#arrowHead)" markerEnd="url(#arrowHead)" />
        <path d="M75 198 V225 M525 198 V225" className={styles.extension} />
        <text x="300" y="241" textAnchor="middle">{usefulWidth ? `Корисна ширина ${Math.round(usefulWidth * 1000)} мм` : label}</text>
        {fullWidth && <text x="300" y="28" textAnchor="middle">{label}</text>}
        {kind === 'profile' && <text x="555" y="110" className={styles.heightLabel}>{height} мм</text>}
      </svg>}
      <p>{asset ? 'Креслення профілю виробника.' : 'Схематичне зображення виробу. Точні розміри уточнюються за замовленням.'}</p>
    </figure>
  );
}
