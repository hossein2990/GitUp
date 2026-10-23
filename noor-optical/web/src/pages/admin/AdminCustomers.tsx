import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { formatDate, formatDigits, formatPrice } from '../../lib/format';
import { useI18n } from '../../lib/i18n';
import { Button, EmptyState, Skeleton } from '../../components/ui/primitives';

type Customer = Awaited<ReturnType<typeof api.admin.customers>>['items'][number];

export const AdminCustomers = () => {
  const { t, locale, formatNumber } = useI18n();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.admin.customers();
      setCustomers(result.items);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('common.errorBody'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <Skeleton className="h-64 w-full" />;
  if (error) {
    return (
      <EmptyState
        title={t('common.errorTitle')}
        body={t('common.errorBody')}
        action={
          <Button variant="outline" size="sm" onClick={() => void load()}>
            {t('action.retry')}
          </Button>
        }
      />
    );
  }

  if (customers.length === 0) return <EmptyState title={t('common.noResults')} />;

  return (
    <div className="overflow-x-auto border border-line bg-paper">
      <table className="w-full min-w-[720px] text-[13px]">
        <thead className="border-b border-line bg-ivory text-[11px] uppercase tracking-label text-slate">
          <tr>
            <th className="p-3 text-start">{t('admin.customers')}</th>
            <th className="p-3 text-start">{t('checkout.phone')}</th>
            <th className="p-3 text-start">{t('admin.orders')}</th>
            <th className="p-3 text-start">{t('admin.revenue')}</th>
            <th className="p-3 text-start">{t('nav.appointment')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td className="p-3">
                <p className="text-navy">{customer.fullName ?? '—'}</p>
                <p className="mt-1 text-[11px] text-slate">{customer.email}</p>
              </td>
              <td className="p-3 text-slate">{customer.phone ? formatDigits(customer.phone, locale) : '—'}</td>
              <td className="p-3 text-slate">{formatNumber(customer.orderCount, locale)}</td>
              <td className="p-3 text-navy">{formatPrice(customer.lifetimeValue, locale, 'IRT')}</td>
              <td className="p-3 text-slate">{formatDate(customer.createdAt, locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
