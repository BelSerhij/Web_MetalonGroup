import Link from 'next/link';
import { Plus, Pencil, Eye, EyeOff } from 'lucide-react';

import { prisma } from '@/lib/prisma';
import { toggleProductVisibility } from './actions';
import { PriceList } from './PriceList';
import { productSeries } from '@/lib/catalog/series';

export default async function ProductsPage() {
  const [products, rates] = await Promise.all([
    prisma.product.findMany({ include: { variants: true }, orderBy: { createdAt: 'desc' } }),
    prisma.materialRate.findMany(),
  ]);
  const variantsForPriceList = (product: typeof products[number], fullWidth: number, unit: string) => product.variants.map((variant) => ({
    id: variant.id,
    metalBrand: variant.metalBrand,
    thickness: Number(variant.thickness),
    coating: variant.coating,
    paintingType: variant.paintingType,
    color: variant.color,
    pricePerMeter: /м²|м2/i.test(unit) ? Number((Number(variant.price) * fullWidth).toFixed(2)) : Number(variant.price),
  }));
  const seriesSlugs = new Set(productSeries.map((series) => series.slug));
  const priceListProducts = [
    ...productSeries.map((series) => {
      const product = products.find((item) => item.slug === series.slug);
      const fullWidth = series.fullWidth ?? (product ? Number(product.fullWidth) : null);
      const unit = product?.unit ?? series.unit;
      return {
        id: product?.id ?? null,
        slug: series.slug,
        title: series.title,
        category: series.category,
        unit,
        fullWidth,
        usefulWidth: series.usefulWidth ?? (product ? Number(product.usefulWidth) : null),
        isVisible: product?.isVisible ?? true,
        variants: product && fullWidth ? variantsForPriceList(product, fullWidth, unit) : [],
      };
    }),
    ...products.filter((product) => !seriesSlugs.has(product.slug)).map((product) => ({
      id: product.id,
      slug: product.slug,
      title: product.title,
      category: product.category,
      unit: product.unit,
      fullWidth: Number(product.fullWidth),
      usefulWidth: Number(product.usefulWidth),
      isVisible: product.isVisible,
      variants: variantsForPriceList(product, Number(product.fullWidth), product.unit),
    })),
  ];
  const priceListRates = rates.map((rate) => ({
    metalBrand: rate.metalBrand,
    thickness: Number(rate.thickness),
    coating: rate.coating,
    paintingType: rate.paintingType,
    pricePerMeter: Number(rate.pricePerMeter),
  }));
  const adminProductRows = [
    ...productSeries.map((series) => {
      const product = products.find((item) => item.slug === series.slug);
      return {
        id: product?.id ?? null,
        slug: series.slug,
        title: series.title,
        category: series.category,
        image: product?.image ?? series.image,
        unit: product?.unit ?? series.unit,
        fullWidth: series.fullWidth ?? (product ? Number(product.fullWidth) : null),
        usefulWidth: series.usefulWidth ?? (product ? Number(product.usefulWidth) : null),
        variantCount: product?.variants.length ?? 0,
        isVisible: product?.isVisible ?? true,
      };
    }),
    ...products.filter((product) => !seriesSlugs.has(product.slug)).map((product) => ({
      id: product.id,
      slug: product.slug,
      title: product.title,
      category: product.category,
      image: product.image,
      unit: product.unit,
      fullWidth: Number(product.fullWidth),
      usefulWidth: Number(product.usefulWidth),
      variantCount: product.variants.length,
      isVisible: product.isVisible,
    })),
  ];
  const productsByCategory = adminProductRows.reduce<Record<string, typeof adminProductRows>>((groups, product) => {
    (groups[product.category] ??= []).push(product);
    return groups;
  }, {});

  return (
    <div>
      <div className="admin-page-header admin-page-header-row">
        <div>
          <h1>Товари</h1>

          <p>
            Управління товарами та їх варіантами
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="admin-primary-button"
        >
          <Plus size={20} />

          Додати товар
        </Link>
      </div>

      <div className="admin-section-card">
        <div className="admin-section-header"><div><h2>Прайс-лист і масове редагування цін</h2><p>Ціни згруповані за типом виробу, виробником, товщиною та покриттям.</p></div></div>
        <PriceList products={priceListProducts} rates={priceListRates} />
      </div>

      <div className="admin-table-card">
        {Object.entries(productsByCategory).map(([category, categoryProducts]) => <section key={category} className="admin-product-category">
          <h2>{category}</h2>
          <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Товар</th>
                <th>Одиниця</th>
                <th>Повна ширина</th>
                <th>Робоча ширина</th>
                <th>Варіанти</th>
                <th>Відображення</th>
                <th>Дії</th>
              </tr>
            </thead>

            <tbody>
              {categoryProducts.map((product) => (
                <tr key={product.slug}>
                  <td>
                    <div className="admin-product-cell">
                      <div className="admin-product-image">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.title}
                          />
                        ) : (
                          <span>—</span>
                        )}
                      </div>

                      <div>
                        <strong>
                          {product.title}
                        </strong>

                        <span>
                          {product.slug}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    {product.unit}
                  </td>

                  <td>
                    {product.fullWidth ? `${product.fullWidth.toLocaleString('uk-UA')} м` : '—'}
                  </td>

                  <td>
                    {product.usefulWidth ? `${product.usefulWidth.toLocaleString('uk-UA')} м` : '—'}
                  </td>

                  <td>
                    <span className="admin-badge">
                      {product.id ? product.variantCount : 'Прайс'}
                    </span>
                  </td>

                  <td>
                    {product.id ? <form action={toggleProductVisibility.bind(null, product.id, !product.isVisible)}>
                      <button type="submit" className="admin-secondary-button" aria-label={product.isVisible ? 'Сховати товар' : 'Показати товар'}>
                        {product.isVisible ? <><Eye size={16} /> На сайті</> : <><EyeOff size={16} /> Приховано</>}
                      </button>
                    </form> : <span className="admin-badge">Каталог</span>}
                  </td>

                  <td>
                    <Link href={product.id ? `/admin/products/${product.id}` : `/catalog/${product.slug}`} target={product.id ? undefined : '_blank'} className="admin-action-button" aria-label={product.id ? `Редагувати ${product.title}` : `Переглянути ${product.title}`}>
                      {product.id ? <Pencil size={18} /> : <Eye size={18} />}
                    </Link>
                  </td>
                </tr>
              ))}

              {categoryProducts.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="admin-empty"
                  >
                    Товарів поки немає
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </section>)}
      </div>
    </div>
  );
}
