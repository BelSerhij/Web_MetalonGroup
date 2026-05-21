import styles from './AdvantageCard.module.css';
import Image from 'next/image';

interface Props {
  title: string;
  description: string;
  image: string;
}

export const AdvantageCard = ({
  title,
  description,
  image,
}: Props) => {
  return (
    <article className={styles.card}>
      <Image
        src={image}
        alt={title}
        width={84}
        height={84}
        className={styles.image}
      />

      <h3 className={styles.title}>
        {title}
      </h3>

      <p className={styles.description}>
        {description}
      </p>
    </article>
  );
};