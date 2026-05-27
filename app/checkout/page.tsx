'use client';

import { useCartStore }
from '@/store/cart-store';

import styles
from './CheckoutPage.module.css';

export default function CheckoutPage() {

  const items =
    useCartStore((state) => state.items);

  const totalPrice =
    items.reduce(
      (acc, item) =>
        acc + item.price * item.quantity,
      0
    );

  return (
    <main className={styles.page}>

      <div className="container">

        <h1 className={styles.title}>
          Оформлення замовлення
        </h1>

        <div className={styles.wrapper}>

          {/* FORM */}

          <form className={styles.form}>

            <input
              type="text"
              placeholder="Ваше ім’я"
            />

            <input
              type="tel"
              placeholder="Телефон"
            />

            <input
              type="text"
              placeholder="Місто"
            />

            <input
              type="text"
              placeholder="Відділення Нової Пошти"
            />

            <textarea
              placeholder="Коментар"
            />

            <button
              type="submit"
              className={styles.submitButton}
            >
              Оформити замовлення
            </button>

          </form>

          {/* SUMMARY */}

          <div className={styles.summary}>

            <h2>
              Ваше замовлення
            </h2>

            <div className={styles.items}>

              {items.map((item) => (

                <div
                  key={item.id}
                  className={styles.item}
                >

                  <p>
                    {item.title}
                  </p>

                  <p>
                    {item.quantity}
                    ×
                    {item.price} грн
                  </p>

                </div>

              ))}

            </div>

            <div className={styles.total}>
              Разом:
              {totalPrice} грн
            </div>

          </div>

        </div>

      </div>

    </main>
  );
}