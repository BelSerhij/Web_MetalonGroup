'use client';

import { Product }
from '@prisma/client';

type Props = {
  products: Product[];
};

export const ShtaketCalculator = ({
  products,
}: Props) => {
  return <div>Shtaket Calculator</div>;
};