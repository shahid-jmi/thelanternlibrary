import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Clock3, Package, Wallet } from 'lucide-react';
import { useAdminBooks } from '@/app/queries/books';
import { useAdminProducts } from '@/app/queries/products';
import { useAdminDashboard } from '@/app/queries/orders';
import { formatPrice } from '@/app/lib/format';

const STAT_STYLES = {
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
} as const;

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  loading,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: keyof typeof STAT_STYLES;
  loading: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-sm border border-border bg-card p-5">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${STAT_STYLES[color]}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        {loading ? (
          <div className="shimmer h-6 w-14 rounded-sm" />
        ) : (
          <p className="text-2xl leading-none">{value}</p>
        )}
        <p className="mt-1.5 text-xs uppercase tracking-label opacity-60">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardStats() {
  const { t } = useTranslation();
  const booksQuery = useAdminBooks();
  const productsQuery = useAdminProducts();
  const dashboardQuery = useAdminDashboard();

  const books = booksQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const dashboard = dashboardQuery.data;

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        icon={BookOpen}
        label={t('admin.dashboard.stats.books')}
        value={String(books.length)}
        color="blue"
        loading={booksQuery.isPending}
      />
      <StatCard
        icon={Package}
        label={t('admin.dashboard.stats.products')}
        value={String(products.length)}
        color="violet"
        loading={productsQuery.isPending}
      />
      <StatCard
        icon={Clock3}
        label={t('admin.dashboard.stats.toShip')}
        value={String(dashboard?.orders.toShip ?? 0)}
        color="amber"
        loading={dashboardQuery.isPending}
      />
      <StatCard
        icon={Wallet}
        label={t('admin.dashboard.stats.revenueMonth')}
        value={formatPrice(dashboard?.revenue.thisMonth ?? 0)}
        color="emerald"
        loading={dashboardQuery.isPending}
      />
    </div>
  );
}
