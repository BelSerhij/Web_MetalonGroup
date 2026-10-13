import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { prisma } from '@/lib/prisma';

import { updateProductVariant } from '@/app/admin/products/actions';

type EditVariantPageProps = {
  params: Promise<{
    id: string;
    variantId: string;
  }>;
};

export default async function EditVariantPage({
  params,
}: EditVariantPageProps) {
  const { id, variantId } = await params;

  const product =
    await prisma.product.findUnique({
      where: {
        id,
      },
    });

  if (!product) {
    notFound();
  }

  const variant =
    await prisma.productVariant.findFirst({
      where: {
        id: variantId,
        productId: product.id,
      },
    });

  if (!variant) {
    notFound();
  }

  const updateVariant =
    updateProductVariant.bind(
      null,
      product.id,
      variant.id
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
            Редагувати варіант
          </h1>

          <p>
            {product.title}
          </p>
        </div>
      </div>

      <div className="admin-section-card">
        <form
          action={updateVariant}
          className="admin-form"
        >
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
                min="0.1"
                required
                defaultValue={Number(variant.thickness)}
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
                defaultValue={variant.color}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="imageUrl">Фото цього кольору (шлях або URL)</label>
              <input id="imageUrl" name="imageUrl" type="text" placeholder="/catalog/colors/ral-3005.jpg" defaultValue={variant.imageUrl ?? ''} />
            </div>

            <div className="admin-form-group">
              <label htmlFor="coating">
                Покриття
              </label>

              <select
                id="coating"
                name="coating"
                required
                defaultValue={variant.coating}
              >
                {!['Gloss', 'Matt', 'Zinc'].includes(variant.coating) && <option value={variant.coating}>{variant.coating}</option>}
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
                required
                defaultValue={
                  variant.paintingType
                }
              >
                <option value="OneSide">
                  Одностороннє
                </option>

                <option value="TwoSide">
                  Двостороннє
                </option>
              </select>
            </div>

            <div className="admin-form-group">
              <label htmlFor="metalBrand">
                Виробник металу
              </label>

              <input
                id="metalBrand"
                name="metalBrand"
                required
                defaultValue={
                  variant.metalBrand
                }
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="zincContent">
                Вміст цинку, г/м²
              </label>

              <input
                id="zincContent"
                name="zincContent"
                type="number"
                required
                defaultValue={
                  variant.zincContent
                }
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="price">
                Ціна продажу, грн
              </label>

              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                required
                defaultValue={Number(variant.price)}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="purchasePrice">Закупівельна ціна, грн</label>
              <input id="purchasePrice" name="purchasePrice" type="number" min="0" step="0.01" defaultValue={variant.purchasePrice === null ? '' : Number(variant.purchasePrice)} />
            </div>

            <div className="admin-form-group">
              <label htmlFor="markupType">Тип націнки</label>
              <select id="markupType" name="markupType" defaultValue={variant.markupType}>
                <option value="PERCENT">Відсоток</option>
                <option value="FIXED">Сума, грн</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label htmlFor="markupValue">Націнка</label>
              <input id="markupValue" name="markupValue" type="number" step="0.01" defaultValue={variant.markupValue === null ? '' : Number(variant.markupValue)} />
              <small>Збереження закупівельної ціни та націнки автоматично оновить продажну ціну.</small>
            </div>

            <div className="admin-form-group">
              <label htmlFor="isVisible">Відображення на сайті</label>
              <select id="isVisible" name="isVisible" defaultValue={variant.isVisible ? 'true' : 'false'}>
                <option value="true">Показувати</option><option value="false">Приховати</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label htmlFor="inStock">
                Статус
              </label>

              <select
                id="inStock"
                name="inStock"
                defaultValue={
                  variant.inStock
                    ? 'true'
                    : 'false'
                }
              >
                <option value="true">
                  В наявності
                </option>

                <option value="false">
                  Під замовлення
                </option>
              </select>
            </div>

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
              Зберегти зміни
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}
