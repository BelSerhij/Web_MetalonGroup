import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import styles from './Catalog.module.css';
import { AddToCartButton } from '@/components/AddToCartButton/AddToCartButton';
import { productSeries } from '@/lib/catalog/series';
import { CATALOG_COLORS } from '@/lib/catalog/colors';
import { canonicalizeMaterialRates, canonicalManufacturer } from '@/lib/catalog/manufacturers';

const filters = ['Всі', 'Профнастил', 'Металочерепиця', 'Паркан', 'Штахет', 'Метал-Сайдинг', 'Ринви', 'Плівки', 'Комплектуючі'];

type Props = { searchParams: Promise<{ category?: string }> };

export default async function CatalogPage({ searchParams }: Props) {
  const { category: selectedCategory } = await searchParams;
  const [records, rates] = await Promise.all([
    prisma.product.findMany({ where: { isVisible: true }, include: { variants: { where: { isVisible: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.materialRate.findMany(),
  ]);
  const activeRates = canonicalizeMaterialRates(rates);
  const recordSlugs = new Set(records.map((product) => product.slug));
  const items = [
    ...productSeries.filter((series) => records.find((product) => product.slug === series.slug)?.isVisible !== false).map((series) => {
      const record = records.find((product) => product.slug === series.slug);
      const fullWidth = series.fullWidth ?? (record ? Number(record.fullWidth) : 1);
      const usefulWidth = series.usefulWidth ?? (record ? Number(record.usefulWidth) : 1);
      const unit = series.unit ?? record?.unit ?? 'м²';
      const priced = activeRates.map((rate) => ({ rate, price: /м²|м2/i.test(unit) ? Number(rate.pricePerMeter) / fullWidth : Number(rate.pricePerMeter) })).filter(({ price }) => Number.isFinite(price) && price > 0);
      const best = priced.sort((a, b) => a.price - b.price)[0];
      const variant = best && record?.variants.find((item) => canonicalManufacturer(item.metalBrand) === best.rate.metalBrand && Number(item.thickness) === Number(best.rate.thickness) && item.coating === best.rate.coating && item.paintingType === best.rate.paintingType);
      return { id: record?.id ?? series.slug, slug: series.slug, title: series.title, category: series.category, image: series.image, unit, fullWidth, usefulWidth, price: best?.price ?? null, variantId: variant?.id, options: best ? { color: CATALOG_COLORS[0]?.code ?? 'RAL 7016', thickness: Number(best.rate.thickness), metalBrand: best.rate.metalBrand, coating: best.rate.coating, paintingType: best.rate.paintingType } : undefined };
    }),
    ...records.filter((product) => !recordSlugs.has(product.slug) && !productSeries.some((series) => series.slug === product.slug)).map((product) => {
      const width = Number(product.fullWidth);
      const ratesForProduct = activeRates.map((rate) => ({ rate, price: /м²|м2/i.test(product.unit) ? Number(rate.pricePerMeter) / width : Number(rate.pricePerMeter) })).filter(({ price }) => Number.isFinite(price) && price > 0);
      const best = ratesForProduct.sort((a, b) => a.price - b.price)[0];
      const variant = best && product.variants.find((item) => canonicalManufacturer(item.metalBrand) === best.rate.metalBrand && Number(item.thickness) === Number(best.rate.thickness) && item.coating === best.rate.coating && item.paintingType === best.rate.paintingType);
      return { id: product.id, slug: product.slug, title: product.title, category: product.category, image: product.image, unit: product.unit, fullWidth: width, usefulWidth: Number(product.usefulWidth), price: best?.price ?? null, variantId: variant?.id, options: best ? { color: CATALOG_COLORS[0]?.code ?? 'RAL 7016', thickness: Number(best.rate.thickness), metalBrand: best.rate.metalBrand, coating: best.rate.coating, paintingType: best.rate.paintingType } : undefined };
    }),
  ].filter((item) => !selectedCategory || selectedCategory === 'Всі' || item.category === selectedCategory);

  return <main className={styles.page}>
    <section className={styles.filters}><div className="container"><div className={styles.filtersWrapper}>{filters.map((item) => {
      const active = item === 'Всі' ? !selectedCategory : selectedCategory === item;
      return <Link key={item} href={item === 'Всі' ? '/catalog' : `/catalog?category=${encodeURIComponent(item)}`} className={`${styles.filterButton} ${active ? styles.filterButtonActive : ''}`}>{item}</Link>;
    })}</div></div></section>
    <section className={styles.products}><div className="container"><div className={styles.grid}>
      {items.map((item) => <article key={item.slug} className={styles.card}>
        <Link href={`/catalog/${item.slug}`} className={styles.imageWrapper} aria-label={`Детальніше: ${item.title}`}><Image src={item.image} alt={`${item.category} ${item.title}`} width={600} height={400} className={styles.image} /></Link>
        <div className={styles.content}>
          <span className={styles.category}>{item.category}</span><h2 className={styles.productTitle}>{item.title}</h2>
          <p className={styles.price}>{item.price !== null ? `від ${item.price.toLocaleString('uk-UA', { maximumFractionDigits: 2 })} грн/${item.unit}` : 'Додайте ціну у прайс-листі'}</p>
          <div className={styles.cardActions}>
            <Link href={`/catalog/${item.slug}`} className={styles.detailsButton}>Детальніше</Link>
            {item.price !== null && item.options ? <AddToCartButton product={{ id: item.id, ...(item.variantId ? { variantId: item.variantId } : {}), title: item.title, price: item.price, image: item.image, slug: item.slug, unit: item.unit, category: item.category, usefulWidth: item.usefulWidth, fullWidth: item.fullWidth, options: item.options }} /> : <button type="button" className={styles.cartButton} disabled title="Для додавання до кошика спершу задайте ціну у прайс-листі">В кошик</button>}
          </div>
        </div>
      </article>)}
    </div></div></section>
  </main>;
}
