import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { ORDER_STATUS_KEYS, PRESCRIPTION_STATUS_KEYS } from '../lib/catalog';
import { formatDate, formatPrice } from '../lib/format';
import { useI18n } from '../lib/i18n';
import type { Order } from '../lib/types';
import { Breadcrumbs } from '../components/ui/nav';
import { Button, EmptyState, LinkButton } from '../components/ui/primitives';
import { CheckIcon } from '../components/ui/Icons';

const LAST_ORDER_EMAIL_KEY = 'noor.lastOrderEmail';

export const readLastOrderEmail = () => {
  try {
    return window.localStorage.getItem(LAST_ORDER_EMAIL_KEY) ?? '';
  } catch {
    return '';
  }
};

/** Shared order receipt used by the confirmation, tracking and account pages. */
export const OrderSummaryCard = ({ order }: { order: Order }) => {
  const { t, pick, locale } = useI18n();
  const statusKey = ORDER_STATUS_KEYS[order.status] ?? 'order.status.pending';
  const prescriptionKey = PRESCRIPTION_STATUS_KEYS[order.prescriptionStatus] ?? 'order.prescription.later';

  return (
    <div className="border border-line bg-paper">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line p-6">
        <div>
          <p className="label-eyebrow text-slate">{t('order.number')}</p>
          <p className="mt-2 text-[18px] text-navy">{order.orderNumber}</p>
          <p className="mt-2 text-[13px] text-slate">{formatDate(order.createdAt, locale, true)}</p>
        </div>
        <div className="text-end">
          <p className="label-eyebrow text-slate">{t('order.status')}</p>
          <p className="mt-2 inline-flex items-center gap-2 border border-champagne/60 bg-champagne/10 px-3 py-1 text-[13px] text-navy">
            {t(statusKey)}
          </p>
          <p className="mt-3 text-[12px] text-slate">
            {t('cart.prescription')}: {t(prescriptionKey)}
          </p>
        </div>
      </div>

      <ul className="divide-y divide-line">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-4 p-5">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={pick(item.nameFa, item.nameEn)} className="h-20 w-16 object-cover" />
            ) : (
              <span className="block h-20 w-16 bg-navy/[0.06]" />
            )}
            <div className="min-w-0 flex-1">
              {item.slug ? (
                <Link to={`/product/${item.slug}`} className="text-[14px] text-navy transition-colors hover:text-champagne-dark">
                  {pick(item.nameFa, item.nameEn)}
                </Link>
              ) : (
                <span className="text-[14px] text-navy">{pick(item.nameFa, item.nameEn)}</span>
              )}
              <p className="mt-1 text-[12px] text-slate">
                {[item.brandName, pick(item.colorNameFa ?? '', item.colorNameEn ?? ''), `× ${item.quantity}`]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
            <span className="text-[14px] text-navy">{formatPrice(item.lineTotal, locale, order.currency)}</span>
          </li>
        ))}
      </ul>

      <dl className="space-y-3 border-t border-line p-6 text-[14px]">
        <div className="flex items-center justify-between">
          <dt className="text-slate">{t('cart.subtotal')}</dt>
          <dd className="text-navy">{formatPrice(order.subtotal, locale, order.currency)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-slate">{t('cart.shipping')}</dt>
          <dd className="text-navy">
            {order.shipping === 0 ? t('cart.shippingFree') : formatPrice(order.shipping, locale, order.currency)}
          </dd>
        </div>
        <div className="flex items-center justify-between border-t border-line pt-3">
          <dt className="text-navy">{t('cart.total')}</dt>
          <dd className="text-[16px] text-navy">{formatPrice(order.total, locale, order.currency)}</dd>
        </div>
      </dl>
    </div>
  );
};

export const OrderConfirmationPage = () => {
  const { orderNumber = '' } = useParams();
  const { t } = useI18n();
  const location = useLocation();
  const stateOrder = (location.state as { order?: Order } | null)?.order ?? null;
  const [order, setOrder] = useState<Order | null>(stateOrder);
  const [loading, setLoading] = useState(!stateOrder);

  useEffect(() => {
    if (stateOrder) return;
    const email = readLastOrderEmail();
    if (!email) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    api
      .order(orderNumber, email)
      .then((result) => {
        if (!cancelled) setOrder(result);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderNumber, stateOrder]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center md:px-8">
        <p className="text-[15px] text-slate">{t('common.loading')}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 md:px-8">
        <EmptyState
          title={t('order.notFound')}
          body={t('order.trackBody')}
          action={
            <LinkButton to="/track-order" size="sm">
              {t('action.trackOrder')}
            </LinkButton>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
      <Breadcrumbs items={[{ label: t('nav.home'), to: '/' }, { label: t('order.number') }]} />

      <div className="mt-8 flex items-start gap-4">
        <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-champagne bg-champagne/15 text-champagne-dark">
          <CheckIcon size={20} />
        </span>
        <div>
          <h1 className="text-display text-navy">{t('order.received')}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-slate">{t('order.thanks')}</p>
        </div>
      </div>

      <div className="mt-10">
        <OrderSummaryCard order={order} />
      </div>

      {order.address || order.city ? (
        <div className="mt-6 border border-line bg-paper p-6 text-[14px] text-slate">
          <p className="label-eyebrow text-slate">{t('checkout.delivery')}</p>
          <p className="mt-3 text-navy">{order.customerName}</p>
          <p className="mt-1">{order.customerPhone}</p>
          <p className="mt-1">{[order.address, order.city, order.postalCode].filter(Boolean).join(', ')}</p>
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <LinkButton to="/eyeglasses" variant="outline" size="sm">
          {t('action.continueShopping')}
        </LinkButton>
        <LinkButton to="/track-order" variant="ghost" size="sm">
          {t('action.trackOrder')}
        </LinkButton>
      </div>
    </div>
  );
};

export const TrackOrderPage = () => {
  const { t } = useI18n();
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState(readLastOrderEmail());
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const lookup = async () => {
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const result = await api.order(orderNumber.trim(), email.trim());
      setOrder(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('order.notFound'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
      <Breadcrumbs items={[{ label: t('nav.home'), to: '/' }, { label: t('action.trackOrder') }]} />
      <h1 className="mt-6 text-display text-navy">{t('order.trackTitle')}</h1>
      <p className="mt-4 text-[15px] text-slate">{t('order.trackBody')}</p>

      <form
        className="mt-8 grid gap-5 border border-line bg-paper p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          void lookup();
        }}
      >
        <label className="flex flex-col gap-2">
          <span className="label-eyebrow text-slate">{t('order.number')}</span>
          <input
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value)}
            placeholder="NO-260101-1234"
            className="border border-line bg-ivory px-4 py-3 text-[15px] text-ink focus:border-navy focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="label-eyebrow text-slate">{t('checkout.email')}</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="border border-line bg-ivory px-4 py-3 text-[15px] text-ink focus:border-navy focus:outline-none"
          />
        </label>
        <Button type="submit" loading={loading}>
          {t('action.trackOrder')}
        </Button>
      </form>

      {error ? <p className="mt-6 text-[14px] text-[#8E3722]">{error}</p> : null}

      {order ? (
        <div className="mt-8">
          <OrderSummaryCard order={order} />
        </div>
      ) : null}
    </div>
  );
};
