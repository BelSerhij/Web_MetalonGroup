import { prisma } from '@/lib/prisma';

import { CalculatorTabs } from '@/components/calculator/CalculatorTabs';
import { canonicalizeMaterialRates } from '@/lib/catalog/manufacturers';

export const dynamic = 'force-dynamic';

export default async function CalculatorPage() {
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

  const materialRates = await prisma.materialRate.findMany();

  /*
   * =========================================================
   * НОРМАЛІЗАЦІЯ PRODUCT
   *
   * Prisma повертає Decimal для:
   *
   * - usefulWidth
   * - fullWidth
   * - variant.thickness
   * - variant.price
   *
   * Client Components повинні отримувати number.
   * =========================================================
   */

  const normalizeProducts = (
    products: typeof profnastylProducts
  ) => {
    return products.map(
      (product) => ({
        id: product.id,

        title:
          product.title,

        slug:
          product.slug,

        description:
          product.description,

        category:
          product.category,

        image:
          product.image,

        unit:
          product.unit,

        usefulWidth:
          Number(
            product.usefulWidth
          ),

        fullWidth:
          Number(
            product.fullWidth
          ),

        variants:
          product.variants.map(
            (variant) => ({
              id: variant.id,

              productId:
                variant.productId,

              thickness:
                Number(
                  variant.thickness
                ),

              color:
                variant.color,

              coating:
                variant.coating,

              paintingType:
                variant.paintingType,

              metalBrand:
                variant.metalBrand,

              zincContent:
                Number(
                  variant.zincContent
                ),

              price:
                Number(
                  variant.price
                ),

              inStock:
                variant.inStock,
            })
          ),
      })
    );
  };

  /*
   * Нормалізовані товари.
   */

  const normalizedProfnastylProducts =
    normalizeProducts(
      profnastylProducts
    );

  const normalizedShtaketProducts =
    normalizeProducts(
      shtaketProducts
    );

  const normalizedMetalTileProducts =
    normalizeProducts(
      metalTileProducts
    );

  const normalizedRates = canonicalizeMaterialRates(materialRates).map((rate) => ({
    metalBrand: rate.metalBrand,
    thickness: Number(rate.thickness),
    coating: rate.coating,
    paintingType: rate.paintingType,
    pricePerMeter: Number(rate.pricePerMeter),
  }));

  return (
    <CalculatorTabs
      profnastylProducts={
        normalizedProfnastylProducts
      }

      shtaketProducts={
        normalizedShtaketProducts
      }

      metalTileProducts={
        normalizedMetalTileProducts
      }
      rates={normalizedRates}
    />
  );
}
