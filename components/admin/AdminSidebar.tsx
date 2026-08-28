'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  LayoutDashboard,
  Package,
  CircleDot,
  Factory,
  Warehouse,
  ShoppingCart,
  Users,
  Truck,
  Settings,
  LogOut,
} from 'lucide-react';

const menuItems = [
  {
    title: 'Головна',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Товари',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'Рулони металу',
    href: '/admin/coils',
    icon: CircleDot,
  },
  {
    title: 'Виробництво',
    href: '/admin/production',
    icon: Factory,
  },
  {
    title: 'Склад',
    href: '/admin/warehouse',
    icon: Warehouse,
  },
  {
    title: 'Замовлення',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Клієнти',
    href: '/admin/customers',
    icon: Users,
  },
  {
    title: 'Постачальники',
    href: '/admin/suppliers',
    icon: Truck,
  },
  {
    title: 'Налаштування',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <div className="admin-logo">
        <Link href="/admin">
          METALON
          <span>GROUP</span>
        </Link>
      </div>

      <nav className="admin-nav">
        {menuItems.map(({ title, href, icon: Icon }) => {
          const isActive =
            href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`admin-nav-link ${
                isActive ? 'active' : ''
              }`}
            >
              <Icon size={20} />

              <span>{title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="admin-sidebar-footer">
        <button className="admin-logout">
          <LogOut size={20} />
          <span>Вийти</span>
        </button>
      </div>
    </aside>
  );
}