'use client';

import { useActionState, useEffect } from 'react';

import { useCartStore }
from '@/store/cart-store';

import styles
from './CheckoutPage.module.css';
import { submitWebsiteOrder, type CheckoutState } from './actions';

const initialState: CheckoutState = {};

export default function CheckoutPage() {

  const items =
    useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const [state, formAction, pending] = useActionState(submitWebsiteOrder, initialState);

useEffect(() => {
  if (state.orderNumber) {
    clearCart();
  }
}, [state.orderNumber, clearCart]);

  const totalPrice =
    items.reduce(
      (acc, item) =>
        acc + item.price * item.quantity,
      0
    );

  if (state.orderNumber) {
    return <main className={styles.page}><div className="container"><h1 className={styles.title}>Дякуємо за замовлення</h1><p>Ваш номер: <strong>{state.orderNumber}</strong>. Менеджер зв’яжеться з вами найближчим часом.</p></div></main>;
  }
  return (
    <main className={styles.page}>

      <div className="container">

        <h1 className={styles.title}>
          Оформлення замовлення
        </h1>

        {!items.length ? (

          <div className={styles.empty}>
            Кошик порожній
          </div>

        ) : (

        <div className={styles.wrapper}>

          {/* FORM */}

          <form className={styles.form} action={formAction}>

            <input
              type="text"
              name="name"
              placeholder="Ваше ім’я"
              required
            />

            <input
              type="tel"
              name="phone"
              placeholder="Телефон"
              required
            />

            <input
              type="text"
              name="city"
              placeholder="Місто"
              required
            />

            <input
              type="text"
              name="deliveryBranch"
              placeholder="Відділення Нової Пошти"
              required
            />

            <textarea
              name="note"
              placeholder="Коментар"
            ></textarea>

            <input type="hidden" name="items" value={JSON.stringify(items.map((item) => ({ variantId: item.id, quantity: item.quantity, length: item.length, })))} />
            {state.error && <p role="alert" className={styles.error}>{state.error}</p>}
            <button type="submit" className={styles.submitButton} disabled={pending}>{pending ? 'Надсилаємо…' : 'Оформити замовлення'}</button>

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
                    {' '}
                    {item.price}
                    {' '}
                    грн
                  </p>

                </div>

              ))}

            </div>

            <div className={styles.total}>
              Разом:
              {' '}
              {totalPrice}
              {' '}
              грн
            </div>

          </div>

        </div>

        )}

      </div>

    </main>
  );
}
