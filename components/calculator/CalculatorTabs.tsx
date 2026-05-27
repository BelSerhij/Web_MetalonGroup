'use client';

import { useState } from 'react';

import styles from '@/app/calculator/CalculatorPage.module.css';
import { FenceCalculator } from './FenceCalculator';
import { FacadeCalculator } from './FacadeCalculator';
import { RoofCalculator } from './RoofCalculator';
import { MetalTileCalculator } from './MetalTileCalculator';
import { ShtaketCalculator } from './ShtaketCalculator';
import { Product, ProductVariant,} from '@prisma/client';

const calculatorTypes = [
  'Паркан',
  'Фасад',
  'Дах',
  'Штахет',
];

type ProductWithVariants =
  Product & {
    variants: ProductVariant[];
    };
  
type FencePost = {
  id: string;
  title: string;
  size: string;
  thickness: number;
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

type Props = {
  profnastylProducts:
    ProductWithVariants[];
  shtaketProducts:
    ProductWithVariants[];
  metalTileProducts:
    ProductWithVariants[];
  
  posts: FencePost[];
  lags: FenceLag[];
  screws: FenceScrew[];
};

export const CalculatorTabs = ({
  profnastylProducts,
  shtaketProducts,
  metalTileProducts,
  
  posts,
  lags,
  screws,
}: Props) => {
    

  const [activeType, setActiveType] =
    useState('Паркан');

  return (
    <main className={styles.page}>

      <div className="container">

        <h1 className={styles.title}>
          Калькулятор
        </h1>

        <div className={styles.tabs}>

          {calculatorTypes.map((type) => (

            <button
              key={type}
              onClick={() =>
                setActiveType(type)
              }
              className={`
                ${styles.tab}

                ${
                  activeType === type
                    ? styles.active
                    : ''
                }
              `}
            >
              {type}
            </button>

          ))}

        </div>

        <div className={styles.content}>

          {activeType === 'Паркан' && (
            <FenceCalculator
                products={profnastylProducts}
                posts={posts}
                lags={lags}
                screws={screws}
            />
          )}

          {activeType === 'Фасад' && (
            <FacadeCalculator />
          )}

          {activeType === 'Дах' && (
            <RoofCalculator />
          )}

          {activeType ===
            'Металочерепиця' && (
            <MetalTileCalculator
              products={metalTileProducts}
            />
          )}

          {activeType === 'Штахет' && (
            <ShtaketCalculator
            products={shtaketProducts}
            />
          )}

        </div>

      </div>

    </main>
  );
};