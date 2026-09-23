import './admin.css';
import type { ReactNode } from 'react';

import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { requireRole } from '@/lib/auth';

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  const user = await requireRole('ADMIN', 'MANAGER', 'PRODUCTION', 'WAREHOUSE');
  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-main">
        <AdminHeader user={user} />

        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
