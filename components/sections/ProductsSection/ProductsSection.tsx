import styles from './ProductsSection.module.css';

import { prisma } from '@/lib/prisma';

import { Container }
from '../../layout/Container/Container';

import { SectionTitle }
from '../../ui/SectionTitle/SectionTitle';

import { ProductCard }
from '../../ui/ProductCard/ProductCard';

export const ProductsSection =
  async () => {

  const products =
    await prisma.product.findMany({
      take: 3,
      include: {
        variants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

  return (
    <section className={styles.section}>

      <Container>

        <SectionTitle
          subtitle="Популярне"
          title="Популярні товари"
        />

        <div className={styles.grid}>

          {products.map((item) => (

            <ProductCard
              key={item.id}
              title={item.title}
              image={item.image}
              slug={item.slug}
              price={`від ${
                Math.min(
                  ...item.variants.map(
                    (variant) =>
                      variant.price
                  )
                )
              } грн/${item.unit}`}
            />

          ))}

        </div>

      </Container>

    </section>
  );
};