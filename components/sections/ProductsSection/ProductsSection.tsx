import styles from './ProductsSection.module.css';

import { prisma } from '@/lib/prisma';

import { Container } from '../../layout/Container/Container';

import { ProductCard } from '../../ui/ProductCard/ProductCard';

export const ProductsSection = async () => {
  const products = await prisma.product.findMany({
      take: 3,
      where: { isVisible: true },
      orderBy: { createdAt: 'desc' },
    });

  return (
    <section
      className={styles.section}
    >
      <Container>
        <div className={styles.grid}>
          {products.map((item) => (
              <ProductCard
                key={item.id}
                title={item.title}
                image={item.image}
                slug={item.slug}
              />
          ))}
        </div>
      </Container>
    </section>
  );
};
