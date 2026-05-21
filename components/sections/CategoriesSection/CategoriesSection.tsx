import styles from './CategoriesSection.module.css';

import { Container } from '../../../components/layout/Container/Container';
import { SectionTitle } from '../../ui/SectionTitle/SectionTitle';
import { CategoryCard } from '../../ui/CategoryCard/CategoryCard';

const categories = [
  {
    title: 'Профнастил',
    image: '/categories/profnastil.jpg',
  },
  {
    title: 'Металочерепиця',
    image: '/categories/Dyzayn.jpg',
  },
  {
    title: 'Паркан',
    image: '/categories/zabor.jpg',
    },
  {
    title: 'Штахет',
    image: '/categories/shtakhet.jpg',
    },
     {
    title: 'Метал-Сайдинг',
    image: '/categories/block-haus.jpg',
    },
   {
    title: 'Ринви',
    image: '/categories/vodostochnyesistemy.jpg',
    },
   {
    title: 'Плівки',
    image: '/categories/plenka.jpg',
    },
  {
    title: 'Комплектуючі',
    image: '/categories/komplekt.jpg',
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

          <button className="button-secondary">
            Весь каталог
          </button>
        </div>

        <div className={styles.grid}>
          {categories.map((item) => (
            <CategoryCard
              key={item.title}
              title={item.title}
              image={item.image}
            />
          ))}
        </div>
      </Container>
    </section>
  );
};