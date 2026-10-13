import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getProductSeries, type DrawingKind } from '@/lib/catalog/series';
import { ProductDrawing } from '@/components/catalog/ProductDrawing';
import styles from './ProductPage.module.css';
import { ProductConfigurator } from '@/components/ProductConfigurator/ProductConfigurator';
import { ProductImagePreview } from '@/components/catalog/ProductImagePreview';
import { ProductColorProvider } from '@/components/catalog/ProductColorContext';
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
  }));
  const minPrice = catalogPrices.length ? Math.min(...catalogPrices.map((rate) => rate.price)) : null;
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
            <div className={styles.imageWrapper}>
              <ProductImagePreview src={image} alt={`${category} ${title}`} imagesByColor={imagesByColor} />
            </div>
            <ProductDrawing kind={drawingKind} title={title} fullWidth={fullWidth} usefulWidth={drawingUsefulWidth} height={drawingHeight} asset={drawingAsset} />
          </div>

          <div className={styles.content}>
            <span className={styles.category}>{category}</span>
            <h1 className={styles.title}>{title}</h1>
            {minPrice !== null && <p className={styles.price}>від {minPrice.toLocaleString('uk-UA')} грн/{unit}</p>}
            {description && <p className={styles.description}>{description}</p>}

            {series && <section className={styles.specs} aria-label="Характеристики">
              <h2>Характеристики</h2>
              {series.specs.map(({ label, value }) => <div key={label}><span>{label}</span><b>{value}</b></div>)}
            </section>}

            <ProductConfigurator product={{ id: record?.id ?? series!.slug, title, slug, image, unit, usefulWidth, fullWidth, category, variants, manualUnitPrice, availableMetalBrands, availableThicknesses, catalogPrices }} initialSelection={initialSelection} />
            <a className={styles.consultButton} href="tel:+380733885299">Звʼязатися з менеджером · +38 (073) 388-52-99</a>
          </div>
        </div>
        </ProductColorProvider>
      </div>
    </main>
  );
}
