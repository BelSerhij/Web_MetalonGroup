export const CATALOG_MANUFACTURERS = [
  'ArcelorMittal · Німеччина',
  'ArcelorMittal · Польща',
  'USS Steel · Словаччина',
  'Polysteel · Lowen Stahl · Metipol',
  'Вʼєтнам',
  'Корея',
  'Модуль · оцинковка',
] as const;

export function canonicalManufacturer(value: string): string | null {
  if (/arcelor.*(німеч|german|germany)/i.test(value)) return CATALOG_MANUFACTURERS[0];
  if (/arcelor.*(поль|poland|polska)/i.test(value) || /^arcelormittal$/i.test(value.trim())) return CATALOG_MANUFACTURERS[1];
  if (/u\.?\s*s\.?\s*steel|uss steel/i.test(value)) return CATALOG_MANUFACTURERS[2];
  if (/polysteel|lowen|löwen|metipol/i.test(value)) return CATALOG_MANUFACTURERS[3];
  if (/в[єе]тнам|vietnam/i.test(value)) return CATALOG_MANUFACTURERS[4];
  if (/коре|korea|korean/i.test(value)) return CATALOG_MANUFACTURERS[5];
  if (/модуль|module/i.test(value)) return CATALOG_MANUFACTURERS[6];
  return CATALOG_MANUFACTURERS.includes(value as (typeof CATALOG_MANUFACTURERS)[number]) ? value : null;
}

export function canonicalFinish(value: string): string {
  if (/matt|мат|рема|pema/i.test(value)) return 'Matt';
  if (/gloss|глян|^pe$/i.test(value.trim())) return 'Gloss';
  if (/peme/i.test(value)) return 'PEME';
  if (/zinc|цинк|^zn$/i.test(value.trim())) return 'Zinc';
  return value;
}

export function canonicalizeMaterialRates<T extends { metalBrand: string; thickness: unknown; coating: string; paintingType: string; pricePerMeter: unknown }>(rates: T[]) {
  const selected = new Map<string, T & { metalBrand: string }>();
  for (const rate of rates) {
    const metalBrand = canonicalManufacturer(rate.metalBrand);
    if (!metalBrand) continue;
    const coating = canonicalFinish(rate.coating);
    const key = JSON.stringify([metalBrand, Number(rate.thickness), coating, rate.paintingType]);
    const current = selected.get(key);
    const isCanonical = rate.metalBrand === metalBrand && rate.coating === coating;
    const currentCanonical = current?.metalBrand === metalBrand && current.coating === coating;
    if (!current || (isCanonical && !currentCanonical)) selected.set(key, { ...rate, metalBrand, coating });
  }
  return [...selected.values()];
}
