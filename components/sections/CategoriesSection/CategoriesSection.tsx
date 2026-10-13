import styles from './CategoriesSection.module.css';

import { Container } from '../../../components/layout/Container/Container';
import { SectionTitle } from '../../ui/SectionTitle/SectionTitle';
import { CategoryCard } from '../../ui/CategoryCard/CategoryCard';
import Link from 'next/link';

const categories = [
  {
    title: 'Профнастил',
    image: '/catalog/wpg/t10.png',
  },
  {
    title: 'Металочерепиця',
    image: '/catalog/wpg/elite.png',
  },
  {
    title: 'Паркан',
    image: '/catalog/wpg/fence-rhomb.png',
    },
  {
    title: 'Штахет',
    image: '/catalog/wpg/picket.png',
    },
     {
    title: 'Метал-Сайдинг',
    image: '/catalog/wpg/siding-blockhouse.png',
    },
   {
    title: 'Ринви',
    image: '/catalog/wpg/gutter.jpg',
    },
   {
    title: 'Плівки',
    image: '/catalog/wpg/film.png',
    },
  {
    title: 'Комплектуючі',
    image: '/catalog/wpg/accessory.png',
  },
];

export const CategoriesSection = () => {
  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.top}>
          <SectionTitle
            subtitle="Каталог"
            title="Основні категорії"
          />

          <Link className="button-secondary" href="/catalog">
            Весь каталог
          </Link>
        </div>

        <div className={styles.grid}>
          {categories.map((item) => (
            <CategoryCard
              key={item.title}
              title={item.title}
              image={item.image}
              category={item.title}
            />
          ))}
        </div>
      </Container>
    </section>
  );
};
