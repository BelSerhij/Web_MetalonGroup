import styles from './CategoryCard.module.css';
import Link from 'next/link';

interface Props {
  title: string;
  image: string;
  category?: string;
}

export const CategoryCard = ({
  title,
  image,
  category = title,
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

        <Link href={`/catalog?category=${encodeURIComponent(category)}`} className={styles.button}>
          Детальніше <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
};
