import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { getErrorMessage } from '@/app/api/client';
import { getAdminCustomer, getAdminCustomers } from '@/app/api/customer';
import { useDebouncedValue } from '@/app/lib/useDebouncedValue';
import { formatPrice } from '@/app/lib/format';
import StatusMessage from '@/app/components/StatusMessage';
import Loader from '@/app/components/Loader';
import { Button, EmptyTableRow, Table, TableHead, TableRow, Td, Th } from '@/app/components/ui';

const formatDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';

export default function CustomersPanel() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const customersQuery = useQuery({
    queryKey: ['admin', 'customers', debouncedSearch, page],
    queryFn: () => getAdminCustomers({ search: debouncedSearch.trim() || undefined, page }),
    placeholderData: keepPreviousData,
  });
  const data = customersQuery.data;

  return (
    <section>
      <p className="mb-4 max-w-2xl text-sm opacity-70">{t('admin.customers.intro')}</p>
      <div className="relative mb-6 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 rtl:left-auto rtl:right-3" />
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder={t('admin.customers.search')}
          className="h-11 w-full rounded-sm border border-border bg-input-background px-9 text-sm outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/25"
        />
      </div>

      {customersQuery.isError && (
        <StatusMessage tone="error">{getErrorMessage(customersQuery.error)}</StatusMessage>
      )}
      {customersQuery.isPending ? (
        <Loader />
      ) : (
        <Table>
          <TableHead>
            <tr>
              <Th>{t('admin.orders.customer')}</Th>
              <Th>{t('order.phone')}</Th>
              <Th>{t('admin.customers.orders')}</Th>
              <Th>{t('admin.customers.spent')}</Th>
              <Th>{t('admin.customers.joined')}</Th>
            </tr>
          </TableHead>
          <tbody>
            {data?.customers.length === 0 && (
              <EmptyTableRow colSpan={5} message={t('admin.customers.none')} />
            )}
            {data?.customers.map((customer) => {
              const expanded = expandedId === customer._id;
              return (
                <Fragment key={customer._id}>
                  <TableRow>
                    <Td>
                      <button
                        type="button"
                        onClick={() => setExpandedId(expanded ? null : customer._id)}
                        aria-expanded={expanded}
                        className="flex items-start gap-1 text-left hover:text-ember rtl:text-right"
                      >
                        {expanded ? (
                          <ChevronUp className="mt-0.5 h-4 w-4 shrink-0" />
                        ) : (
                          <ChevronDown className="mt-0.5 h-4 w-4 shrink-0" />
                        )}
                        <span>
                          <span className="block">{customer.name}</span>
                          <span className="block text-xs opacity-60">
                            {customer.email}
                            {!customer.emailVerified && ` · ${t('admin.customers.unverified')}`}
                          </span>
                        </span>
                      </button>
                    </Td>
                    <Td>{customer.phone || '—'}</Td>
                    <Td>{customer.orderCount}</Td>
                    <Td>{formatPrice(customer.totalSpent)}</Td>
                    <Td>{formatDate(customer.createdAt)}</Td>
                  </TableRow>
                  {expanded && (
                    <tr className="border-b border-border/70 bg-secondary/40">
                      <td colSpan={5} className="px-4 py-4">
                        <CustomerDetail id={customer._id} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </Table>
      )}

      {data && data.total > data.pageSize && (
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            {t('admin.orders.previous')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page * data.pageSize >= data.total}
            onClick={() => setPage(page + 1)}
          >
            {t('admin.orders.next')}
          </Button>
        </div>
      )}
    </section>
  );
}

function CustomerDetail({ id }: { id: string }) {
  const { t } = useTranslation();
  const detailQuery = useQuery({
    queryKey: ['admin', 'customer', id],
    queryFn: () => getAdminCustomer(id),
  });

  if (detailQuery.isPending) return <Loader />;
  if (detailQuery.isError) {
    return <StatusMessage tone="error">{getErrorMessage(detailQuery.error)}</StatusMessage>;
  }
  const customer = detailQuery.data;

  return (
    <div className="grid gap-6 text-sm md:grid-cols-2">
      <div>
        <h3 className="mb-2 text-xs uppercase tracking-label opacity-60">
          {t('account.tab.addresses')}
        </h3>
        {customer.addresses.length === 0 && <p className="opacity-60">—</p>}
        <ul className="space-y-2">
          {customer.addresses.map((address) => (
            <li key={address._id}>
              {address.label && <span className="opacity-60">{address.label}: </span>}
              {address.addressLine}, {address.locality}, {address.city}, {address.state} -{' '}
              {address.pincode} · {address.phone}
            </li>
          ))}
        </ul>
        <p className="mt-3 opacity-60">
          {t('admin.customers.lastSignIn')}: {formatDate(customer.lastLoginAt)}
        </p>
      </div>
      <div>
        <h3 className="mb-2 text-xs uppercase tracking-label opacity-60">
          {t('admin.customers.recentOrders')}
        </h3>
        {customer.orders.length === 0 && <p className="opacity-60">—</p>}
        <ul className="space-y-1">
          {customer.orders.map((order) => (
            <li key={order._id} className="flex justify-between gap-3">
              <span>
                {order.orderNumber} · {formatDate(order.createdAt)} ·{' '}
                {t(`admin.orders.status.${order.status}`)}
              </span>
              <span>{formatPrice(order.total)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
