'use client';

import { useMemo, useState } from 'react';

import styles from './FenceCalculator.module.css';

type Variant = {
  id: string;
  thickness: number;
  color: string;
  coating: string;
  paintingType: string;
  metalBrand: string;
  zincContent: number;
  price: number;
};

type FencePost = {
  id: string;
  title: string;
  length: number;
  price: number;
};

type FenceLag = {
  id: string;
  title: string;
  length: number;
  price: number;
};

type FenceScrew = {
  id: string;
  title: string;
  price: number;
};

type Product = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image: string;
  usefulWidth: number;
  fullWidth: number;
  variants: Variant[];
};

type Props = {
  products: Product[];
  posts: FencePost[];
  lags: FenceLag[];
  screws: FenceScrew[];
};

export const FenceCalculator = ({
    products,
  posts,
  lags,
  screws,
}: Props) => {

const [selectedId, setSelectedId] =
    useState(products[0]?.id);

 const selectedProduct =
    products.find(
      (product) =>
        product.id === selectedId
    ) || products[0];

const allThicknesses = [
  ...new Set(
    selectedProduct.variants.map(
      (variant) =>
        variant.thickness
    )
  ),
];
    
  const [thickness, setThickness] = useState<number | null>(allThicknesses[0]);
  const [color, setColor] = useState('');
  const [coating, setCoating] = useState('');
  const [paintingType, setPaintingType,] = useState('');
  const [metalBrand, setMetalBrand] = useState('');   
  const [selectedPostId, setSelectedPostId] = useState(posts[0]?.id);
  const [selectedLagId, setSelectedLagId] = useState(lags[0]?.id);
  const [selectedScrewId, setSelectedScrewId] = useState(screws[0]?.id);

    const availableColors = [
    ...new Set(
        selectedProduct.variants
        .filter(
            (variant) =>
            variant.thickness ===
                thickness
        )
        .map(
            (variant) =>
            variant.color
        )
    ),
    ];

    const availableCoatings = [
    ...new Set(
        selectedProduct.variants
        .filter(
            (variant) =>
            variant.thickness ===
                thickness &&
            variant.color ===
                color
        )
        .map(
            (variant) =>
            variant.coating
        )
    ),
    ];

    const availablePaintingTypes = [
    ...new Set(
        selectedProduct.variants
        .filter(
            (variant) =>
            variant.thickness ===
                thickness &&
            variant.color ===
                color &&
            variant.coating ===
                coating
        )
        .map(
            (variant) =>
            variant.paintingType
        )
    ),
    ];

    const availableBrands = [
  ...new Set(
    selectedProduct.variants
      .filter(
        (variant) =>
          (!thickness ||
            variant.thickness ===
              thickness) &&
          (!color ||
            variant.color ===
              color) &&
          (!coating ||
            variant.coating ===
              coating) &&
          (!paintingType ||
            variant.paintingType ===
              paintingType)
      )
      .map(
        (variant) =>
          variant.metalBrand
      )
  ),
    ];

const selectedPost = posts.find((item) => item.id === selectedPostId) || posts[0];
const selectedLag = lags.find((item) => item.id === selectedLagId) || lags[0];
const selectedScrew = screws.find((item) => item.id === selectedScrewId) || screws[0];

    const activeBrand = metalBrand || availableBrands[0] || '';
    const selectedVariant = selectedProduct.variants.find(
        (variant) =>
        (!thickness || variant.thickness === thickness) &&
        (!color || variant.color === color) &&
        (!coating || variant.coating === coating) &&
        (!paintingType || variant.paintingType === paintingType) &&
        (!activeBrand || variant.metalBrand === activeBrand)
    );

  const sheetPrice = selectedVariant?.price || 0;
  const sheetWidth = selectedProduct.usefulWidth || 1.16;
  const fullWidth = selectedProduct.fullWidth || 1.2;
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const widthNum = Number(width);
  const heightNum = Number(height);

  const calculations =
    useMemo(() => {

      if (
        !widthNum ||
        !heightNum
      ) {
        return {
          area: 0,
          sheets: 0,
          posts: 0,
          lags: 0,
          screws: 0,
          total: 0,
          sheetPriceTotal: 0,
          postsTotal: 0,
          lagsTotal: 0,
          screwsTotal: 0,
          lagPieces: 0,
        };
      }
        
      const area = widthNum * heightNum;
      const sheets = Math.ceil(widthNum / sheetWidth);
      const postsCount = Math.ceil(widthNum / 2.5) + 1;
      const lagRows = heightNum > 2 ? 3 : 2;
      const lags = Math.ceil(widthNum) * lagRows;
      const screws = Math.ceil(area * 6);
      const sheetPriceTotal = sheetPrice * fullWidth * heightNum;
      const profnastylTotal = sheets * sheetPriceTotal;
    const postsTotal = postsCount * (heightNum + 0.5) * selectedPost.price;
    const lagPieces = Math.ceil(lags / selectedLag.length);
    const lagsTotal = lagPieces * selectedLag.price;
    const screwsTotal = screws * selectedScrew.price;
    const total = profnastylTotal + postsTotal + lagsTotal + screwsTotal;

      return {
        area,
        sheets,
        posts: postsCount,
        lags,
        screws,
        total,
  postsTotal,
  lagsTotal,
  screwsTotal,
        sheetPriceTotal,
        lagPieces,
      };

    }, [
      widthNum,
      heightNum,
      sheetWidth,
      fullWidth,
      sheetPrice,
      selectedPost,
      selectedLag,
      selectedScrew,
    ]);



  if (!products.length) {
    return (
      <div>
        Немає товарів
      </div>
    );
  }

  return (
<div className={styles.wrapper}>
      {/* FORM */}
    <div className={styles.form}>
        <h2>Параметри паркану</h2>
              
        {/* INPUTS */}
        <input type="number" placeholder="Довжина паркану (м)" value={width}
          onChange={(e) =>setWidth(e.target.value)}
        />
        <input type="number" placeholder="Висота паркану (м)" value={height}
          onChange={(e) => setHeight(e.target.value)}
        />
              

        {/* PRODUCT */}
        <div className={styles.thicknessBlock}>
        <p className={styles.label}>Тип профілю</p>
        <div className={styles.thicknessTabs}>
            {products.map((product) => (
                <button key={product.id}type="button"
                onClick={() => {setSelectedId(product.id);
                    setColor('');
                    setCoating('');
                    setPaintingType('');
                    setMetalBrand('');
                    
                    setThickness(product.variants[0]?.thickness || null);
                }}
                className={`${styles.thicknessTab}
                    ${selectedId === product.id ? styles.activeThickness : ''}`}
                >
                {product.title}
                </button>
            )
            )}
        </div>
        </div>


        {/* THICKNESS */}
        <div className={styles.thicknessBlock}>
          <p className={styles.label}>Товщина</p>
          <div className={styles.thicknessTabs}>
            {allThicknesses.map(
              (item) => (
                <button key={item} type="button"
                    onClick={() => {
                        setThickness(item);
                        setColor('');
                        setCoating('');
                        setPaintingType('');
                        setMetalBrand('');
                        }}
                    className={`${styles.thicknessTab} ${
                    thickness === item
                    ? styles.activeThickness
                     : ''
                    }`}
                >
                  {item} мм
                </button>
              )
            )}
            </div>
        </div>

        {/* COLORS */}
        <div className={styles.colorBlock}>
        <p className={styles.label}>Колір</p>
        <div className={styles.colors}>
            {[...new Set(selectedProduct.variants.map((variant) => variant.color)),].map(
                (item) => (
                <button key={item} type="button"
                disabled={!availableColors.includes(item)}
                onClick={() => setColor(item)}
                className={`${styles.colorButton}
                    ${item === 'RAL 7016' ? styles.color7016 : ''}
                    ${item === 'RAL 8017' ? styles.color8017 : ''}
                    ${item === 'RAL 6005' ? styles.color6005 : ''}
                    ${item === 'RAL 7024' ? styles.color7024 : ''}
                    ${item === 'Цинк' ? styles.colorZinc : ''}
                    ${color === item ? styles.activeColor : ''}
                    ${!availableColors.includes(item) ? styles.disabledButton : ''}`}
                >
                {item}
                </button>

            ))
            }
        </div>
        </div>

        {/* COATING */}
        <div className={styles.colorBlock}>
          <p className={styles.label}>Покриття</p>
          <div className={styles.colors}>
            {[...new Set(selectedProduct.variants.map((variant) => variant.coating)),].map(
              (item) => (
                <button key={item} type="button"
                disabled={!availableCoatings.includes(item)}
                onClick={() => setCoating(item)}
                className={`${styles.coatingButton}
                    ${item === 'Matt' ? styles.matt : styles.gloss}
                    ${coating === item ? styles.activeColor : ''}
                    ${!availableCoatings.includes(item) ? styles.disabledButton : ''}`}
                >
                {item}
                </button>
              )
            )}
            </div>
        </div>

        {/* PAINTING */}
        <div className={styles.colorBlock}>
          <p className={styles.label}>Фарбування</p>
          <div className={styles.colors}>
            {[...new Set(selectedProduct.variants.map((variant) => variant.paintingType))].map(
              (item) => (
                <button key={item} type="button"
                disabled={!availablePaintingTypes.includes(item)}
                onClick={() => setPaintingType(item)}
                className={`${styles.paintingButton}
                    ${paintingType === item ? styles.activePainting : ''}
                    ${!availablePaintingTypes.includes(item) ? styles.disabledButton : ''}`}
                >
                {item === 'TwoSide' ? 'Двостороннє' : 'Одностороннє'}
                </button>
              )
            )}
          </div>
        </div>
              

        {/* METAL BRAND */}

        <div className={styles.colorBlock}>
        <p className={styles.label}>Виробник металу</p>
        <div className={styles.colors}>
            {availableBrands.map((item) => (
                <button key={item} type="button"
                onClick={() => setMetalBrand(item)}
                className={`${styles.paintingButton}
                    ${activeBrand === item ? styles.activePainting : ''}`}
                >
                {item}
                </button>
            )
            )}
        </div>
        </div>              
    </div>


      {/* RESULT */}
    <div className={styles.result}>
        <div className={styles.card}>
          <p>Площа</p>
            <h3> {calculations.area.toFixed(2)} {' '} м²</h3>
            <p>{calculations.area !== 0 && <>{sheetPrice} {' '} грн/м²</>}</p>
        </div>

        <div className={styles.card}>
          <p>Листи</p>
          <h3>{calculations.sheets} {' '} шт</h3>
          <p>{calculations.sheetPriceTotal.toFixed(0)} {' '} грн за лист</p>
        </div>


            <div className={styles.card}>
                <div className={styles.PSelect}> 
                    <p>Стовпи</p>
                    <select value={selectedPostId}
                        onChange={(e) => setSelectedPostId(e.target.value)}
                        className={styles.select}
                        >
                        {posts.map((item) => (
                        <option key={item.id} value={item.id}>{item.title}</option>
                        ))}
                    </select>
                </div>  
                <h3>{calculations.posts} шт по {heightNum + 0.5} м.п</h3>
                <span>{selectedPost.price}{' '}грн за м.п</span>
            </div>
              
            <div className={styles.card}>
                <div className={styles.PSelect}> 
                  <p>Лаги</p>
                    <select value={selectedLagId} 
                        onChange={(e) => setSelectedLagId(e.target.value)}
                        className={styles.select}
                    >
                    {lags.map((item) => (
                    <option key={item.id} value={item.id}>{item.title}</option>
                    ))}
                    </select>
                </div>
                <h3>{calculations.lags} м.п.</h3>
                <span>{selectedLag.price}{' '}грн за м.п</span>
            </div>
              
            <div className={styles.card}>
                <div className={styles.PSelect}> 
                    <p>Саморізи</p>
                    <select value={selectedScrewId}
                        onChange={(e) => setSelectedScrewId(e.target.value)}
                        className={styles.select}
                        >
                        {screws.map((item) => (
                        <option key={item.id} value={item.id}>{item.title}</option>
                        ))}
                      </select>
                </div>
                <h3>{calculations.screws} шт</h3>
                <span>{selectedScrew.price}{' '}грн за шт</span>
            </div>
              

        <div className={styles.card}>
          <p>Вартість</p>
                <h3>{calculations.total.toFixed(0)} {' '} грн</h3>
                <p>{calculations.total !== 0 && <>Включно з усіма матеріалами</>}</p>
        </div>
          </div>
  </div>
  );
};