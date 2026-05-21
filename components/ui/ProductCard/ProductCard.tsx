import Image from 'next/image';

import styles from './ProductCard.module.css';

interface Props {
  title: string;
  price: string;
  image: string;
}

export const ProductCard = ({
  title,
  price,
  image,
}: Props) => {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image
          src={image}
          alt={title}
          width={500}
          height={400}
          className={styles.image}
        />
      </div>

      <div className={styles.content}>
        <div>
          <h3 className={styles.title}>
            {title}
          </h3>

          <p className={styles.price}>
            {price}
          </p>
        </div>

        <button className={styles.button}>
          Замовити
        </button>
      </div>
    </article>
  );
};