import { prisma } from '@/lib/prisma';

import { CalculatorTabs } from '@/components/calculator/CalculatorTabs';

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

  const posts =
    await prisma.fencePost.findMany();

  const lags =
    await prisma.fenceLag.findMany();

  const screws =
    await prisma.fenceScrew.findMany();

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

  /*
   * =========================================================
   * НОРМАЛІЗАЦІЯ СТОВПІВ
   * =========================================================
   */

  const normalizedPosts =
    posts.map((post) => ({
      id: post.id,

      title:
        post.title,

      size:
        post.size,

      thickness:
        Number(
          post.thickness
        ),

      length:
        Number(
          post.length
        ),

      price:
        Number(
          post.price
        ),
    }));

  /*
   * =========================================================
   * НОРМАЛІЗАЦІЯ ЛАГ
   * =========================================================
   */

  const normalizedLags =
    lags.map((lag) => ({
      id: lag.id,

      title:
        lag.title,

      size:
        lag.size,

      thickness:
        Number(
          lag.thickness
        ),

      length:
        Number(
          lag.length
        ),

      price:
        Number(
          lag.price
        ),
    }));

  /*
   * =========================================================
   * НОРМАЛІЗАЦІЯ САМОРІЗІВ
   * =========================================================
   */

  const normalizedScrews =
    screws.map((screw) => ({
      id: screw.id,

      title:
        screw.title,

      size:
        screw.size,

      price:
        Number(
          screw.price
        ),
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

      posts={
        normalizedPosts
      }

      lags={
        normalizedLags
      }

      screws={
        normalizedScrews
      }
    />
  );
}