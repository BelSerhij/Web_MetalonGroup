import Image from 'next/image';
import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';

import styles from './ProductPage.module.css';
import Link from 'next/link';
import { AddToCartButton } from '@/components/AddToCartButton/AddToCartButton';

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
    });

  if (!product) {
    notFound();
  }

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

          {/* Image */}
          <div className={styles.imageWrapper}>
            <Image
              src={product.image}
              alt={product.title}
              width={800}
              height={600}
              className={styles.image}
              priority
            />
          </div>

          {/* Content */}
          <div className={styles.content}>

            <span className={styles.category}>
              {product.category}
            </span>

            <h1 className={styles.title}>
              {product.title}
            </h1>

            <p className={styles.price}>
              {product.price} грн/{product.unit}
            </p>

            <p className={styles.description}>
              {product.description}
            </p>

            <div className={styles.actions}>

            <AddToCartButton
            product={{
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                slug: product.slug,
                unit: product.unit,
            }}
            />

              <button className={styles.consultButton}>
                Консультація
              </button>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}