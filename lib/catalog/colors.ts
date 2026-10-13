export type CatalogColor = {
  code: string;
  name: string;
  hex: string;
  finishes: Array<'Gloss' | 'Matt'>;
};

// Names and finish availability transcribed from the customer-provided charts.
export const CATALOG_COLORS: CatalogColor[] = [
  { code: 'RAL 1003', name: 'Жовтий', hex: '#efc900', finishes: ['Gloss'] },
  { code: 'RAL 1015', name: 'Бежевий', hex: '#e9dfc2', finishes: ['Gloss'] },
  { code: 'RAL 3005', name: 'Вишневий', hex: '#641d2d', finishes: ['Gloss', 'Matt'] },
  { code: 'RAL 3009', name: 'Червоно-коричневий', hex: '#793d32', finishes: ['Gloss', 'Matt'] },
  { code: 'RAL 3011', name: 'Червоний', hex: '#8c1d32', finishes: ['Gloss', 'Matt'] },
  { code: 'RAL 5005', name: 'Синій', hex: '#243d7a', finishes: ['Gloss'] },
  { code: 'RAL 5010', name: 'Синій', hex: '#174276', finishes: ['Matt'] },
  { code: 'RAL 6002', name: 'Зелене листя', hex: '#355631', finishes: ['Gloss'] },
  { code: 'RAL 6005', name: 'Зелений бутильний', hex: '#142b22', finishes: ['Gloss', 'Matt'] },
  { code: 'RAL 6020', name: 'Хакі', hex: '#384936', finishes: ['Gloss', 'Matt'] },
  { code: 'RAL 6029', name: 'Зелена м’ята', hex: '#08784b', finishes: ['Gloss'] },
  { code: 'RAL 7016', name: 'Графіт', hex: '#343b3e', finishes: ['Gloss'] },
  { code: 'RAL 7024', name: 'Графіт', hex: '#484d51', finishes: ['Matt'] },
  { code: 'RAL 8003', name: 'Мідний', hex: '#a66346', finishes: ['Gloss'] },
  { code: 'RAL 8004', name: 'Теракот', hex: '#974b37', finishes: ['Gloss', 'Matt'] },
  { code: 'RAL 8017', name: 'Коричневий', hex: '#382420', finishes: ['Gloss', 'Matt'] },
  { code: 'RAL 8019', name: 'Темно-коричневий', hex: '#4a423f', finishes: ['Matt'] },
  { code: 'RAL 9003', name: 'Сніжно-білий', hex: '#f4f3ed', finishes: ['Gloss'] },
  { code: 'RAL 9005', name: 'Чорний', hex: '#171a1c', finishes: ['Matt'] },
  { code: 'RAL 9006', name: 'Срібний', hex: '#b3b3b1', finishes: ['Gloss'] },
  { code: 'RAL 9010', name: 'Молочно-білий', hex: '#f1eee4', finishes: ['Gloss'] },
  { code: 'Камінь', name: 'Камінь', hex: '#866c56', finishes: ['Gloss'] },
  { code: 'Золотий дуб', name: 'Золотий дуб', hex: '#a76d36', finishes: ['Gloss'] },
  { code: 'Алюцинк', name: 'Алюцинк', hex: '#d3d3cf', finishes: ['Gloss'] },
];

export function findCatalogColor(value: string) {
  const normalized = value.toLocaleLowerCase('uk-UA');
  const digits = normalized.match(/\b(\d{4})\b/)?.[1];
  return CATALOG_COLORS.find((color) => {
    const colorDigits = color.code.match(/\b(\d{4})\b/)?.[1];
    return normalized.includes(color.code.toLocaleLowerCase('uk-UA'))
      || color.code.toLocaleLowerCase('uk-UA').includes(normalized)
      || Boolean(digits && colorDigits === digits);
  });
}
