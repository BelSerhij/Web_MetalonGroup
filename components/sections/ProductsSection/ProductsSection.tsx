import styles from './ProductsSection.module.css';

import { Container } from '../../layout/Container/Container';
import { SectionTitle } from '../../ui/SectionTitle/SectionTitle';
import { ProductCard } from '../../ui/ProductCard/ProductCard';

const products = [
  {
    title: 'Профнастил С-10',
    price: ' 230 грн/м²',
    image: '/Products/prof7016.jpg',
  },
  {
    title: 'Штахет',
    price: ' 42 грн/м.п.',
    image: '/Products/shtahet.jpg',
  },
  {
    title: 'Металочерепиця Milana',
    price: ' 420 грн/м²',
    image: '/Products/Milana.jpg',
  },
];

export const ProductsSection = () => {
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
              key={item.title}
              title={item.title}
              price={item.price}
              image={item.image}
            />
          ))}
        </div>
      </Container>
    </section>
  );
};