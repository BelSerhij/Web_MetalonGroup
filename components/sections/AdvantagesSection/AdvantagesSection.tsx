import styles from './AdvantagesSection.module.css';

import { Container } from '../../layout/Container/Container';
import { SectionTitle } from '../../ui/SectionTitle/SectionTitle';
import { AdvantageCard } from '../../ui/AdvantageCard/AdvantageCard';

const advantages = [
  {
    title: 'Власне виробництво',
    description: 'Контролюємо якість продукції на кожному етапі виробництва.',
    image: '/Advantage/zavod.png',
  },
  {
    title: 'Гарантія якості металу',
    description: 'Використовуємо перевірений метал та сучасне обладнання.',
    image: '/Advantage/guarantee-1.png',
  },
  {
    title: 'Швидка доставка',
    description: 'Оперативна доставка по Одесі та всій Україні.',
    image: '/Advantage/dostavka.png',
  },
  {
    title: 'Прорахунок за 5 хвилин',
    description: 'Швидко прорахуємо матеріали та орієнтовну вартість.',
    image: '/Advantage/five-minutes-2.png',
  },
];

export const AdvantagesSection = () => {
  return (
    <section className={styles.section}>
      <Container>
        <SectionTitle
          subtitle="Переваги"
          title="Чому обирають нас"
          centered
        />

        <div className={styles.grid}>
          {advantages.map((item) => (
            <AdvantageCard
              key={item.title}
              title={item.title}
              description={item.description}
              image={item.image}
            />
          ))}
        </div>
      </Container>
    </section>
  );
};