import styles from './ProductsSection.module.css';

import { prisma } from '@/lib/prisma';

import { Container } from '../../layout/Container/Container';


import { ProductCard } from '../../ui/ProductCard/ProductCard';
import { CATALOG_COLORS } from '@/lib/catalog/colors';
import { canonicalizeMaterialRates, canonicalManufacturer } from '@/lib/catalog/manufacturers';

export const ProductsSection = async () => {
  const [products, rawRates] = await Promise.all([prisma.product.findMany({
      take: 3,

      include: {
        variants: true,
      },

      where: { isVisible: true },
      orderBy: { createdAt: 'desc' },
    }), prisma.materialRate.findMany()]);
  const rates = canonicalizeMaterialRates(rawRates);

  return (
    <section
      className={styles.section}
    >
      <Container>
        <div className={styles.grid}>
          {products.map((item) => {
            /*
             * Prisma Decimal -> number
             */

            const currentRates = rates.map((rate) => ({ rate, price: /м²|м2/i.test(item.unit) ? Number(rate.pricePerMeter) / Number(item.fullWidth) : Number(rate.pricePerMeter) })).filter((entry) => entry.price > 0).sort((a, b) => a.price - b.price);
            const best = currentRates[0];
            const bestVariant = best && item.variants.find((variant) => canonicalManufacturer(variant.metalBrand) === best.rate.metalBrand && Number(variant.thickness) === Number(best.rate.thickness) && variant.coating === best.rate.coating && variant.paintingType === best.rate.paintingType);

            return (
              <ProductCard
                key={item.id}
                title={item.title}
                image={item.image}
                slug={item.slug}
                price={best ? `від ${best.price.toLocaleString('uk-UA', { maximumFractionDigits: 2 })} грн/${item.unit}` : 'Ціну уточнюйте'}
                cartProduct={best ? {
                  id: item.id, ...(bestVariant ? { variantId: bestVariant.id } : {}), title: item.title, price: best.price,
                  image: item.image, slug: item.slug, unit: item.unit, category: item.category,
                  usefulWidth: Number(item.usefulWidth), fullWidth: Number(item.fullWidth),
                  options: { color: CATALOG_COLORS[0]?.code ?? 'RAL 7016', thickness: Number(best.rate.thickness), metalBrand: best.rate.metalBrand, coating: best.rate.coating, paintingType: best.rate.paintingType },
                } : null}
              />
            );
          })}
        </div>
      </Container>
    </section>
  );
};
