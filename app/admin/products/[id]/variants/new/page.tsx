import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { prisma } from '@/lib/prisma';
import { createProductVariant } from '@/app/admin/products/actions';
import { getPricingSettings } from '@/lib/pricing';
import { VariantCreateFields } from './VariantCreateFields';

type NewVariantPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{ color?: string; thickness?: string; metalBrand?: string; coating?: string; paintingType?: string }>;
};

export default async function NewVariantPage({
  params,
  searchParams,
}: NewVariantPageProps) {
  const { id } = await params;
  const defaults = await searchParams;

  const product =
    await prisma.product.findUnique({
      where: {
        id,
      },
    });

  if (!product) {
    notFound();
  }

  const [variantReferences, pricingSettings] = await Promise.all([
    prisma.productVariant.findMany({ select: { metalBrand: true, zincContent: true } }),
    getPricingSettings(),
  ]);
  const manufacturers = [...new Set(variantReferences.map((variant) => variant.metalBrand))].sort((a, b) => a.localeCompare(b, 'uk'));
  const zincFrequency = new Map<string, Map<number, number>>();
  for (const variant of variantReferences) {
    const values = zincFrequency.get(variant.metalBrand) ?? new Map<number, number>();
    values.set(variant.zincContent, (values.get(variant.zincContent) ?? 0) + 1);
    zincFrequency.set(variant.metalBrand, values);
  }
  const zincByManufacturer = Object.fromEntries([...zincFrequency].map(([brand, values]) => [
    brand,
    [...values.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0][0],
  ]));
    
const createVariant =
  createProductVariant.bind(
    null,
    product.id
  );

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <Link
            href={`/admin/products/${product.id}`}
            className="admin-back-link"
          >
            <ArrowLeft size={18} />

            Назад до товару
          </Link>

          <h1>
            Додати варіант
          </h1>

          <p>
            {product.title}
          </p>
        </div>
      </div>

      <div className="admin-section-card">
        <form action={createVariant} className="admin-form">
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="thickness">
                Товщина металу, мм
              </label> 

              <input
                id="thickness"
                name="thickness"
                type="number"
                step="0.01"
                placeholder="Наприклад: 0.45"
                defaultValue={defaults?.thickness}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="color">
                Колір
              </label>

              <input
                id="color"
                name="color"
                required
                placeholder="Наприклад: RAL 7016"
                defaultValue={defaults?.color}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="imageUrl">Фото цього кольору (шлях або URL)</label>
              <input id="imageUrl" name="imageUrl" type="text" placeholder="/catalog/colors/ral-3005.jpg" />
            </div>

            <div className="admin-form-group">
              <label htmlFor="coating">
                Покриття
              </label>

              <select
                id="coating"
                name="coating"
                defaultValue={defaults?.coating ?? ''}
              >
                <option value="" disabled>
                  Оберіть покриття
                </option>

                <option value="Gloss">
                  Глянець
                </option>

                <option value="Matt">
                  Матове
                </option>

                <option value="Zinc">
                  Цинк
                </option>
              </select>
            </div>

            <div className="admin-form-group">
              <label htmlFor="paintingType">
                Тип фарбування
              </label>

              <select
                id="paintingType"
                name="paintingType"
                defaultValue={defaults?.paintingType ?? ''}
              >
                <option value="" disabled>
                  Оберіть тип
                </option>

                <option value="OneSide">
                  Одностороннє
                </option>

                <option value="TwoSide">
                  Двостороннє
                </option>
              </select>
            </div>

            <VariantCreateFields
              manufacturers={manufacturers}
              zincByManufacturer={zincByManufacturer}
              defaultManufacturer={defaults?.metalBrand}
              defaultMarkupPercent={pricingSettings.partnerMarkupPercent}
            />
          </div>

          <div className="admin-form-actions">
            <Link
              href={`/admin/products/${product.id}`}
              className="admin-secondary-button"
            >
              Скасувати
            </Link>

            <button
              type="submit"
              className="admin-primary-button"
            >
              Додати варіант
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
