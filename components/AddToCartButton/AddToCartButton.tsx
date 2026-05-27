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

  const addToCart =
    useCartStore((state) => state.addToCart);

  return (
    <button
          onClick={() => addToCart(product)}
          className={styles.button}
    >
      В кошик
    </button>
  );
};