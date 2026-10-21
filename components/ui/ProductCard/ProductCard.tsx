import Image from 'next/image';
import Link from 'next/link';
import styles from './ProductCard.module.css';

interface Props { title: string; image: string; slug: string }

export const ProductCard = ({ title, image, slug }: Props) => <article className={styles.card}>
  <Link href={`/catalog/${slug}`} className={styles.imageWrapper} aria-label={`Детальніше: ${title}`}>
    <Image src={image} alt={title} width={500} height={400} className={styles.image} />
  </Link>
  <div className={styles.content}>
    <div><h3 className={styles.title}>{title}</h3></div>
    <Link href={`/catalog/${slug}`} className={styles.details}>Характеристики та розрахунок</Link>
  </div>
</article>;
