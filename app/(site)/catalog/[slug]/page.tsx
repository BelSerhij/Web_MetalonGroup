import Image from 'next/image';
import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';

import styles from './ProductPage.module.css';
import Link from 'next/link';
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
              від {Math.min(
                ...product.variants.map(
                  (variant) => variant.price
                )
              )} грн/{product.unit}
            </p>

            <p className={styles.description}>
              {product.description}
            </p>

            <div className={styles.actions}>

              <ProductConfigurator
                product={{
                  id: product.id,
                  title: product.title,
                  slug: product.slug,
                  image: product.image,
                  unit: product.unit,
                  variants: product.variants,
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