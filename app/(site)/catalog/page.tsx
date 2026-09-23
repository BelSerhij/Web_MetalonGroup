import Image from 'next/image';
import Link from 'next/link';

import { prisma } from '@/lib/prisma';

import styles from './Catalog.module.css';
import { AddToCartButton } from '@/components/AddToCartButton/AddToCartButton';

const filters = [
  'Всі',
  'Профнастил',
  'Металочерепиця',
  'Паркан',
  'Штахет',
  'Метал-Сайдинг',
  'Ринви',
  'Плівки',
  'Комплектуючі',
];

type Props = {
  searchParams: Promise<{
    category?: string;
  }>;
};

export default async function CatalogPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const selectedCategory =
    params.category;

  const products =
    await prisma.product.findMany({
      where:
        selectedCategory &&
        selectedCategory !== 'Всі'
          ? {
              category:
                selectedCategory,
            }
          : undefined,

      include: {
        variants: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

  return (
    <main className={styles.page}>
      {/* FILTERS */}

      <section
        className={styles.filters}
      >
        <div className="container">
          <div
            className={
              styles.filtersWrapper
            }
          >
            {filters.map((item) => {
              const isActive =
                item === 'Всі'
                  ? !selectedCategory
                  : selectedCategory ===
                    item;

              return (
                <Link
                  key={item}
                  href={
                    item === 'Всі'
                      ? '/catalog'
                      : `/catalog?category=${item}`
                  }
                  className={`${styles.filterButton} ${
                    isActive
                      ? styles.active
                      : ''
                  }`}
                >
                  {item}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}

      <section
        className={styles.products}
      >
        <div className="container">
          <div className={styles.grid}>
            {products.map((item) => {
              /*
               * Prisma Decimal -> number
               *
               * Ціна зберігається як Decimal,
               * тому перед Math.min()
               * перетворюємо її у number.
               */

              const availableVariants =
                item.variants.filter(
                  (variant) => variant.inStock
                );

              const prices =
                availableVariants.map(
                  (variant) =>
                    Number(
                      variant.price
                    )
                );

              const minPrice =
                prices.length > 0
                  ? Math.min(...prices)
                  : null;

              const defaultVariant =
                availableVariants.find(
                  (variant) =>
                    Number(variant.price) === minPrice
                );

              return (
                <article
                  key={item.id}
                  className={
                    styles.card
                  }
                >
                  {/* IMAGE */}

                  <div
                    className={
                      styles.imageWrapper
                    }
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={600}
                      height={400}
                      className={
                        styles.image
                      }
                    />
                  </div>

                  {/* CONTENT */}

                  <div
                    className={
                      styles.content
                    }
                  >
                    <span
                      className={
                        styles.category
                      }
                    >
                      {item.category}
                    </span>

                    <h2
                      className={
                        styles.productTitle
                      }
                    >
                      {item.title}
                    </h2>

                    <p
                      className={
                        styles.price
                      }
                    >
                      {minPrice !== null
                        ? `від ${minPrice} грн/${item.unit}`
                        : 'Ціну уточнюйте'}
                    </p>

                    <div
                      className={
                        styles.cardActions
                      }
                    >
                      <Link
                        href={`/catalog/${item.slug}`}
                        className={
                          styles.detailsButton
                        }
                      >
                        Детальніше
                      </Link>

                      {minPrice !== null &&
                        defaultVariant && (
                        <AddToCartButton
                          product={{
                            id: defaultVariant.id,

                            title:
                              `${item.title} — ${defaultVariant.color}, ${defaultVariant.thickness} мм, ${defaultVariant.metalBrand}`,

                            price:
                              minPrice,

                            image:
                              item.image,

                            slug:
                              item.slug,

                            unit:
                              item.unit,
                          }}
                        />
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
