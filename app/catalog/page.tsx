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
              category: selectedCategory,
            }
          : undefined,

      orderBy: {
        createdAt: 'desc',
      },
    });

  return (
    <main className={styles.page}>

      {/* Filters */}
      <section className={styles.filters}>
        <div className="container">

          <div className={styles.filtersWrapper}>
            {filters.map((item) => (

              <Link
                key={item}
                href={
                  item === 'Всі'
                    ? '/catalog'
                    : `/catalog?category=${item}`
                }
                className={`${styles.filterButton} ${
                  selectedCategory === item
                    ? styles.active
                    : ''
                }`}
              >
                {item}
              </Link>

            ))}
          </div>

        </div>
      </section>

      {/* Products */}
      <section className={styles.products}>
        <div className="container">

          <div className={styles.grid}>
            {products.map((item) => (

              <article
                key={item.id}
                className={styles.card}
              >
                <div className={styles.imageWrapper}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={600}
                    height={400}
                    className={styles.image}
                  />
                </div>

                <div className={styles.content}>
                  <span className={styles.category}>
                    {item.category}
                  </span>

                  <h2 className={styles.productTitle}>
                    {item.title}
                  </h2>

                  <p className={styles.price}>
                    {item.price} грн/{item.unit}
                  </p>
                  <div className={styles.cardActions}>

                    <Link
                      href={`/catalog/${item.slug}`}
                      className={styles.detailsButton}
                    >
                      Детальніше
                    </Link>

                    <AddToCartButton product={item} />

                  </div>
                </div>

              </article>

            ))}
          </div>

        </div>
      </section>
    </main>
  );
}