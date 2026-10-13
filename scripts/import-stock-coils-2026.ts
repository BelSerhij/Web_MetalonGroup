import { Prisma, PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { calculateS10RetailPrice } from '../lib/pricing-core';

const prisma = new PrismaClient();
const apply = process.argv.includes('--apply');

// Rows without strikethrough in the user's 2026 stock register PDF.
// remainingMeters is read from the sheet's "Залишок м.п." column.
const rows = [
  { code: 'W35', date: '12.09.2025', color: '9003', thickness: 0.45, coating: 'PEMA', zinc: 100, brand: 'Полістіл', weightTons: 0.86, length: 200, totalPaid: 46300, remainingMeters: 4.4 },
  { code: 'W41', date: '13.11.2025', color: '3Д Золотий Дуб 2-ох', thickness: 0.4, coating: 'PEMA', zinc: 100, brand: 'Printech', weightTons: 0.8, length: 200, totalPaid: 48100, remainingMeters: 7.95 },
  { code: 'W50', date: '31.03.2026', color: '9005', thickness: 0.45, coating: 'PEMA', zinc: 100, brand: 'Полістіл', weightTons: 0.86, length: 200, totalPaid: 46900, remainingMeters: 11.2 },
  { code: 'W55', date: '31.03.2026', color: '3005/3005', thickness: 0.45, coating: 'PEMA', zinc: 100, brand: 'Полістіл', weightTons: 0.86, length: 200, totalPaid: 48300, remainingMeters: 20.24 },
  { code: 'W61', date: '05.06.2026', color: 'Темний дуб 3Д 2-ох', thickness: 0.4, coating: 'PEMA', zinc: 100, brand: 'Корея', weightTons: 0.39, length: 100, totalPaid: 27600, remainingMeters: 37.74 },
  { code: 'L68', date: '26.06.2026', color: '7016/7016', thickness: 0.45, coating: 'PEMA', zinc: 100, brand: 'USS', weightTons: 0.26, length: 60, totalPaid: 22800, remainingMeters: 18.7 },
  { code: 'W70', date: '09.07.2026', color: '8017', thickness: 0.45, coating: 'PEMA', zinc: 100, brand: 'Полістіл', weightTons: 1.62, length: 377.3, totalPaid: 94047.7, remainingMeters: 11.42 },
  { code: 'W77', date: '23.07.2026', color: 'Zn', thickness: 0.5, coating: 'Zinc', zinc: 100, brand: 'Україна', weightTons: 1.09, length: 227, totalPaid: 53218, remainingMeters: 12.28 },
  { code: 'W82', date: '13.08.2026', color: '7016', thickness: 0.45, coating: 'РЕМА', zinc: 100, brand: 'Вєтнам', weightTons: 0.27, length: 61.75, totalPaid: 14673, remainingMeters: 17.35 },
  { code: 'W83', date: '27.08.2026', color: '7016', thickness: 0.45, coating: 'РЕМА', zinc: 100, brand: 'Вєтнам', weightTons: 0.86, length: 200, totalPaid: 49400, remainingMeters: 50.6 },
  { code: 'W84', date: '27.08.2026', color: '6020', thickness: 0.45, coating: 'РЕМА', zinc: 100, brand: 'Вєтнам', weightTons: 0.86, length: 200, totalPaid: 49400, remainingMeters: 200 },
  { code: 'W85', date: '27.08.2026', color: '7016/7016', thickness: 0.45, coating: 'РЕМА', zinc: 100, brand: 'Україна', weightTons: 0.86, length: 200, totalPaid: 56400, remainingMeters: 15.05 },
  { code: 'L86', date: '18.08.2026', color: 'Zn', thickness: 0.8, coating: 'Zinc', zinc: 100, brand: 'Україна', weightTons: 0.05, length: 10, totalPaid: 5070, remainingMeters: 6 },
  { code: 'W89', date: '23.08.2026', color: 'Zn', thickness: 0.5, coating: 'Zinc', zinc: 100, brand: 'Україна', weightTons: 0.63, length: 130.4, totalPaid: 32439.2, remainingMeters: 130.4 },
  { code: 'W90', date: '23.08.2026', color: '8004 (гладкий лист)', thickness: 0.45, coating: 'РЕМА', zinc: 100, brand: 'Україна', weightTons: 0.19, length: 40, totalPaid: 11300, remainingMeters: 16 },
  { code: 'L91', date: '18.08.2026', color: 'Zn', thickness: 0.8, coating: 'Zinc', zinc: 100, brand: 'Україна', weightTons: 0.05, length: 10, totalPaid: 5130, remainingMeters: 10 },
  { code: 'W92', date: '08.10.2026', color: '7016', thickness: 0.45, coating: 'РЕМА', zinc: 100, brand: 'Україна', weightTons: 0.89, length: 206.66, totalPaid: 57368.16, remainingMeters: 206.66 },
  { code: 'W93', date: '08.10.2026', color: '8019', thickness: 0.45, coating: 'РЕМА', zinc: 100, brand: 'Україна', weightTons: 0.86, length: 200, totalPaid: 55530, remainingMeters: 7.14 },
  { code: 'W94', date: '08.10.2026', color: 'Zn', thickness: 0.5, coating: 'РЕМА', zinc: 100, brand: 'Україна', weightTons: 0.86, length: 200, totalPaid: 49140, remainingMeters: 200 },
  { code: 'W96', date: '08.10.2026', color: '6005', thickness: 0.45, coating: 'РЕМА', zinc: 100, brand: 'Словак', weightTons: 0.09, length: 20, totalPaid: 7480, remainingMeters: 20 },
];

async function main() {
  const product = await prisma.product.findUnique({ where: { slug: 'profnastyl-s10' } });
  if (!product) throw new Error('У базі немає товару profnastyl-s10');

  const existing = await prisma.metalCoil.findMany({ where: { code: { in: rows.map((row) => row.code) } }, select: { code: true } });
  if (existing.length) throw new Error(`Коди вже існують: ${existing.map((row) => row.code).join(', ')}`);
  if (rows.some((row) => row.remainingMeters <= 0 || row.remainingMeters > row.length)) throw new Error('Залишок має бути додатним і не перевищувати початкову довжину');

  const settings = await prisma.pricingSettings.findUnique({ where: { id: 'default' } });
  const markup = settings ? Number(settings.manufacturingMarkupPercent) : 20;
  const normalized = rows.map((row) => {
    const initialWeight = row.weightTons * 1000;
    const currentWeight = initialWeight * row.remainingMeters / row.length;
    const purchasePricePerKg = row.totalPaid / initialWeight;
    const twoSided = row.color.includes('/') || /2-ох/i.test(row.color);
    return {
      ...row,
      initialWeight,
      currentWeight,
      purchasePricePerKg,
      paintingType: twoSided ? 'TwoSide' : 'OneSide',
      retailPrice: calculateS10RetailPrice({ purchasePricePerKg, thicknessMm: row.thickness, usefulWidthMeters: 1.17, manufacturingMarkupPercent: markup }),
    };
  });

  if (!apply) {
    console.log(JSON.stringify({ mode: 'dry-run', count: normalized.length, remainingMeters: normalized.reduce((sum, row) => sum + row.remainingMeters, 0), skipped: [{ code: 'W95', reason: 'PDF balance is -6.00 m.p.' }], rows: normalized.map(({ code, color, thickness, brand, remainingMeters, retailPrice }) => ({ code, color, thickness, brand, remainingMeters, retailPrice })) }, null, 2));
    return;
  }

  const generatedIds = new Map(normalized.map((row) => [row.code, randomUUID()]));
  const operations: Prisma.PrismaPromise<unknown>[] = normalized.flatMap((row) => {
    const id = generatedIds.get(row.code)!;
    return [
      prisma.metalCoil.create({
        data: {
          id,
          code: row.code,
          color: row.color,
          thickness: row.thickness,
          coating: row.coating,
          paintingType: row.paintingType,
          metalBrand: row.brand,
          zincContent: row.zinc,
          width: 1.25,
          initialWeight: row.initialWeight,
          currentWeight: row.currentWeight,
          initialLength: row.length,
          currentLength: row.remainingMeters,
          purchasePrice: row.totalPaid,
          purchasePricePerKg: row.purchasePricePerKg,
          purchaseUnit: 'PER_KG',
          purchaseUnitPrice: row.purchasePricePerKg,
          productSlug: 'profnastyl-s10',
          status: 'IN_STOCK',
          receivedAt: new Date(`${row.date.split('.').reverse().join('-')}T12:00:00.000Z`),
        },
      }),
      prisma.productVariant.create({
        data: {
          productId: product.id,
          sourceCoilId: id,
          thickness: row.thickness,
          color: row.color,
          coating: row.coating,
          paintingType: row.paintingType,
          metalBrand: row.brand,
          zincContent: row.zinc,
          price: row.retailPrice,
          inStock: true,
        },
      }),
    ];
  });
  await prisma.$transaction(operations);

  console.log(JSON.stringify({ imported: normalized.length, remainingMeters: normalized.reduce((sum, row) => sum + row.remainingMeters, 0), skipped: [{ code: 'W95', reason: 'PDF balance is -6.00 m.p.' }] }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
