import Image from 'next/image';
import Link from 'next/link';
import { AddToCartButton } from '@/components/AddToCartButton/AddToCartButton';
import styles from './ProductCard.module.css';

type CartProduct = { id: string; title: string; price: number; image: string; slug: string; unit: string; category: string; usefulWidth: number; fullWidth: number; options: { color: string; thickness: number; metalBrand: string; coating: string; paintingType: string } };
interface Props { title: string; price: string; image: string; slug: string; cartProduct?: CartProduct | null }

export const ProductCard = ({ title, price, image, slug, cartProduct }: Props) => <article className={styles.card}>
  <Link href={`/catalog/${slug}`} className={styles.imageWrapper} aria-label={`Детальніше: ${title}`}>
    <Image src={image} alt={title} width={500} height={400} className={styles.image} />
  </Link>
  <div className={styles.content}>
    <div><h3 className={styles.title}>{title}</h3><p className={styles.price}>{price}</p></div>
    <Link href={`/catalog/${slug}`} className={styles.details}>Детальніше</Link>
    {cartProduct ? <AddToCartButton product={cartProduct} /> : <button type="button" className={styles.disabledCart} disabled title="Додайте ціну до прайс-листа">В кошик</button>}
  </div>
</article>;
