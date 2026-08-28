'use client';

import type { CalculatorProduct } from './CalculatorTabs';

type Props = {
  products: CalculatorProduct[];
};

export const ShtaketCalculator = ({
  products,
}: Props) => {
  return (
    <div>
      Shtaket Calculator

      {products.length > 0 && (
        <div>
          Доступно товарів: {products.length}
        </div>
      )}
    </div>
  );
};