'use client';

import { useState } from 'react';
import Link from 'next/link';

import {
  Plus,
  Trash2,
} from 'lucide-react';

import {
  createOrder,
} from '@/app/admin/orders/actions';

type Customer = {
  id: string;
  name: string;
  phone: string | null;
  companyName: string | null;
};

type Variant = {
  id: string;
  thickness: number;
  color: string;
  coating: string;
  paintingType: string;
  metalBrand: string;
  zincContent: number;
  price: number;
  inStock: boolean;
};

type Product = {
  id: string;
  title: string;
  unit: string;
  variants: Variant[];
};

type SheetItem = {
  id: number;
  quantity: number;
  length: number | '';
};

type OrderFormProps = {
  customers: Customer[];
  products: Product[];
};

export default function OrderForm({
  customers,
  products,
}: OrderFormProps) {
  const [customerId, setCustomerId] =
    useState('');

  const [productId, setProductId] =
    useState('');

  const [variantId, setVariantId] =
    useState('');

  const [price, setPrice] =
    useState(0);

  const [note, setNote] =
    useState('');

  const [sheetItems, setSheetItems] =
    useState<SheetItem[]>([
      {
        id: Date.now(),
        quantity: 1,
        length: '',
      },
    ]);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const selectedProduct =
    products.find(
      (product) =>
        product.id === productId
    );

  const selectedVariant =
    selectedProduct?.variants.find(
      (variant) =>
        variant.id === variantId
    );

  const handleProductChange = (
    newProductId: string
  ) => {
    setProductId(newProductId);

    setVariantId('');

    setPrice(0);
  };

  const handleVariantChange = (
    newVariantId: string
  ) => {
    setVariantId(newVariantId);

    const product =
      products.find(
        (product) =>
          product.id === productId
      );

    const variant =
      product?.variants.find(
        (variant) =>
          variant.id === newVariantId
      );

    setPrice(
      Number(variant?.price ?? 0)
    );
  };

  const updateSheetItem = (
    id: number,
    field: 'quantity' | 'length',
    value: number | ''
  ) => {
    setSheetItems(
      (currentItems) =>
        currentItems.map((item) =>
          item.id === id
            ? {
                ...item,
                [field]: value,
              }
            : item
        )
    );
  };

  const addSheetItem = () => {
    setSheetItems(
      (currentItems) => [
        ...currentItems,
        {
          id:
            Date.now() +
            Math.floor(
              Math.random() * 1000
            ),
          quantity: 1,
          length: '',
        },
      ]
    );
  };

  const removeSheetItem = (
    id: number
  ) => {
    if (sheetItems.length === 1) {
      return;
    }

    setSheetItems(
      (currentItems) =>
        currentItems.filter(
          (item) =>
            item.id !== id
        )
    );
  };

  const totalSheets =
    sheetItems.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 0),
      0
    );

  const totalLength =
    sheetItems.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 0) *
          Number(item.length || 0),
      0
    );

  const totalAmount =
    totalLength *
    Number(price || 0);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!productId) {
      alert('Оберіть товар');

      return;
    }

    if (!variantId) {
      alert(
        'Оберіть варіант товару'
      );

      return;
    }

    if (
      sheetItems.some(
        (item) =>
          item.quantity <= 0 ||
          item.length === '' ||
          Number(item.length) <= 0
      )
    ) {
      alert(
        'Заповніть кількість та висоту всіх листів'
      );

      return;
    }

    if (price <= 0) {
      alert(
        'Вкажіть ціну за погонний метр'
      );

      return;
    }

    try {
      setIsSubmitting(true);

      await createOrder({
        customerId:
          customerId || null,

        note,

        items: sheetItems.map(
          (item) => ({
            productId,

            variantId,

            quantity:
              Number(item.quantity),

            length:
              Number(item.length),

            price:
              Number(price),
          })
        ),
      });
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : 'Помилка при створенні замовлення'
      );

      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="admin-form"
      onSubmit={handleSubmit}
    >
      {/* КЛІЄНТ */}

      <div className="admin-section-card">
        <div className="admin-section-header">
          <div>
            <h2>
              Клієнт
            </h2>

            <p>
              Оберіть клієнта для замовлення
            </p>
          </div>
        </div>

        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label htmlFor="customer">
              Клієнт
            </label>

            <select
              id="customer"
              value={customerId}
              onChange={(event) =>
                setCustomerId(
                  event.target.value
                )
              }
            >
              <option value="">
                Без клієнта
              </option>

              {customers.map(
                (customer) => (
                  <option
                    key={customer.id}
                    value={customer.id}
                  >
                    {customer.name}

                    {customer.phone
                      ? ` — ${customer.phone}`
                      : ''}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </div>

      {/* ТОВАР */}

      <div className="admin-section-card">
        <div className="admin-section-header">
          <div>
            <h2>
              Товар
            </h2>

            <p>
              Оберіть товар та його варіант
            </p>
          </div>
        </div>

        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label>
              Товар
            </label>

            <select
              value={productId}
              onChange={(event) =>
                handleProductChange(
                  event.target.value
                )
              }
            >
              <option value="">
                Оберіть товар
              </option>

              {products.map(
                (product) => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.title}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="admin-form-group">
            <label>
              Варіант товару
            </label>

            <select
              value={variantId}
              disabled={!selectedProduct}
              onChange={(event) =>
                handleVariantChange(
                  event.target.value
                )
              }
            >
              <option value="">
                Оберіть варіант
              </option>

              {selectedProduct?.variants.map(
                (variant) => (
                  <option
                    key={variant.id}
                    value={variant.id}
                  >
                    {variant.color} •{' '}
                    {variant.thickness} мм •{' '}
                    {variant.metalBrand}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {selectedVariant && (
          <div className="admin-order-variant-info">
            <span>
              Колір:{' '}
              {selectedVariant.color}
            </span>

            <span>
              Товщина:{' '}
              {selectedVariant.thickness} мм
            </span>

            <span>
              Покриття:{' '}
              {selectedVariant.coating}
            </span>

            <span>
              Тип фарбування:{' '}
              {
                selectedVariant.paintingType
              }
            </span>

            <span>
              Виробник:{' '}
              {selectedVariant.metalBrand}
            </span>

            <span>
              Цинк:{' '}
              {selectedVariant.zincContent} г/м²
            </span>
          </div>
        )}
      </div>

      {/* РОЗМІРИ ЛИСТІВ */}

      <div className="admin-section-card">
        <div className="admin-section-header">
          <div>
            <h2>
              Розміри листів
            </h2>

            <p>
              Додайте кількість та висоту
              кожної групи листів
            </p>
          </div>

          <button
            type="button"
            className="admin-secondary-button"
            onClick={addSheetItem}
          >
            <Plus size={18} />

            Додати розмір
          </button>
        </div>

        <div className="admin-order-sheets">
          {sheetItems.map(
            (item, index) => {
              const itemLength =
                Number(item.quantity || 0) *
                Number(item.length || 0);

              return (
                <div
                  key={item.id}
                  className="admin-order-sheet-row"
                >
                  <div className="admin-form-group">
                    <label>
                      Кількість листів
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(event) =>
                        updateSheetItem(
                          item.id,
                          'quantity',
                          Number(
                            event.target.value
                          )
                        )
                      }
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>
                      Висота листа, м
                    </label>

                    <input
                      type="number"
                      min="0.1"
                      step="0.01"
                      value={item.length}
                      onChange={(event) =>
                        updateSheetItem(
                          item.id,
                          'length',
                          event.target.value === ''
                            ? ''
                            : Number(
                                event.target.value
                              )
                        )
                      }
                    />
                  </div>

                  <div className="admin-order-sheet-result">
                    <span>
                      Разом
                    </span>

                    <strong>
                      {itemLength.toLocaleString(
                        'uk-UA',
                        {
                          maximumFractionDigits: 2,
                        }
                      )}{' '}
                      м.п.
                    </strong>
                  </div>

                  {sheetItems.length > 1 && (
                    <button
                      type="button"
                      className="admin-danger-button"
                      onClick={() =>
                        removeSheetItem(
                          item.id
                        )
                      }
                    >
                      <Trash2 size={18} />

                      Видалити
                    </button>
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* ВАРТІСТЬ */}

      <div className="admin-section-card">
        <div className="admin-section-header">
          <div>
            <h2>
              Вартість
            </h2>

            <p>
              Ви можете змінити стандартну ціну
            </p>
          </div>
        </div>

        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label>
              Ціна за погонний метр, грн
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) =>
                setPrice(
                  Number(
                    event.target.value
                  )
                )
              }
            />
          </div>

          {selectedVariant && (
            <div className="admin-form-group">
              <label>
                Стандартна ціна
              </label>

              <div className="admin-readonly-value">
                {selectedVariant.price.toLocaleString(
                  'uk-UA'
                )}{' '}
                грн / м.п.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ПІДСУМОК */}

      <div className="admin-order-summary">
        <div>
          <span>
            Загальна кількість листів
          </span>

          <strong>
            {totalSheets.toLocaleString(
              'uk-UA'
            )}{' '}
            шт.
          </strong>
        </div>

        <div>
          <span>
            Загальна кількість метрів
          </span>

          <strong>
            {totalLength.toLocaleString(
              'uk-UA',
              {
                maximumFractionDigits: 2,
              }
            )}{' '}
            м.п.
          </strong>
        </div>

        <div>
          <span>
            Ціна за метр
          </span>

          <strong>
            {Number(price).toLocaleString(
              'uk-UA'
            )}{' '}
            грн
          </strong>
        </div>

        <div className="admin-order-summary-total">
          <span>
            Загальна сума
          </span>

          <strong>
            {totalAmount.toLocaleString(
              'uk-UA',
              {
                maximumFractionDigits: 2,
              }
            )}{' '}
            грн
          </strong>
        </div>
      </div>

      {/* ДОДАТКОВА ІНФОРМАЦІЯ */}

      <div className="admin-section-card">
        <div className="admin-section-header">
          <div>
            <h2>
              Додаткова інформація
            </h2>
          </div>
        </div>

        <div className="admin-form-group">
          <label htmlFor="note">
            Примітка
          </label>

          <textarea
            id="note"
            placeholder="Додаткова інформація щодо замовлення..."
            rows={5}
            value={note}
            onChange={(event) =>
              setNote(
                event.target.value
              )
            }
          />
        </div>
      </div>

      {/* КНОПКИ */}

      <div className="admin-form-actions">
        <Link
          href="/admin/orders"
          className="admin-secondary-button"
        >
          Скасувати
        </Link>

        <button
          type="submit"
          className="admin-primary-button"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Створення...'
            : 'Створити замовлення'}
        </button>
      </div>
    </form>
  );
}