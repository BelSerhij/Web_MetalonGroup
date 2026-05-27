import Image from 'next/image';
import Link from 'next/link';

import styles from './ProductCard.module.css';

interface Props {
  title: string;
  price: string;
  image: string;
  slug: string;
}

export const ProductCard = ({
  title,
  price,
  image,
  slug,
}: Props) => {
  return (

    <Link
      href={`/catalog/${slug}`}
      className={styles.card}
    >

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

        <span className={styles.button}>
          Детальніше
        </span>

      </div>

    </Link>
  );
};