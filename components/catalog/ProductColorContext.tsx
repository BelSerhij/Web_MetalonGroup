'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type ProductColorValue = { color: string; setColor: (color: string) => void };
const ProductColorContext = createContext<ProductColorValue | null>(null);

export function ProductColorProvider({ initialColor, children }: { initialColor: string; children: ReactNode }) {
  const [color, setColor] = useState(initialColor);
  const value = useMemo(() => ({ color, setColor }), [color]);
  return <ProductColorContext.Provider value={value}>{children}</ProductColorContext.Provider>;
}

export function useProductColor() {
  const value = useContext(ProductColorContext);
  if (!value) throw new Error('ProductColorProvider is missing');
  return value;
}
