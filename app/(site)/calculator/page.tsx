import { prisma } from '@/lib/prisma';

import { CalculatorTabs } from '@/components/calculator/CalculatorTabs';

export default async function
CalculatorPage() {

  const profnastylProducts =
  await prisma.product.findMany({
    where: {
      category: 'Профнастил',
    },
    include: {
      variants: true,
    },
  });

  const shtaketProducts =
    await prisma.product.findMany({
      where: {
        category: 'Штахет',
      },
      include: {
      variants: true,
    },
    });

  const metalTileProducts =
    await prisma.product.findMany({
      where: {
        category: 'Металочерепиця',
      },
      include: {
      variants: true,
    },
    });
const posts =
  await prisma.fencePost.findMany();

const lags =
  await prisma.fenceLag.findMany();

const screws =
  await prisma.fenceScrew.findMany();
  

  return (
    <CalculatorTabs
      profnastylProducts={profnastylProducts}
      shtaketProducts={shtaketProducts}
      metalTileProducts={metalTileProducts}

  posts={posts}
  lags={lags}
  screws={screws}
    />
  );
}