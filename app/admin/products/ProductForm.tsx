import Link from 'next/link';
import type { Product } from '@prisma/client';

const CATEGORIES = ['Профнастил', 'Металочерепиця', 'Паркан', 'Штахет', 'Метал-Сайдинг', 'Ринви', 'Плівки', 'Комплектуючі'];

export function ProductForm({ action, product }: { action: (formData: FormData) => void | Promise<void>; product?: Product }) {
  return (
    <div className="admin-section-card">
      <form action={action} className="admin-form">
        <div className="admin-form-grid">
          <div className="admin-form-group"><label htmlFor="title">Назва</label><input id="title" name="title" required defaultValue={product?.title} /></div>
          <div className="admin-form-group"><label htmlFor="slug">Адреса сторінки (slug)</label><input id="slug" name="slug" required defaultValue={product?.slug} placeholder="profnastyl-s10" /></div>
          <div className="admin-form-group"><label htmlFor="category">Категорія</label><select id="category" name="category" required defaultValue={product?.category ?? ''}><option value="" disabled>Оберіть категорію</option>{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></div>
          <div className="admin-form-group"><label htmlFor="unit">Одиниця продажу</label><select id="unit" name="unit" required defaultValue={product?.unit ?? 'м.п.'}><option>м.п.</option><option>м²</option><option>шт.</option></select></div>
          <div className="admin-form-group"><label htmlFor="usefulWidth">Корисна ширина, м</label><input id="usefulWidth" name="usefulWidth" type="number" min="0.001" step="0.001" required defaultValue={product ? Number(product.usefulWidth) : 1.17} /></div>
          <div className="admin-form-group"><label htmlFor="fullWidth">Повна ширина, м</label><input id="fullWidth" name="fullWidth" type="number" min="0.001" step="0.001" required defaultValue={product ? Number(product.fullWidth) : 1.2} /></div>
          <div className="admin-form-group"><label htmlFor="image">Основне фото (шлях або URL)</label><input id="image" name="image" required defaultValue={product?.image} placeholder="/catalog/product.jpg" /></div>
          <div className="admin-form-group admin-form-group-full"><label htmlFor="description">Опис</label><textarea id="description" name="description" rows={4} defaultValue={product?.description ?? ''} /></div>
        </div>
        <div className="admin-form-actions"><Link href={product ? `/admin/products/${product.id}` : '/admin/products'} className="admin-secondary-button">Скасувати</Link><button type="submit" className="admin-primary-button">{product ? 'Зберегти товар' : 'Створити товар'}</button></div>
      </form>
    </div>
  );
}
