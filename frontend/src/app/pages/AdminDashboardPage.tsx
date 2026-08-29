import type { ComponentType } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { BookOpen, ClipboardList, KeyRound, LogOut, Package, Tags, Users } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import PageFrame from '../components/PageFrame';
import BooksPanel from '../components/admin/BooksPanel';
import ProductsPanel from '../components/admin/ProductsPanel';
import CategoriesPanel from '../components/admin/CategoriesPanel';
import OrdersPanel from '../components/admin/OrdersPanel';
import DashboardStats from '../components/admin/DashboardStats';

const DASHBOARD_TABS = ['books', 'products', 'categories', 'orders'] as const;
type DashboardTab = (typeof DASHBOARD_TABS)[number];

const isDashboardTab = (value: string | null): value is DashboardTab =>
  DASHBOARD_TABS.includes(value as DashboardTab);

const TAB_STYLES: Record<DashboardTab, { icon: ComponentType<{ className?: string }>; active: string }> = {
  books: { icon: BookOpen, active: 'border-transparent bg-blue-500/15 text-blue-600 dark:text-blue-400' },
  products: { icon: Package, active: 'border-transparent bg-violet-500/15 text-violet-600 dark:text-violet-400' },
  categories: { icon: Tags, active: 'border-transparent bg-teal-500/15 text-teal-600 dark:text-teal-400' },
  orders: { icon: ClipboardList, active: 'border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400' },
};

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const { isSuperAdmin, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const tab: DashboardTab = isDashboardTab(tabParam) ? tabParam : 'books';

  const tabs: { id: DashboardTab; label: string }[] = [
    { id: 'books', label: t('admin.dashboard.tab.books') },
    { id: 'products', label: t('admin.dashboard.tab.products') },
    { id: 'categories', label: t('admin.dashboard.tab.categories') },
    { id: 'orders', label: t('admin.dashboard.tab.orders') },
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
          <Link
            to="/admin/change-password"
            className="inline-flex h-10 items-center gap-2 rounded-sm border border-border px-4 text-sm"
          >
            <KeyRound className="h-4 w-4" />
            {t('admin.dashboard.changePassword')}
          </Link>
          <button
            onClick={logout}
            className="inline-flex h-10 items-center gap-2 rounded-sm border border-border px-4 text-sm"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      <DashboardStats />

      <div className="mb-8 flex flex-wrap gap-2" role="tablist">
        {tabs.map((item) => {
          const meta = TAB_STYLES[item.id];
          const Icon = meta.icon;
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setSearchParams({ tab: item.id })}
              className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm uppercase tracking-label transition ${
                tab === item.id ? meta.active : 'border-border opacity-60 hover:opacity-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === 'books' && <BooksPanel />}
      {tab === 'products' && <ProductsPanel />}
      {tab === 'categories' && <CategoriesPanel />}
      {tab === 'orders' && <OrdersPanel />}
    </PageFrame>
  );
}
