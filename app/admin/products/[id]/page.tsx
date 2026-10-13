import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Pencil, Plus } from 'lucide-react';

import { prisma } from '@/lib/prisma';
import { archiveOrDeleteProduct, toggleProductVisibility } from '@/app/admin/products/actions';
import { VariantsManager } from './VariantsManager';

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  const product =
    await prisma.product.findUnique({
      where: {
        id,
      },

      include: {
        variants: {
          orderBy: [
            {
              thickness: 'asc',
            },
            {
              color: 'asc',
            },
          ],
        },
      },
    });

  if (!product) {
    notFound();
  }

  const siteVariantOptions = await prisma.productVariant.findMany({
    where: { isVisible: true, product: { isVisible: true } },
    select: { metalBrand: true, thickness: true },
  });
  const siteManufacturers = [...new Set(siteVariantOptions.map((variant) => variant.metalBrand))].sort((a, b) => a.localeCompare(b, 'uk'));
  const siteThicknesses = [...new Set(siteVariantOptions.map((variant) => Number(variant.thickness)))].sort((a, b) => a - b);

  const publishedCount = product.variants.filter((variant) => variant.isVisible).length;
  const variants = product.variants.map((variant) => ({
    id: variant.id,
    thickness: Number(variant.thickness),
    color: variant.color,
    coating: variant.coating,
    paintingType: variant.paintingType,
    metalBrand: variant.metalBrand,
    zincContent: Number(variant.zincContent),
    price: Number(variant.price),
    purchasePrice: variant.purchasePrice === null ? null : Number(variant.purchasePrice),
    markupType: variant.markupType,
    markupValue: variant.markupValue === null ? null : Number(variant.markupValue),
    isVisible: variant.isVisible,
  }));

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <Link
            href="/admin/products"
            className="admin-back-link"
          >
            <ArrowLeft size={18} />

            Назад до товарів
          </Link>

          <h1>{product.title}</h1>

          <p>
            Управління товаром та його варіантами
          </p>
        </div>

        <Link
          href={`/admin/products/${product.id}/edit`}
          className="admin-secondary-button"
        >
          <Pencil size={18} />

          Редагувати товар
        </Link>
        <form action={toggleProductVisibility.bind(null, product.id, !product.isVisible)}>
          <button type="submit" className="admin-secondary-button">{product.isVisible ? 'Сховати товар' : 'Показати товар'}</button>
        </form>
        <form action={archiveOrDeleteProduct.bind(null, product.id)}>
          <button type="submit" className="admin-secondary-button admin-action-button-danger">Видалити товар</button>
        </form>
      </div>

      {/* ОСНОВНА ІНФОРМАЦІЯ */}

      <div className="admin-section-card">
        <div className="admin-section-header">
          <h2>
            Основна інформація
          </h2>
        </div>

        <div className="admin-product-details">
          <div>
            <span>Назва</span>

            <strong>
              {product.title}
            </strong>
          </div>

          <div>
            <span>Категорія</span>

            <strong>
              {product.category}
            </strong>
          </div>

          <div>
            <span>Slug</span>

            <strong>
              {product.slug}
            </strong>
          </div>

          <div>
            <span>Одиниця виміру</span>

            <strong>
              {product.unit}
            </strong>
          </div>

          <div>
            <span>Корисна ширина</span>

            <strong>
              {Number(product.usefulWidth)} м
            </strong>
          </div>

          <div>
            <span>Повна ширина</span>

            <strong>
              {Number(product.fullWidth)} м
            </strong>
          </div>
        </div>

        {product.description && (
          <div className="admin-product-description">
            <span>Опис</span>

            <p>
              {product.description}
            </p>
          </div>
        )}
      </div>

      {/* ВАРІАНТИ */}

      <div className="admin-section-card">
        <div className="admin-section-header">
          <div>
            <h2>
              Варіанти товару
            </h2>

            <p>
              Опубліковано: {publishedCount} · приховано: {product.variants.length - publishedCount}
            </p>
            <p>Оберіть виробника, потім товщину й колір. Нижче з’являться ціни та дії для відповідних варіантів.</p>
          </div>

          <Link
            href={`/admin/products/${product.id}/variants/new`}
            className="admin-primary-button"
          >
            <Plus size={18} />

            Додати варіант
          </Link>
        </div>

        <VariantsManager productId={product.id} productSlug={product.slug} variants={variants} siteManufacturers={siteManufacturers} siteThicknesses={siteThicknesses} />
      </div>
    </div>
  );
}
