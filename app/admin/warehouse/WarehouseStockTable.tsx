'use client';

import { useMemo, useState, useTransition } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { adjustWarehouseStock } from './actions';

type StockRow = {
  productId: string;
  variantId: string;
  productTitle: string;
  unit: string;
  color: string;
  thickness: number;
  coating: string;
  paintingType: string;
  metalBrand: string;
  zincContent: number;
  quantity: number;
  production: number;
  sale: number;
  adjustment: number;
  return: number;
  reserved: number;
};

type WarehouseItem = { id: string; name: string };

function format(value: number) {
  return value.toLocaleString('uk-UA', { maximumFractionDigits: 2 });
}

export default function WarehouseStockTable({ stock, warehouses }: { stock: StockRow[]; warehouses: WarehouseItem[] }) {
  const [query, setQuery] = useState('');
  const [color, setColor] = useState('ALL');
  const [adjustment, setAdjustment] = useState<StockRow | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const colors = useMemo(() => Array.from(new Set(stock.map((x) => x.color))).sort((a, b) => a.localeCompare(b, 'uk')), [stock]);
  const filtered = stock.filter((item) => {
    const text = `${item.productTitle} ${item.color} ${item.coating} ${item.metalBrand}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (color === 'ALL' || item.color === color);
  });

  function submitAdjustment(form: HTMLFormElement) {
    const data = new FormData(form);
    const quantity = Number(data.get('quantity'));
    if (!Number.isFinite(quantity) || quantity === 0) {
      setError('Вкажіть коректну ненульову кількість.');
      return;
    }
    setError('');
    startTransition(async () => {
      try {
        await adjustWarehouseStock({
          productId: adjustment!.productId,
          variantId: adjustment!.variantId,
          warehouseId: String(data.get('warehouseId') || '') || undefined,
          quantity,
          note: String(data.get('note') || ''),
        });
        setAdjustment(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Не вдалося змінити залишок');
      }
    });
  }

  return <>
    <div className="warehouse-toolbar">
      <div className="warehouse-search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Пошук товару, кольору, покриття..." /></div>
      <select value={color} onChange={(e) => setColor(e.target.value)}><option value="ALL">Усі кольори</option>{colors.map((x) => <option key={x}>{x}</option>)}</select>
      <span className="warehouse-result-count"><SlidersHorizontal size={15} /> {filtered.length} позицій</span>
    </div>

    <div className="metal-warehouse-table-wrap">
      <table className="metal-warehouse-table stock-table">
        <thead><tr><th>Товар</th><th>Характеристики</th><th>Залишок</th><th>Зарезервовано</th><th>Прихід</th><th>Продаж</th><th></th></tr></thead>
        <tbody>
          {filtered.map((item) => <tr key={`${item.productId}:${item.variantId}`}>
            <td><strong>{item.productTitle}</strong><small>{item.unit || 'м.п.'}</small></td>
            <td><strong>{item.color}</strong><span>{item.thickness} мм · {item.coating}</span><small>{item.metalBrand} · Zn {item.zincContent} г/м²</small></td>
            <td><strong className="stock-main-value">{format(item.quantity)} {item.unit || 'м.п.'}</strong></td>
            <td>{format(item.reserved)} {item.unit || 'м.п.'}</td>
            <td className="positive">+{format(Math.max(0, item.production + item.return + item.adjustment))}</td>
            <td className="negative">{format(item.sale)}</td>
            <td><button className="warehouse-row-action" onClick={() => setAdjustment(item)}>Коригувати</button></td>
          </tr>)}
          {filtered.length === 0 && <tr><td colSpan={7} className="empty">За заданими параметрами залишків не знайдено.</td></tr>}
        </tbody>
      </table>
    </div>

    {adjustment && <div className="warehouse-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setAdjustment(null); }}>
      <form className="warehouse-modal" onSubmit={(e) => { e.preventDefault(); submitAdjustment(e.currentTarget); }}>
        <button type="button" className="modal-close" onClick={() => setAdjustment(null)}><X size={18} /></button>
        <span className="kicker">СКЛАДСЬКЕ КОРИГУВАННЯ</span>
        <h3>{adjustment.productTitle}</h3>
        <p>{adjustment.color} · {adjustment.thickness} мм · {adjustment.coating}</p>
        <div className="modal-current-stock">Поточний залишок <strong>{format(adjustment.quantity)} {adjustment.unit || 'м.п.'}</strong></div>
        <label>Зміна залишку, {adjustment.unit || 'м.п.'}<input name="quantity" type="number" step="0.01" placeholder="+10 або -10" autoFocus /></label>
        {warehouses.length > 0 && <label>Склад<select name="warehouseId"><option value="">Без прив'язки</option>{warehouses.map((w) => <option value={w.id} key={w.id}>{w.name}</option>)}</select></label>}
        <label>Примітка<textarea name="note" rows={3} placeholder="Причина коригування..." /></label>
        {error && <div className="warehouse-form-error">{error}</div>}
        <button disabled={pending} className="warehouse-primary-button" type="submit">{pending ? 'Збереження...' : 'Зберегти коригування'}</button>
      </form>
    </div>}
  </>;
}
