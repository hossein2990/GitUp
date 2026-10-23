import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { ORDER_STATUS_KEYS } from '../../lib/catalog';
import { formatDate, formatNumber, formatPrice } from '../../lib/format';
import { useAsync } from '../../lib/hooks';
import { useI18n } from '../../lib/i18n';
import { Button, EmptyState, Skeleton } from '../../components/ui/primitives';

export const AdminDashboard = () => {
  const { t, pick, locale } = useI18n();
  const stats = useAsync(() => api.admin.stats(), []);

  if (stats.loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  if (stats.error || !stats.data) {
    return (
      <EmptyState
        title={t('common.errorTitle')}
        body={t('common.errorBody')}
        action={
          <Button variant="outline" size="sm" onClick={stats.reload}>
            {t('action.retry')}
          </Button>
        }
      />
    );
  }

  const totals = stats.data.totals;
  const tiles = [
    { label: t('admin.revenue'), value: formatPrice(totals.revenue, locale, 'IRT') },
    { label: t('admin.pendingOrders'), value: formatNumber(totals.pendingOrders, locale) },
    { label: t('admin.orders'), value: formatNumber(totals.totalOrders, locale) },
    { label: t('admin.activeProducts'), value: formatNumber(totals.activeProducts, locale) },
    { label: t('admin.outOfStock'), value: formatNumber(totals.outOfStockVariants, locale) },
    { label: t('admin.customersCount'), value: formatNumber(totals.customers, locale) },
    { label: t('admin.newAppointments'), value: formatNumber(totals.newAppointments, locale) },
    { label: t('admin.newMessages'), value: formatNumber(totals.newMessages, locale) },
  ];

  return (
    <div className="space-y-10">
      <section>
        <dl className="grid gap-px border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
          {tiles.map((tile) => (
            <div key={tile.label} className="bg-paper p-5">
              <dt className="label-eyebrow text-slate">{tile.label}</dt>
              <dd className="mt-3 text-[20px] text-navy">{tile.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[15px] uppercase tracking-label text-navy">{t('admin.recentOrders')}</h2>
          <Link to="/admin/orders" className="text-[12px] uppercase tracking-label text-slate transition-colors hover:text-navy">
            {t('admin.orders')}
          </Link>
        </div>

        {stats.data.recentOrders.length === 0 ? (
          <EmptyState className="mt-5" title={t('account.noOrders')} />
        ) : (
          <ul className="mt-5 divide-y divide-line border border-line bg-paper">
            {stats.data.recentOrders.map((order) => (
              <li key={order.orderNumber} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-[14px] text-navy">{order.orderNumber}</p>
                  <p className="mt-1 text-[12px] text-slate">
                    {order.customerName} · {formatDate(order.createdAt, locale, true)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[13px] text-navy">{formatPrice(order.total, locale, order.currency)}</span>
                  <span className="border border-line px-2 py-1 text-[11px] uppercase tracking-label text-slate">
                    {t(ORDER_STATUS_KEYS[order.status] ?? 'order.status.pending')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-[12px] leading-relaxed text-slate">{t('admin.settingsNote')}</p>
    </div>
  );
};
