import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getProductSeries, type DrawingKind } from '@/lib/catalog/series';
import { ProductVisualSwitcher } from '@/components/catalog/ProductVisualSwitcher';
import styles from './ProductPage.module.css';
import { ProductConfigurator } from '@/components/ProductConfigurator/ProductConfigurator';
import { ProductColorProvider } from '@/components/catalog/ProductColorContext';
import { CatalogColorSelector } from '@/components/catalog/CatalogColorSelector';
import { findCatalogColor } from '@/lib/catalog/colors';
import { canonicalizeMaterialRates } from '@/lib/catalog/manufacturers';

type ProductSearchParams = { color?: string; thickness?: string; metalBrand?: string; coating?: string; paintingType?: string };
type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<ProductSearchParams>;
};

export default async function ProductPage({ params, searchParams }: Props) {
  const [{ slug }, selectionParams] = await Promise.all([params, searchParams ?? Promise.resolve({} as ProductSearchParams)]);
  const [record, series, materialRates] = await Promise.all([
    prisma.product.findUnique({ where: { slug }, include: { variants: true } }),
    Promise.resolve(getProductSeries(slug)),
    prisma.materialRate.findMany(),
  ]);
  if (record && !record.isVisible) notFound();
  if (!record && !series) notFound();

  const title = series?.title ?? record!.title;
  const category = series?.category ?? record!.category;
  const description = series?.description ?? record!.description;
  const image = series?.image ?? record!.image;
  const unit = series?.unit ?? record!.unit;
  const usefulWidth = series?.usefulWidth ?? (record ? Number(record.usefulWidth) : 1);
  const drawingUsefulWidth = series?.usefulWidth ?? (record ? Number(record.usefulWidth) : undefined);
  const drawingKind: DrawingKind = series?.drawing ?? (category === 'Металочерепиця' ? 'tile' : category === 'Паркан' ? 'rhomb' : category === 'Метал-Сайдинг' ? 'blockhouse' : 'profile');
  const fullWidth = series?.fullWidth ?? (record ? Number(record.fullWidth) : undefined);
  const drawingHeight = series?.drawingHeight ?? Number(title.match(/\d+/)?.[0] ?? 18);
  const drawingAsset = series?.drawingAsset ?? ({ 'profnastyl-s10': '/catalog/diagrams/t10.png', 'profnastyl-t18': '/catalog/diagrams/t18.png', 'profnastyl-t45': '/catalog/diagrams/t45.png', 'shtahet-metalevyi': '/catalog/diagrams/picket.jpg' }[slug]);
  const rawVariants = (record?.variants ?? []).filter((variant) => variant.isVisible);
  const variants = rawVariants.map((variant) => ({
    id: variant.id,
    productId: variant.productId,
    color: variant.color,
    thickness: Number(variant.thickness),
    coating: variant.coating,
    paintingType: variant.paintingType,
    metalBrand: variant.metalBrand,
    zincContent: Number(variant.zincContent),
    price: Number(variant.price),
    imageUrl: variant.imageUrl,
  }));
  const imagesByColor = Object.fromEntries(variants.filter((variant) => variant.imageUrl).map((variant) => [findCatalogColor(variant.color)?.code ?? variant.color, variant.imageUrl!]));
  const manualUnitPrice = null;
  const normalizedRates = canonicalizeMaterialRates(materialRates);
  const catalogPrices = normalizedRates.map((rate) => ({
    metalBrand: rate.metalBrand,
    thickness: Number(rate.thickness),
    coating: rate.coating,
    paintingType: rate.paintingType,
    price: /м²|м2/i.test(unit) ? Number((Number(rate.pricePerMeter) / (fullWidth ?? 1)).toFixed(2)) : Number(rate.pricePerMeter),
    pricePerMeter: Number(rate.pricePerMeter),
  }));
  const availableMetalBrands = [...new Set(normalizedRates.map((rate) => rate.metalBrand))].sort((a, b) => a.localeCompare(b, 'uk'));
  const availableThicknesses = [...new Set(normalizedRates.map((rate) => Number(rate.thickness)))].sort((a, b) => a - b);
  const initialSelection = {
    ...(selectionParams.color ? { color: selectionParams.color } : {}),
    ...(selectionParams.thickness ? { thickness: Number(selectionParams.thickness) } : {}),
    ...(selectionParams.metalBrand ? { metalBrand: selectionParams.metalBrand } : {}),
    ...(selectionParams.coating ? { coating: selectionParams.coating } : {}),
    ...(selectionParams.paintingType ? { paintingType: selectionParams.paintingType } : {}),
  };
  return (
    <main className={styles.page}>
      <div className="container">
        <Link href={`/catalog?category=${encodeURIComponent(category)}`} className={styles.backButton}>← Назад до {category.toLowerCase()}</Link>

        <ProductColorProvider initialColor={initialSelection.color ?? variants[0]?.color ?? 'RAL 8017'}>
        <div className={styles.wrapper}>
          <div className={styles.visuals}>
            <ProductVisualSwitcher src={image} alt={`${category} ${title}`} imagesByColor={imagesByColor} drawing={{ kind: drawingKind, title, fullWidth, usefulWidth: drawingUsefulWidth, height: drawingHeight, asset: drawingAsset }} />
          </div>

          <div className={styles.content}>
            <span className={styles.category}>{category}</span>
            <h1 className={styles.title}>{title}</h1>
            {description && <p className={styles.description}>{description}</p>}

            {series && <section className={styles.specs} aria-label="Характеристики">
              <h2>Характеристики</h2>
              {series.specs.map(({ label, value }) => <div key={label}><span>{label}</span><b>{value}</b></div>)}
            </section>}

          </div>
        </div>
        <CatalogColorSelector />
        <ProductConfigurator product={{ id: record?.id ?? series!.slug, title, slug, image, unit, usefulWidth, fullWidth, category, variants, manualUnitPrice, availableMetalBrands, availableThicknesses, catalogPrices }} initialSelection={initialSelection} />
        <section className={styles.contactCard} aria-label="Зв’язатися з менеджером">
          <div className={styles.contactIntro}><span>Потрібна консультація?</span><b>Звʼяжіться з менеджером зручним способом</b></div>
          <div className={styles.contactActions}>
          <div className={styles.phoneLinks}>
            <a className={styles.phoneLink} href="tel:+380733885299"><span className={styles.phoneIcon} aria-hidden="true">☎</span><span><small>Зателефонувати</small><b>+38 (073) 388-52-99</b></span></a>
            <a className={`${styles.phoneLink} ${styles.freePhoneLink}`} href="tel:0800447012"><span className={styles.phoneIcon} aria-hidden="true">☎</span><span><small>Дзвінки безкоштовні по Україні</small><b>0 (800) 44-70-12</b></span></a>
          </div>
          <div className={styles.messengerLinks}>
            <a href="viber://chat?number=%2B380987861795" aria-label="Написати у Viber на номер 098 786 17 95"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c-4.8 0-8.5 3-8.5 7.2 0 2.1 1 3.8 2.7 5l-.5 3.6 3.7-1.8c.9.3 1.7.4 2.6.4 4.8 0 8.5-3 8.5-7.2S16.8 3 12 3Z"/><path d="M9 8c.5 3.1 2 4.7 5.2 5.4M14.1 7.8c1 .3 1.7 1 2 2m-2-4c2.2.3 3.7 1.9 4 4"/></svg><span>Viber</span></a>
            <a href="https://t.me/metalon_admin" target="_blank" rel="noreferrer" aria-label="Написати у Telegram metalon_admin"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 4-3.2 16-6.1-4.5-3.2 3.1.5-5.4L19 6.3 7.2 12.1 3 10.6 21 4Z"/></svg><span>Telegram</span></a>
            <a href="https://wa.me/380987861795" target="_blank" rel="noreferrer" aria-label="Написати у WhatsApp на номер 098 786 17 95"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.7a8 8 0 0 1-11.8 7L4 20l1.3-4A8 8 0 1 1 20 11.7Z"/><path d="M9 8.2c.4 2.7 1.8 4.1 4.5 4.8l1.1-1.1 2 .9c-.2 1.1-.9 1.7-2 1.7-3.8-.3-6.8-3.1-7.2-6.8 0-1.1.6-1.8 1.7-2l.9 2L9 8.2Z"/></svg><span>WhatsApp</span></a>
          </div>
          </div>
        </section>
        </ProductColorProvider>
      </div>
    </main>
  );
}
