import { prisma } from '@/lib/prisma';
import {
  Boxes,
  Factory,
  Package,
  Ruler,
  TrendingDown,
  TrendingUp,
  Warehouse,
  Weight,
} from 'lucide-react';

import WarehouseStockTable from './WarehouseStockTable';
import './warehouse-keycrm.css';

const STEEL_DENSITY = 7850;

function n(value: unknown) {
  return Number(value ?? 0);
}

function format(value: number) {
  return value.toLocaleString('uk-UA', {
    maximumFractionDigits: 2,
  });
}

function kgPerMeter(width: number, thickness: number) {
  return (width / 1000) * (thickness / 1000) * STEEL_DENSITY;
}

export default async function WarehousePage() {
  const [warehouses, movements, coils] = await Promise.all([
    prisma.warehouse.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
    prisma.stockMovement.findMany({
      include: {
        product: true,
        variant: true,
        warehouse: true,
        order: true,
        production: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.metalCoil.findMany({
      where: {
        status: { in: ['IN_STOCK', 'IN_USE'] },
        OR: [
          { currentLength: { gt: 0 } },
          { currentWeight: { gt: 0 } },
        ],
      },
      include: { supplier: true },
      orderBy: { receivedAt: 'asc' },
    }),
  ]);

  const stockMap = new Map<
    string,
    {
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
    }
  >();

  for (const movement of movements) {
    const key = `${movement.productId}:${movement.variantId}`;
    const current = stockMap.get(key) ?? {
      productId: movement.productId,
      variantId: movement.variantId,
      productTitle: movement.product.title,
      unit: movement.product.unit,
      color: movement.variant.color,
      thickness: n(movement.variant.thickness),
      coating: movement.variant.coating,
      paintingType: movement.variant.paintingType,
      metalBrand: movement.variant.metalBrand,
      zincContent: movement.variant.zincContent,
      quantity: 0,
      production: 0,
      sale: 0,
      adjustment: 0,
      return: 0,
      reserved: 0,
    };

    const quantity = n(movement.quantity);
    current.quantity += quantity;

    if (movement.type === 'PRODUCTION') current.production += quantity;
    if (movement.type === 'SALE') current.sale += quantity;
    if (movement.type === 'ADJUSTMENT') current.adjustment += quantity;
    if (movement.type === 'RETURN') current.return += quantity;
    if (movement.type === 'RESERVATION') current.reserved += Math.abs(quantity);
    if (movement.type === 'UNRESERVATION') current.reserved -= Math.abs(quantity);

    stockMap.set(key, current);
  }

  const stock = Array.from(stockMap.values())
    .filter((item) => item.quantity > 0.0001)
    .sort((a, b) => a.productTitle.localeCompare(b.productTitle, 'uk'));

  const finishedArea = stock.reduce((sum, item) => sum + item.quantity, 0);
  const finishedMeters = stock.reduce((sum, item) => {
    const width = n(
      (movements.find((m) => m.productId === item.productId)?.product.usefulWidth) ?? 0
    );
    return sum + (width > 0 ? item.quantity / width : 0);
  }, 0);
  const finishedVariants = stock.length;
  const coilMeters = coils.reduce((sum, coil) => {
    if (coil.currentLength !== null) return sum + n(coil.currentLength);
    return sum + n(coil.currentWeight) / kgPerMeter(n(coil.width), n(coil.thickness));
  }, 0);
  const coilWeight = coils.reduce((sum, coil) => sum + n(coil.currentWeight), 0);
  const activeCoils = coils.filter((coil) => coil.status === 'IN_USE').length;

  return (
    <div className="metal-warehouse-page">
      <header className="metal-warehouse-topbar">
        <div className="metal-warehouse-title">
          <div className="metal-warehouse-title-icon"><Warehouse size={21} /></div>
          <div>
            <span>METALON GROUP · CRM</span>
            <h1>Склад</h1>
          </div>
        </div>

        <div className="metal-warehouse-topbar-actions">
          <div className="metal-warehouse-location">
            <Warehouse size={16} />
            {warehouses[0]?.name ?? 'Основний склад'}
          </div>
        </div>
      </header>

      <main className="metal-warehouse-content">
        <section className="metal-warehouse-summary">
          <div className="metal-warehouse-summary-card primary">
            <div className="icon"><Ruler size={21} /></div>
            <div><span>Готова продукція</span><strong>{format(finishedArea)} м²</strong><small>≈ {format(finishedMeters)} м.п.</small><small>{finishedVariants} варіантів</small></div>
          </div>
          <div className="metal-warehouse-summary-card">
            <div className="icon"><Package size={21} /></div>
            <div><span>Позицій на складі</span><strong>{finishedVariants}</strong><small>за кольором і характеристиками</small></div>
          </div>
          <div className="metal-warehouse-summary-card">
            <div className="icon"><Boxes size={21} /></div>
            <div><span>Рулонний метал</span><strong>{format(coilMeters)} м.п.</strong><small>{format(coilWeight)} кг</small></div>
          </div>
          <div className="metal-warehouse-summary-card">
            <div className="icon"><Factory size={21} /></div>
            <div><span>Рулони в роботі</span><strong>{activeCoils}</strong><small>IN_USE</small></div>
          </div>
        </section>

        <section className="metal-warehouse-card">
          <div className="metal-warehouse-card-header">
            <div>
              <span className="kicker"><Package size={14} /> ГОТОВА ПРОДУКЦІЯ</span>
              <h2>Залишки</h2>
              <p>Основний облік профнастилу та іншої готової продукції — у м.п.</p>
            </div>
            <div className="stock-header-metrics">
              <span><TrendingUp size={15} /> Прихід {format(stock.reduce((s, x) => s + Math.max(0, x.production + x.return + x.adjustment), 0))}</span>
              <span><TrendingDown size={15} /> Продаж {format(Math.abs(stock.reduce((s, x) => s + Math.min(0, x.sale), 0)))}</span>
            </div>
          </div>

          <WarehouseStockTable stock={stock} warehouses={warehouses.map((w) => ({ id: w.id, name: w.name }))} />
        </section>

        <section className="metal-warehouse-card">
          <div className="metal-warehouse-card-header">
            <div>
              <span className="kicker"><Weight size={14} /> СИРОВИНА</span>
              <h2>Рулони металу</h2>
              <p>Залишок рулону контролюємо насамперед у погонних метрах.</p>
            </div>
          </div>

          <div className="metal-warehouse-table-wrap">
            <table className="metal-warehouse-table">
              <thead><tr><th>Рулон</th><th>Характеристики</th><th>Постачальник</th><th>Статус</th><th>Залишок</th><th>Вага</th></tr></thead>
              <tbody>
                {coils.map((coil) => {
                  const meters = coil.currentLength !== null
                    ? n(coil.currentLength)
                    : n(coil.currentWeight) / kgPerMeter(n(coil.width), n(coil.thickness));
                  return <tr key={coil.id}>
                    <td><strong>{coil.code}</strong><small>отримано {coil.receivedAt.toLocaleDateString('uk-UA')}</small></td>
                    <td><strong>{coil.color}</strong><span>{n(coil.thickness)} мм · {coil.coating} · {coil.metalBrand}</span></td>
                    <td>{coil.supplier?.name ?? '—'}</td>
                    <td><span className={`coil-status ${coil.status === 'IN_USE' ? 'use' : 'stock'}`}>{coil.status === 'IN_USE' ? 'У виробництві' : 'На складі'}</span></td>
                    <td><strong>{format(meters)} м.п.</strong></td>
                    <td>{format(n(coil.currentWeight))} кг</td>
                  </tr>;
                })}
                {coils.length === 0 && <tr><td colSpan={6} className="empty">Рулонів із залишком не знайдено.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="metal-warehouse-card">
          <div className="metal-warehouse-card-header">
            <div><span className="kicker"><TrendingUp size={14} /> РУХ</span><h2>Останні складські операції</h2></div>
          </div>
          <div className="movement-list">
            {movements.slice(0, 12).map((movement) => (
              <div className="movement-row" key={movement.id}>
                <div className={`movement-icon ${movement.type.toLowerCase()}`}><Package size={16} /></div>
                <div className="movement-main"><strong>{movement.product.title}</strong><span>{movement.variant.color} · {n(movement.variant.thickness)} мм · {movement.note ?? movement.type}</span></div>
                <div className={`movement-quantity ${n(movement.quantity) >= 0 ? 'positive' : 'negative'}`}>{n(movement.quantity) >= 0 ? '+' : ''}{format(n(movement.quantity))} <small>{movement.product.unit || 'од.'}</small></div>
                <time>{movement.createdAt.toLocaleString('uk-UA')}</time>
              </div>
            ))}
            {movements.length === 0 && <div className="empty">Складських рухів ще немає.</div>}
          </div>
        </section>
      </main>
    </div>
  );
}
