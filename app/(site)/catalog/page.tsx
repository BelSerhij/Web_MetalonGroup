import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import styles from './Catalog.module.css';
import { productSeries } from '@/lib/catalog/series';

const filters = ['Всі', 'Профнастил', 'Металочерепиця', 'Паркан', 'Штахет', 'Метал-Сайдинг', 'Ринви', 'Плівки', 'Комплектуючі'];

type Props = { searchParams: Promise<{ category?: string }> };

export default async function CatalogPage({ searchParams }: Props) {
  const { category: selectedCategory } = await searchParams;
  const records = await prisma.product.findMany({ where: { isVisible: true }, orderBy: { createdAt: 'desc' } });
  const items = [
    ...productSeries.filter((series) => records.find((product) => product.slug === series.slug)?.isVisible !== false).map((series) => {
      return { slug: series.slug, title: series.title, category: series.category, image: series.image };
    }),
    ...records.filter((product) => !productSeries.some((series) => series.slug === product.slug)).map((product) => {
      return { slug: product.slug, title: product.title, category: product.category, image: product.image };
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
          <div className={styles.cardActions}>
            <Link href={`/catalog/${item.slug}`} className={styles.detailsButton}>Характеристики та розрахунок</Link>
          </div>
        </div>
      </article>)}
    </div></div></section>
  </main>;
}
