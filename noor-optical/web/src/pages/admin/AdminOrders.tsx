import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { ORDER_STATUS_KEYS } from '../../lib/catalog';
import { formatDate, formatPrice } from '../../lib/format';
import { useI18n } from '../../lib/i18n';
import type { Order } from '../../lib/types';
import { Button, EmptyState, Skeleton } from '../../components/ui/primitives';

export const AdminOrders = () => {
  const { t, pick, locale } = useI18n();
  const [status, setStatus] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.admin.orders({ status: status || undefined });
      setOrders(result.items);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('common.errorBody'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const update = async (order: Order, nextStatus: string) => {
    if (order.id === undefined) return;
    await api.admin.updateOrder(order.id, nextStatus);
    await load();
  };

  const statuses = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[15px] uppercase tracking-label text-navy">{t('admin.orders')}</h1>
        <label className="flex items-center gap-3 text-[12px] uppercase tracking-label text-slate">
          {t('order.status')}
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="border border-line bg-paper px-3 py-2 text-[13px] normal-case tracking-normal text-navy"
          >
            <option value="">—</option>
            {statuses.map((entry) => (
              <option key={entry} value={entry}>
                {t(ORDER_STATUS_KEYS[entry] ?? 'order.status.pending')}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? <Skeleton className="h-64 w-full" /> : null}
      {error ? <p className="text-[14px] text-[#8E3722]">{error}</p> : null}

      {!loading && orders.length === 0 ? <EmptyState title={t('account.noOrders')} /> : null}

      {orders.length ? (
        <ul className="divide-y divide-line border border-line bg-paper">
          {orders.map((order) => (
            <li key={order.orderNumber} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[14px] text-navy">{order.orderNumber}</p>
                  <p className="mt-1 text-[12px] text-slate">
                    {order.customerName} · {order.customerPhone} · {order.customerEmail}
                  </p>
                  <p className="mt-1 text-[12px] text-slate">{formatDate(order.createdAt, locale, true)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[14px] text-navy">{formatPrice(order.total, locale, order.currency)}</span>
                  <select
                    value={order.status}
                    onChange={(event) => void update(order, event.target.value)}
                    className="border border-line bg-ivory px-3 py-2 text-[12px] text-navy"
                  >
                    {statuses.map((entry) => (
                      <option key={entry} value={entry}>
                        {t(ORDER_STATUS_KEYS[entry] ?? 'order.status.pending')}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setExpanded(expanded === order.orderNumber ? null : order.orderNumber)}
                  >
                    {expanded === order.orderNumber ? t('action.close') : t('action.viewDetails')}
                  </Button>
                </div>
              </div>

              {expanded === order.orderNumber ? (
                <div className="mt-5 border-t border-line pt-4">
                  <ul className="space-y-3">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between gap-4 text-[13px]">
                        <span className="text-ink">
                          {pick(item.nameFa, item.nameEn)}
                          <span className="ms-2 text-slate">
                            {pick(item.colorNameFa ?? '', item.colorNameEn ?? '')} × {item.quantity}
                          </span>
                        </span>
                        <span className="text-navy">{formatPrice(item.lineTotal, locale, order.currency)}</span>
                      </li>
                    ))}
                  </ul>
                  <dl className="mt-4 grid gap-2 text-[12px] text-slate sm:grid-cols-2">
                    <div>
                      <dt className="inline">{t('checkout.delivery')}: </dt>
                      <dd className="inline text-navy">
                        {[order.address, order.city, order.postalCode].filter(Boolean).join(', ') || '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline">{t('cart.prescription')}: </dt>
                      <dd className="inline text-navy">{order.prescriptionStatus}</dd>
                    </div>
                    {order.note ? (
                      <div className="sm:col-span-2">
                        <dt className="inline">{t('checkout.note')}: </dt>
                        <dd className="inline whitespace-pre-line text-navy">{order.note}</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};
