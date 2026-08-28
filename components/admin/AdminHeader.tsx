import { Bell, Search, User } from 'lucide-react';

export default function AdminHeader() {
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
            <p>Адміністратор</p>
            <span>ADMIN</span>
          </div>
        </div>
      </div>
    </header>
  );
}