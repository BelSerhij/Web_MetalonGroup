
import styles from './HeroSection.module.css';
import { Container } from '../../layout/Container/Container';

export const HeroSection = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.background} />
      <Container>
        <div className={styles.content}>
          <div className={styles.left}>
            <div className={styles.badge}>
              Виробництво • Доставка • Монтаж
            </div>

            <h1 className={styles.title}>
              Профнастил та металеві паркани
            </h1>

            <p className={styles.description}>
              Виготовлення профнастилу під розмір.
              Швидка доставка по Україні.
            </p>

            <div className={styles.actions}>
              <button className="button-primary">
                Розрахувати вартість
              </button>

              <button className="button-secondary">
                Каталог
              </button>
            </div>
          </div>

          <div className={styles.right}>
            <div className={styles.image} />
          </div>
        </div>
      </Container>
    </section>
  );
};