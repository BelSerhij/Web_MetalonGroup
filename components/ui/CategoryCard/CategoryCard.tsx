import styles from './CategoryCard.module.css';

interface Props {
  title: string;
  image: string;
}

export const CategoryCard = ({
  title,
  image,
}: Props) => {
  return (
    <article className={styles.card}>
      <div
        className={styles.image}
        style={{
          backgroundImage: `url(${image})`,
        }}
      />

      <div className={styles.content}>
        <h3 className={styles.title}>
          {title}
        </h3>

        <button className={styles.button}>
          Детальніше
        </button>
      </div>
    </article>
  );
};