'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useCartStore }
from '../../store/cart-store';

import styles
from './CartDrawer.module.css';

export const CartDrawer = () => {

  const {
    items,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    isOpen,
    closeCart,
  } = useCartStore();

  if (!isOpen) return null;

  const totalPrice =
    items.reduce(
      (acc, item) =>
        acc +
        item.price *
        item.quantity,
      0
    );

  return (
    <>

      <div
        className={styles.overlay}
        onClick={closeCart}
      />

      <aside className={styles.drawer}>

        {/* HEADER */}

        <div className={styles.header}>

          <h2>
            Кошик
          </h2>

          <button
            onClick={closeCart}
            className={styles.closeButton}
            type="button"
          >
            ✕
          </button>

        </div>

        {/* ITEMS */}

        <div className={styles.items}>

          {!items.length && (

            <div className={styles.empty}>
              <p>
                Кошик порожній
              </p>
            </div>

          )}

          {items.map((item) => (

            <div
              key={item.id}
              className={styles.item}
            >

              <Image
                src={item.image}
                alt={item.title}
                width={80}
                height={80}
                className={styles.image}
              />

              <div className={styles.content}>

                <h3>
                  {item.title}
                </h3>

                {/* QUANTITY */}

                <div className={styles.quantity}>

                  <button
                    type="button"
                    onClick={() =>
                      decreaseQuantity(
                        item.id
                      )
                    }
                    className={
                      styles.quantityButton
                    }
                  >
                    −
                  </button>

                  <span>
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      increaseQuantity(
                        item.id
                      )
                    }
                    className={
                      styles.quantityButton
                    }
                  >
                    +
                  </button>

                </div>

                {/* PRICE */}

                <p className={styles.itemPrice}>
                  {item.quantity}
                  {' × '}
                  {item.price}
                  {' грн/'}
                  {item.unit}
                </p>

                <p className={styles.subtotal}>
                  Разом:
                  {' '}
                  {(
                    item.price *
                    item.quantity
                  ).toFixed(0)}
                  {' '}
                  грн
                </p>

              </div>

              {/* REMOVE */}

              <button
                type="button"
                onClick={() =>
                  removeFromCart(
                    item.id
                  )
                }
                className={
                  styles.removeButton
                }
              >
                ✕
              </button>

            </div>

          ))}

        </div>

        {/* FOOTER */}

        {!!items.length && (

          <div className={styles.footer}>

            <div className={styles.total}>
              Разом:
              {' '}
              {totalPrice.toFixed(0)}
              {' '}
              грн
            </div>

            <Link
              href="/checkout"
              className={
                styles.checkoutButton
              }
              onClick={closeCart}
            >
              Оформити замовлення
            </Link>

          </div>

        )}

      </aside>

    </>
  );
};