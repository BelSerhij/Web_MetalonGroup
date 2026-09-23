'use client';

import { useMemo, useState } from 'react';

import { useCartStore } from '@/store/cart-store';

import styles from './ProductConfigurator.module.css';

const RAL_COLORS: Record<string, string> = {
  'RAL 1014': '#ddc88f',
  'RAL 3005': '#5e2129',
  'RAL 3011': '#9b111e',
  'RAL 5005': '#005387',
  'RAL 6005': '#114232',
  'RAL 7016': '#383e42',
  'RAL 7024': '#4c5356',
  'RAL 8004': '#8b4513',
  'RAL 8017': '#442f29',
  'RAL 8019': '#3d3735',
  'RAL 9002': '#e6e1d9',
  'RAL 9003': '#f4f4f0',
  'RAL 9010': '#ffffff',

  Цинк: '#b5b5b5',
};

const RAL_NAMES: Record<string, string> = {
  'RAL 1014': 'Слонова кістка',
  'RAL 3005': 'Вишневий',
  'RAL 3011': 'Червоний',
  'RAL 5005': 'Синій',
  'RAL 6005': 'Зелений мох',
  'RAL 7016': 'Антрацит',
  'RAL 7024': 'Графіт',
  'RAL 8004': 'Мідний',
  'RAL 8017': 'Шоколад',
  'RAL 8019': 'Темно-коричневий',
  'RAL 9002': 'Світло-сірий',
  'RAL 9003': 'Сигнальний білий',
  'RAL 9010': 'Білий',

  Цинк: 'Оцинкований',
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
  slug: string;
  image: string;
  unit: string;
  usefulWidth: number;
  variants: Variant[];
};

type Props = {
  product: Product;
};

export const ProductConfigurator = ({
  product,
}: Props) => {
  const addToCart = useCartStore(
    (state) => state.addToCart
  );

  const variants = product.variants;

  /*
   * Перший доступний варіант.
   *
   * Спочатку шукаємо товар в наявності.
   * Якщо нічого немає в наявності —
   * беремо перший доступний variant.
   */

  const firstAvailableVariant =
    variants.find(
      (variant) => variant.inStock
    ) ?? variants[0];

  const [selectedColor, setSelectedColor] =
    useState(
      firstAvailableVariant?.color ?? ''
    );

  const [selectedThickness, setSelectedThickness] =
    useState(
      firstAvailableVariant?.thickness ?? 0
    );

  const [selectedMetalBrand, setSelectedMetalBrand] =
    useState(
      firstAvailableVariant?.metalBrand ?? ''
    );

  const [sheetCount, setSheetCount] = useState(1);
  const [sheetLength, setSheetLength] = useState(1);

  /*
   * Отримуємо всі кольори,
   * які реально існують у базі.
   *
   * Спочатку:
   * - кольори в наявності
   *
   * Потім:
   * - кольори під замовлення
   */

  const colors = useMemo(() => {
    const uniqueColors = [
      ...new Set(
        variants.map(
          (variant) => variant.color
        )
      ),
    ];

    const availableColors =
      uniqueColors.filter(
        (color) =>
          variants.some(
            (variant) =>
              variant.color === color &&
              variant.inStock
          )
      );

    const orderColors =
      uniqueColors.filter(
        (color) =>
          !availableColors.includes(color)
      );

    return [
      ...availableColors,
      ...orderColors,
    ];
  }, [variants]);

  /*
   * Товщини для вибраного кольору.
   */

  const thicknesses = useMemo(() => {
    const thicknessValues = [
      ...new Set(
        variants
          .filter(
            (variant) =>
              variant.color === selectedColor
          )
          .map(
            (variant) =>
              variant.thickness
          )
      ),
    ];

    return thicknessValues.sort(
      (a, b) => a - b
    );
  }, [
    variants,
    selectedColor,
  ]);

  /*
   * Виробники металу
   * для вибраного:
   *
   * Колір + Товщина
   */

  const metalBrands = useMemo(() => {
    const brands = [
      ...new Set(
        variants
          .filter(
            (variant) =>
              variant.color === selectedColor &&
              variant.thickness ===
                selectedThickness
          )
          .map(
            (variant) =>
              variant.metalBrand
          )
      ),
    ];

    /*
     * Спочатку виробники,
     * у яких товар є в наявності.
     */

    const availableBrands =
      brands.filter(
        (brand) =>
          variants.some(
            (variant) =>
              variant.color === selectedColor &&
              variant.thickness ===
                selectedThickness &&
              variant.metalBrand === brand &&
              variant.inStock
          )
      );

    const orderBrands =
      brands.filter(
        (brand) =>
          !availableBrands.includes(brand)
      );

    return [
      ...availableBrands,
      ...orderBrands,
    ];
  }, [
    variants,
    selectedColor,
    selectedThickness,
  ]);

  /*
   * Поточний вибраний variant.
   *
   * Спочатку шукаємо
   * варіант в наявності.
   *
   * Якщо немає —
   * беремо під замовлення.
   */

  const selectedVariant =
    variants.find(
      (variant) =>
        variant.color === selectedColor &&
        variant.thickness ===
          selectedThickness &&
        variant.metalBrand ===
          selectedMetalBrand &&
        variant.inStock
    ) ??
    variants.find(
      (variant) =>
        variant.color === selectedColor &&
        variant.thickness ===
          selectedThickness &&
        variant.metalBrand ===
          selectedMetalBrand
    );

  /*
   * Загальна ціна.
   */

  const totalMeters = sheetCount * sheetLength;
  const totalArea = totalMeters * product.usefulWidth;
  const totalPrice = selectedVariant
    ? selectedVariant.price * (product.unit === 'м²' ? totalArea : totalMeters)
    : 0;

  /*
   * Зміна кольору.
   *
   * Автоматично вибираємо:
   * 1. Variant в наявності
   * 2. Якщо немає — перший variant
   *
   * Також оновлюємо:
   * - товщину
   * - виробника
   */

  const handleColorChange = (
    color: string
  ) => {
    setSelectedColor(color);

    const firstVariant =
      variants.find(
        (variant) =>
          variant.color === color &&
          variant.inStock
      ) ??
      variants.find(
        (variant) =>
          variant.color === color
      );

    if (!firstVariant) {
      setSelectedThickness(0);
      setSelectedMetalBrand('');

      return;
    }

    setSelectedThickness(
      firstVariant.thickness
    );

    setSelectedMetalBrand(
      firstVariant.metalBrand
    );
  };

  /*
   * Зміна товщини.
   *
   * Автоматично вибираємо
   * виробника.
   */

  const handleThicknessChange = (
    thickness: number
  ) => {
    setSelectedThickness(thickness);

    const firstVariant =
      variants.find(
        (variant) =>
          variant.color ===
            selectedColor &&
          variant.thickness ===
            thickness &&
          variant.inStock
      ) ??
      variants.find(
        (variant) =>
          variant.color ===
            selectedColor &&
          variant.thickness ===
            thickness
      );

    if (!firstVariant) {
      setSelectedMetalBrand('');

      return;
    }

    setSelectedMetalBrand(
      firstVariant.metalBrand
    );
  };

  /*
   * Зміна виробника.
   */

  const handleMetalBrandChange = (
    brand: string
  ) => {
    setSelectedMetalBrand(brand);
  };

  /*
   * Додавання товару в кошик.
   */

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    addToCart({
      id: selectedVariant.id,
      cartId: `${selectedVariant.id}:${sheetLength}`,

      title:
        `${product.title} — ` +
        `${selectedVariant.color}, ` +
        `${selectedVariant.thickness} мм, ` +
        `${selectedVariant.metalBrand}`,

      price: selectedVariant.price,

      image: product.image,

      slug: product.slug,

      unit: product.unit,

      quantity: sheetCount,
      length: sheetLength,
      meters: totalMeters,
      area: totalArea,
      total: totalPrice,
    });
  };

  return (
    <div className={styles.configurator}>
      <h3 className={styles.title}>
        Оберіть параметри
      </h3>

      {/* =========================
          КОЛІР
      ========================= */}

      {colors.length > 0 && (
        <div className={styles.group}>
          <span className={styles.label}>
            Колір
          </span>

          <div className={styles.colorGrid}>
            {colors.map((color) => {
              const isInStock =
                variants.some(
                  (variant) =>
                    variant.color === color &&
                    variant.inStock
                );

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() =>
                    handleColorChange(color)
                  }
                  className={`
                    ${styles.colorCard}
                    ${
                      selectedColor === color
                        ? styles.colorCardActive
                        : ''
                    }
                  `}
                  aria-label={
                    `Обрати колір ${color}`
                  }
                >
                  <span
                    className={
                      styles.colorPreview
                    }
                    style={{
                      backgroundColor:
                        RAL_COLORS[color] ??
                        '#cccccc',
                    }}
                  />

                  <div
                    className={
                      styles.colorInfo
                    }
                  >
                    <span
                      className={
                        styles.colorCode
                      }
                    >
                      {color}
                    </span>

                    <span
                      className={
                        styles.colorName
                      }
                    >
                      {RAL_NAMES[color] ??
                        color}
                    </span>

                    <span
                      className={
                        isInStock
                          ? styles.inStock
                          : styles.toOrder
                      }
                    >
                      {isInStock
                        ? 'В наявності'
                        : 'Під замовлення'}
                    </span>
                  </div>

                  {selectedColor === color && (
                    <span
                      className={
                        styles.check
                      }
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================
          ТОВЩИНА
      ========================= */}

      {thicknesses.length > 0 && (
        <div className={styles.group}>
          <span className={styles.label}>
            Товщина металу
          </span>

          <div className={styles.options}>
            {thicknesses.map(
              (thickness) => {
                const thicknessInStock =
                  variants.some(
                    (variant) =>
                      variant.color ===
                        selectedColor &&
                      variant.thickness ===
                        thickness &&
                      variant.inStock
                  );

                return (
                  <button
                    key={thickness}
                    type="button"
                    onClick={() =>
                      handleThicknessChange(
                        thickness
                      )
                    }
                    className={`
                      ${styles.option}
                      ${
                        selectedThickness ===
                          thickness
                          ? styles.optionActive
                          : ''
                      }
                      ${
                        !thicknessInStock
                          ? styles.optionToOrder
                          : ''
                      }
                    `}
                  >
                    {thickness} мм

                    {!thicknessInStock && (
                      <span
                        className={
                          styles.optionStatus
                        }
                      >
                        Під замовлення
                      </span>
                    )}
                  </button>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* =========================
          ВИРОБНИК МЕТАЛУ
      ========================= */}

      {metalBrands.length > 0 && (
        <div className={styles.group}>
          <span className={styles.label}>
            Виробник металу
          </span>

          <div className={styles.options}>
            {metalBrands.map(
              (brand) => {
                const brandInStock =
                  variants.some(
                    (variant) =>
                      variant.color ===
                        selectedColor &&
                      variant.thickness ===
                        selectedThickness &&
                      variant.metalBrand ===
                        brand &&
                      variant.inStock
                  );

                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() =>
                      handleMetalBrandChange(
                        brand
                      )
                    }
                    className={`
                      ${styles.option}
                      ${
                        selectedMetalBrand ===
                          brand
                          ? styles.optionActive
                          : ''
                      }
                      ${
                        !brandInStock
                          ? styles.optionToOrder
                          : ''
                      }
                    `}
                  >
                    {brand}

                    {!brandInStock && (
                      <span
                        className={
                          styles.optionStatus
                        }
                      >
                        Під замовлення
                      </span>
                    )}
                  </button>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* =========================
          ІНФОРМАЦІЯ ПРО МЕТАЛ
      ========================= */}

      {selectedVariant && (
        <div className={styles.info}>
          <div className={styles.infoItem}>
            <span
              className={styles.infoLabel}
            >
              Статус
            </span>

            <span
              className={
                selectedVariant.inStock
                  ? styles.inStock
                  : styles.toOrder
              }
            >
              {selectedVariant.inStock
                ? 'В наявності'
                : 'Під замовлення'}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span
              className={styles.infoLabel}
            >
              Покриття
            </span>

            <span
              className={styles.infoValue}
            >
              {selectedVariant.coating}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span
              className={styles.infoLabel}
            >
              Тип поверхні
            </span>

            <span
              className={styles.infoValue}
            >
              {selectedVariant.paintingType}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span
              className={styles.infoLabel}
            >
              Виробник
            </span>

            <span
              className={styles.infoValue}
            >
              {selectedVariant.metalBrand}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span
              className={styles.infoLabel}
            >
              Цинкове покриття
            </span>

            <span
              className={styles.infoValue}
            >
              {selectedVariant.zincContent}{' '}
              г/м²
            </span>
          </div>
        </div>
      )}

      {/* =========================
          КІЛЬКІСТЬ
      ========================= */}

      <div className={styles.group}>
        <span className={styles.label}>
          Кількість листів
        </span>

        <div
          className={
            styles.quantityWrapper
          }
        >
          <div
            className={
              styles.quantity
            }
          >
            <button
              type="button"
              className={
                styles.quantityButton
              }
              onClick={() =>
                setSheetCount((prev) =>
                  Math.max(
                    1,
                    prev - 1
                  )
                )
              }
            >
              −
            </button>

            <input
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              className={
                styles.quantityValue
              }
              value={sheetCount}
              onChange={(event) => {
                const value = Number(event.target.value);
                setSheetCount(Number.isInteger(value) && value > 0 ? value : 1);
              }}
              aria-label="Кількість листів"
            />

            <button
              type="button"
              className={
                styles.quantityButton
              }
              onClick={() =>
                setSheetCount(
                  (prev) => prev + 1
                )
              }
            >
              +
            </button>
          </div>

          <span>
            шт.
          </span>
        </div>
      </div>

      <div className={styles.group}>
        <label className={styles.label} htmlFor="sheet-length">Висота листа, м</label>
        <input id="sheet-length" className={styles.lengthInput} type="number" min="0.1" step="0.01" value={sheetLength} onChange={(event) => {
          const value = Number(event.target.value);
          setSheetLength(Number.isFinite(value) && value > 0 ? value : 0.1);
        }} />
        <span className={styles.calculation}>Разом: {totalMeters.toFixed(2)} м.п. · {totalArea.toFixed(2)} м²</span>
      </div>

      {/* =========================
          ЗАГАЛЬНА ЦІНА
      ========================= */}

      <div className={styles.total}>
        <span
          className={
            styles.totalLabel
          }
        >
          Разом:
        </span>

        <span
          className={
            styles.totalPrice
          }
        >
          {totalPrice.toLocaleString(
            'uk-UA'
          )}{' '}
          грн
        </span>
      </div>

      {/* =========================
          ДОДАТИ В КОШИК
      ========================= */}

      <button
        type="button"
        onClick={handleAddToCart}
        className={styles.addButton}
        disabled={!selectedVariant}
      >
        {selectedVariant
          ? 'Додати в кошик'
          : 'Варіант недоступний'}
      </button>
    </div>
  );
};
