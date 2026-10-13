import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { savePricingSettings } from './actions';

export default async function PricingSettingsPage() {
  await requireRole('ADMIN');
  const settings = await prisma.pricingSettings.findUnique({ where: { id: 'default' } });

  return <div>
    <div className="admin-page-header"><div><h1>Націнки та ціни</h1><p>Керуйте цінами виробленого С-10 та товарами партнера.</p></div></div>
    <div className="admin-section-card">
      <form action={savePricingSettings} className="admin-form">
        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label htmlFor="manufacturingMarkupPercent">Націнка на С-10 власного виробництва, %</label>
            <input id="manufacturingMarkupPercent" name="manufacturingMarkupPercent" type="number" min="0" max="300" step="0.1" defaultValue={settings ? Number(settings.manufacturingMarkupPercent) : 20} required />
            <small>Рахується від вартості використаного металу на 1 м² готового профілю.</small>
          </div>
          <div className="admin-form-group">
            <label htmlFor="partnerMarkupPercent">Націнка на готову продукцію партнера, %</label>
            <input id="partnerMarkupPercent" name="partnerMarkupPercent" type="number" min="0" max="300" step="0.1" defaultValue={settings ? Number(settings.partnerMarkupPercent) : 18} required />
            <small>Поточне початкове значення — 18%, у межах заданих вами 15–20%.</small>
          </div>
        </div>
        <div className="admin-form-actions"><button type="submit" className="admin-primary-button">Зберегти націнки</button></div>
      </form>
    </div>
  </div>;
}
