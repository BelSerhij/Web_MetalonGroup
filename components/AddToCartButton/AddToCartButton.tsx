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
    variantId?: string;
    category?: string;
    usefulWidth?: number;
    fullWidth?: number;
    options?: { color: string; thickness: number; metalBrand: string; coating: string; paintingType: string };
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
    const area = meters * (product.usefulWidth ?? 1);
    const billableQuantity = /м²|м2/i.test(product.unit) ? area : meters;
    const cartId = `${product.variantId ?? product.id}:${length}:${JSON.stringify(product.options ?? {})}`;

    addToCart({
      id: product.id,
      ...(product.variantId ? { variantId: product.variantId } : {}),
      cartId,
      title: product.title,
      price: product.price,
      image: product.image,
      slug: product.slug,
      unit: product.unit,
      quantity,
      length,
      meters,
      area,
      total: product.price * billableQuantity,
      category: product.category,
      usefulWidth: product.usefulWidth,
      fullWidth: product.fullWidth,
      options: product.options,
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
