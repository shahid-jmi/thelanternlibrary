import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { LogOut, Users } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import PageFrame from '../components/PageFrame';
import BooksPanel from '../components/admin/BooksPanel';
import ProductsPanel from '../components/admin/ProductsPanel';
import CategoriesPanel from '../components/admin/CategoriesPanel';

type DashboardTab = 'books' | 'products' | 'categories';

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const { isSuperAdmin, logout } = useAuth();
  const [tab, setTab] = useState<DashboardTab>('books');

  const tabs: { id: DashboardTab; label: string }[] = [
    { id: 'books', label: t('admin.dashboard.tab.books') },
    { id: 'products', label: t('admin.dashboard.tab.products') },
    { id: 'categories', label: t('admin.dashboard.tab.categories') },
  ];

  return (
    <PageFrame>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-4xl tracking-[0.05em]">{t('admin.dashboard.heading')}</h1>
        <div className="flex gap-2">
          {isSuperAdmin && (
            <Link
              to="/admin/admins"
              className="inline-flex h-10 items-center gap-2 rounded-sm border border-border px-4 text-sm"
            >
              <Users className="h-4 w-4" />
              {t('admin.nav.manageAdmins')}
            </Link>
          )}
          <button
            onClick={logout}
            className="inline-flex h-10 items-center gap-2 rounded-sm border border-border px-4 text-sm"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="mb-8 flex gap-1 border-b border-border" role="tablist">
        {tabs.map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`-mb-px border-b-2 px-5 py-3 text-sm uppercase tracking-[0.14em] transition ${
              tab === item.id
                ? 'border-accent text-accent'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'books' && <BooksPanel />}
      {tab === 'products' && <ProductsPanel />}
      {tab === 'categories' && <CategoriesPanel />}
    </PageFrame>
  );
}
