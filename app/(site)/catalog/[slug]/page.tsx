import Image from 'next/image';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { prisma } from '@/lib/prisma';

import styles from './ProductPage.module.css';

import { ProductConfigurator } from '@/components/ProductConfigurator/ProductConfigurator';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({
  params,
}: Props) {
  const { slug } = await params;

  const product =
    await prisma.product.findUnique({
      where: {
        slug,
      },

      include: {
        variants: true,
      },
    });

  if (!product) {
    notFound();
  }

  /*
   * Prisma Decimal -> number
   *
   * ProductVariant:
   * - thickness: Decimal
   * - price: Decimal
   *
   * ProductConfigurator очікує number.
   */

  const normalizedVariants =
    product.variants.map(
      (variant) => ({
        id: variant.id,
        productId:
          variant.productId,

        color:
          variant.color,

        thickness:
          Number(
            variant.thickness
          ),

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

        createdAt:
          variant.createdAt,

        updatedAt:
          variant.updatedAt,
      })
    );

  const minPrice =
    normalizedVariants.length > 0
      ? Math.min(
          ...normalizedVariants.map(
            (variant) =>
              variant.price
          )
        )
      : null;

  return (
    <main className={styles.page}>
      <div className="container">
        <Link
          href="/catalog"
          className={styles.backButton}
        >
          ← Назад до каталогу
        </Link>

        <div className={styles.wrapper}>
          {/* IMAGE */}

          <div
            className={
              styles.imageWrapper
            }
          >
            <Image
              src={product.image}
              alt={product.title}
              width={800}
              height={600}
              className={styles.image}
              priority
            />
          </div>

          {/* CONTENT */}

          <div className={styles.content}>
            <span
              className={
                styles.category
              }
            >
              {product.category}
            </span>

            <h1
              className={styles.title}
            >
              {product.title}
            </h1>

            {minPrice !== null && (
              <p
                className={
                  styles.price
                }
              >
                від {minPrice} грн/
                {product.unit}
              </p>
            )}

            {product.description && (
              <p
                className={
                  styles.description
                }
              >
                {product.description}
              </p>
            )}

            <div
              className={
                styles.actions
              }
            >
              <ProductConfigurator
                product={{
                  id: product.id,

                  title:
                    product.title,

                  slug:
                    product.slug,

                  image:
                    product.image,

                  unit:
                    product.unit,

                  usefulWidth:
                    Number(product.usefulWidth),

                  variants:
                    normalizedVariants,
                }}
              />

              <button
                type="button"
                className={
                  styles.consultButton
                }
              >
                Консультація
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
