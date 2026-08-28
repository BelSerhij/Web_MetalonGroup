import { Package, CircleDollarSign, Factory, ShoppingCart, } from 'lucide-react';


export default function AdminDashboard() {
  const stats = [
    {
      title: 'Товарів на складі',
      value: '1 907 м²',
      icon: Package,
    },
    {
      title: 'Продажі за місяць',
      value: '26 000 грн',
      icon: CircleDollarSign,
    },
    {
      title: 'Виробництво',
      value: '3 партії',
      icon: Factory,
    },
    {
      title: 'Замовлення',
      value: '1',
      icon: ShoppingCart,
    },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Головна</h1>

          <p>
            Огляд роботи METALON GROUP
          </p>
        </div>
      </div>

      <div className="admin-stats">
        {stats.map(({ title, value, icon: Icon }) => (
          <div
            key={title}
            className="admin-stat-card"
          >
            <div className="admin-stat-icon">
              <Icon size={24} />
            </div>

            <div>
              <p>{title}</p>
              <h2>{value}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}