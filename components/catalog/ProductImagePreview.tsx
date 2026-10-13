'use client';

import Image from 'next/image';
import { useProductColor } from './ProductColorContext';

export function ProductImagePreview({ src, alt, imagesByColor = {} }: { src: string; alt: string; imagesByColor?: Record<string, string> }) {
  const { color } = useProductColor();
  const imageSrc = imagesByColor[color] ?? src;
  if (imageSrc !== src) return <img src={imageSrc} alt={alt} className="product-image-preview" />;
  return (
    <Image
      key={imageSrc}
      src={imageSrc}
      alt={alt}
      width={900}
      height={650}
      priority
      style={{ transform: 'perspective(1200px) rotateY(-2.5deg) scale(1.015)' }}
      className="product-image-preview"
    />
  );
}
