'use client';

import type { CalculatorProduct } from './CalculatorTabs';

type Props = {
  products: CalculatorProduct[];
};

export const MetalTileCalculator = ({
  products,
}: Props) => {
  return (
    <div>
      Металочерепиця

      {products.length > 0 && (
        <div>
          Доступно товарів: {products.length}
        </div>
      )}
    </div>
  );
};