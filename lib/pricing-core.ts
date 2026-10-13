export const COIL_WIDTH_METERS = 1.25;
export const STEEL_DENSITY_KG_M3 = 7850;
export const DEFAULT_MANUFACTURING_MARKUP = 20;
export const DEFAULT_PARTNER_MARKUP = 18;

export type CoilPriceUnit = 'PER_KG' | 'PER_LINEAR_METER' | 'PER_SQUARE_METER';

export function coilKgPerLinearMeter(thicknessMm: number, widthMeters = COIL_WIDTH_METERS) {
  return widthMeters * (thicknessMm / 1000) * STEEL_DENSITY_KG_M3;
}

export function normalizeCoilPurchasePrice(args: {
  unit: CoilPriceUnit;
  unitPrice: number;
  thicknessMm: number;
  weightKg: number;
  lengthMeters: number;
  widthMeters?: number;
}) {
  const widthMeters = args.widthMeters ?? COIL_WIDTH_METERS;
  const kgPerMeter = coilKgPerLinearMeter(args.thicknessMm, widthMeters);
  const pricePerKg = args.unit === 'PER_KG'
    ? args.unitPrice
    : args.unit === 'PER_LINEAR_METER'
      ? args.unitPrice / kgPerMeter
      : (args.unitPrice * widthMeters) / kgPerMeter;
  const pricePerMeter = pricePerKg * kgPerMeter;
  const pricePerSquareMeter = pricePerMeter / widthMeters;
  const totalPrice = args.unit === 'PER_KG'
    ? args.unitPrice * args.weightKg
    : args.unit === 'PER_LINEAR_METER'
      ? args.unitPrice * args.lengthMeters
      : args.unitPrice * widthMeters * args.lengthMeters;
  return { kgPerMeter, pricePerKg, pricePerMeter, pricePerSquareMeter, totalPrice };
}

export function calculateS10RetailPrice(args: {
  purchasePricePerKg: number;
  thicknessMm: number;
  usefulWidthMeters: number;
  manufacturingMarkupPercent: number;
  coilWidthMeters?: number;
}) {
  const costPerCoilMeter = args.purchasePricePerKg * coilKgPerLinearMeter(args.thicknessMm, args.coilWidthMeters);
  const costPerFinishedSquareMeter = costPerCoilMeter / args.usefulWidthMeters;
  return Math.round(costPerFinishedSquareMeter * (1 + args.manufacturingMarkupPercent / 100) * 100) / 100;
}

export function partnerRetailPrice(basePrice: number, markupPercent: number) {
  return Math.round(basePrice * (1 + markupPercent / 100) * 100) / 100;
}
