'use client';

import { Product }
from '@prisma/client';

type Props = {
  products: Product[];
};

export const MetalTileCalculator = ({
  products,
}: Props) => {
  return <div>Металочерепиця</div>;
};