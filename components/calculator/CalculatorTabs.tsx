'use client';

import { useState } from 'react';

import styles from '@/app/(site)/calculator/CalculatorPage.module.css';

import { FenceCalculator } from './FenceCalculator';
import { FacadeCalculator } from './FacadeCalculator';
import { RoofCalculator } from './RoofCalculator';
import { MetalTileCalculator } from './MetalTileCalculator';
import { ShtaketCalculator } from './ShtaketCalculator';

export type CalculatorVariant = {
  id: string;
  productId: string;

  thickness: number;
  color: string;
  coating: string;
  paintingType: string;
  metalBrand: string;
  zincContent: number;

  price: number;

  inStock: boolean;
};

export type CalculatorProduct = {
  id: string;

  title: string;

  slug: string;

  description: string | null;

  category: string;

  image: string;

  unit: string;

  usefulWidth: number;

  fullWidth: number;

  variants: CalculatorVariant[];
};

export type FencePost = {
  id: string;
  title: string;
  size: string;
  thickness: number;
  length: number;
  price: number;
};

export type FenceLag = {
  id: string;
  title: string;
  size: string;
  thickness: number;
  length: number;
  price: number;
};

export type FenceScrew = {
  id: string;
  title: string;
  size: string;
  price: number;
};

const calculatorTypes = [
  'Паркан',
  'Фасад',
  'Дах',
  'Металочерепиця',
  'Штахет',
] as const;

type CalculatorType =
  (typeof calculatorTypes)[number];

type Props = {
  profnastylProducts: CalculatorProduct[];
  shtaketProducts: CalculatorProduct[];
  metalTileProducts: CalculatorProduct[];

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
    useState<CalculatorType>('Паркан');

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
              type="button"
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