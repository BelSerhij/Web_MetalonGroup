import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { createMetalCoil } from '@/app/admin/coils/actions';

export default function NewCoilPage() {
  return (
    <div>
      <div className="admin-page-header">
        <div>
          <Link
            href="/admin/coils"
            className="admin-back-link"
          >
            <ArrowLeft size={18} />

            Назад до рулонів
          </Link>

          <h1>
            Додати рулон металу
          </h1>

          <p>
            Додайте новий рулон на склад
          </p>
        </div>
      </div>

      <div className="admin-section-card">
        <form
          action={createMetalCoil}
          className="admin-form"
        >
          <div className="admin-form-grid">

            <div className="admin-form-group">
              <label htmlFor="code">
                Код рулону
              </label>

              <input
                id="code"
                name="code"
                placeholder="Наприклад: COIL-7016-002"
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="supplier">
                Постачальник
              </label>

              <input
                id="supplier"
                name="supplier"
                placeholder="Наприклад: POLYSTEEL"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="color">
                Колір
              </label>

              <input
                id="color"
                name="color"
                placeholder="Наприклад: RAL 7016"
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="thickness">
                Товщина металу, мм
              </label>

              <input
                id="thickness"
                name="thickness"
                type="number"
                step="0.001"
                placeholder="0.45"
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="coating">
                Покриття
              </label>

              <select
                id="coating"
                name="coating"
                defaultValue=""
                required
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
                defaultValue=""
                required
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

            <div className="admin-form-group">
              <label htmlFor="metalBrand">
                Виробник металу
              </label>

              <input
                id="metalBrand"
                name="metalBrand"
                placeholder="Наприклад: POLYSTEEL"
                required
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
                placeholder="100"
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="width">
                Ширина рулону, м
              </label>

              <input
                id="width"
                name="width"
                type="number"
                step="0.001"
                placeholder="1.2"
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="initialWeight">
                Початкова вага, кг
              </label>

              <input
                id="initialWeight"
                name="initialWeight"
                type="number"
                step="0.001"
                placeholder="5000"
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="initialLength">
                Початкова довжина, м
              </label>

              <input
                id="initialLength"
                name="initialLength"
                type="number"
                step="0.001"
                placeholder="1300"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="purchasePrice">
                Закупівельна ціна, грн
              </label>

              <input
                id="purchasePrice"
                name="purchasePrice"
                type="number"
                step="0.01"
                placeholder="350000"
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="purchasePricePerKg">
                Ціна за кг, грн
              </label>

              <input
                id="purchasePricePerKg"
                name="purchasePricePerKg"
                type="number"
                step="0.01"
                placeholder="70"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="status">
                Статус
              </label>

              <select
                id="status"
                name="status"
                defaultValue="IN_STOCK"
              >
                <option value="IN_STOCK">
                  На складі
                </option>

                <option value="IN_USE">
                  У виробництві
                </option>

                <option value="FINISHED">
                  Використаний
                </option>

                <option value="WRITTEN_OFF">
                  Списаний
                </option>
              </select>
            </div>

          </div>

          <div className="admin-form-actions">
            <Link
              href="/admin/coils"
              className="admin-secondary-button"
            >
              Скасувати
            </Link>

            <button
              type="submit"
              className="admin-primary-button"
            >
              Додати рулон
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}