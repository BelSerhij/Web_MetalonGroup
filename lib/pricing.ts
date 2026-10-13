import { prisma } from '@/lib/prisma';
import { DEFAULT_MANUFACTURING_MARKUP, DEFAULT_PARTNER_MARKUP } from '@/lib/pricing-core';

export {
  COIL_WIDTH_METERS,
  STEEL_DENSITY_KG_M3,
  DEFAULT_MANUFACTURING_MARKUP,
  DEFAULT_PARTNER_MARKUP,
  coilKgPerLinearMeter,
  normalizeCoilPurchasePrice,
  calculateS10RetailPrice,
  partnerRetailPrice,
} from '@/lib/pricing-core';
export type { CoilPriceUnit } from '@/lib/pricing-core';

export async function getPricingSettings() {
  const settings = await prisma.pricingSettings.findUnique({ where: { id: 'default' } });
  return {
    manufacturingMarkupPercent: settings ? Number(settings.manufacturingMarkupPercent) : DEFAULT_MANUFACTURING_MARKUP,
    partnerMarkupPercent: settings ? Number(settings.partnerMarkupPercent) : DEFAULT_PARTNER_MARKUP,
  };
}
