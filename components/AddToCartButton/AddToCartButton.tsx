'use client';

import { useCartStore } from '@/store/cart-store';
import styles from './AddToCartButton.module.css';

type Props = {
  product: {
    id: string;
    title: string;
    price: number;
    image: string;
    slug: string;
    unit: string;
  };
};

export const AddToCartButton = ({
  product,
}: Props) => {
  const addToCart = useCartStore(
    (state) => state.addToCart
  );

  const handleAddToCart = () => {
    const quantity = 1;
    const length = 1;
    const meters = quantity * length;

    addToCart({
      id: product.id,
      cartId: `${product.id}:${length}`,
      title: product.title,
      price: product.price,
      image: product.image,
      slug: product.slug,
      unit: product.unit,
      quantity,
      length,
      meters,
      area: 0,
      total: product.price,
    });
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className={styles.button}
    >
      В кошик
    </button>
  );
};
