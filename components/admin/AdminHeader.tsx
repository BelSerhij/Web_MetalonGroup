import { Bell, Search, User } from 'lucide-react';
import { logout } from '@/app/login/actions';

type Props = { user: { name: string; role: string } };

export default function AdminHeader({ user }: Props) {
  return (
    <header className="admin-header">
      <div className="admin-header-search">
        <Search size={20} />

        <input
          type="text"
          placeholder="Пошук..."
        />
      </div>

      <div className="admin-header-actions">
        <button className="admin-icon-button">
          <Bell size={20} />
        </button>

        <div className="admin-user">
          <div className="admin-user-avatar">
            <User size={20} />
          </div>

          <div>
            <p>{user.name}</p>
            <span>{user.role}</span>
          </div>
          <form action={logout}><button type="submit" className="admin-icon-button" aria-label="Вийти">Вийти</button></form>
        </div>
      </div>
    </header>
  );
}
