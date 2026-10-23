import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useAsync } from '../lib/hooks';
import { useI18n } from '../lib/i18n';
import { Breadcrumbs } from '../components/ui/nav';
import { Field, FormNotice, Input } from '../components/ui/form';
import { Button, EmptyState, LinkButton, Skeleton } from '../components/ui/primitives';
import { OrderSummaryCard } from './OrderConfirmation';

export const AccountPage = () => {
  const { t } = useI18n();
  const { user, ready, isStaff, signOut } = useAuth();

  if (!ready) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        <Breadcrumbs items={[{ label: t('nav.home'), to: '/' }, { label: t('action.account') }]} />
        <EmptyState
          className="mt-8"
          title={t('account.guestTitle')}
          body={t('account.guestBody')}
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <LinkButton to="/login" size="sm">
                {t('action.login')}
              </LinkButton>
              <LinkButton to="/track-order" size="sm" variant="outline">
                {t('action.trackOrder')}
              </LinkButton>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-8 md:py-16">
      <Breadcrumbs items={[{ label: t('nav.home'), to: '/' }, { label: t('action.myAccount') }]} />

      <header className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display text-navy">{t('account.title')}</h1>
          <p className="mt-3 text-[15px] text-slate">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {isStaff ? (
            <LinkButton to="/admin" size="sm" variant="outline">
              {t('admin.title')}
            </LinkButton>
          ) : null}
          <Button variant="ghost" size="sm" onClick={signOut}>
            {t('action.logout')}
          </Button>
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <ProfilePanel />
        <OrdersPanel />
      </div>
    </div>
  );
};

const ProfilePanel = () => {
  const { t } = useI18n();
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({ fullName: user?.fullName ?? '', phone: '' });
  const [state, setState] = useState<{ status: 'idle' | 'saving' | 'saved' | 'error'; message?: string }>({
    status: 'idle',
  });

  const save = async () => {
    setState({ status: 'saving' });
    try {
      await api.updateMe({ fullName: form.fullName || null, phone: form.phone || null });
      await refresh();
      setState({ status: 'saved' });
    } catch (cause) {
      setState({
        status: 'error',
        message: cause instanceof ApiError ? cause.message : t('common.errorBody'),
      });
    }
  };

  return (
    <section className="border border-line bg-paper p-6">
      <h2 className="text-[15px] uppercase tracking-label text-navy">{t('account.profile')}</h2>
      <div className="mt-5 space-y-5">
        <Field label={t('auth.fullName')} htmlFor="acct-name">
          <Input
            id="acct-name"
            value={form.fullName}
            onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
          />
        </Field>
        <Field label={t('auth.phone')} htmlFor="acct-phone" optionalLabel={t('common.optional')}>
          <Input
            id="acct-phone"
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
          />
        </Field>
        <Field label={t('checkout.email')} htmlFor="acct-email">
          <Input id="acct-email" value={user?.email ?? ''} disabled />
        </Field>
        {state.status === 'saved' ? <FormNotice tone="success">{t('account.updated')}</FormNotice> : null}
        {state.status === 'error' ? <FormNotice tone="error">{state.message}</FormNotice> : null}
        <Button onClick={save} loading={state.status === 'saving'}>
          {t('action.save')}
        </Button>
      </div>
    </section>
  );
};

const OrdersPanel = () => {
  const { t } = useI18n();
  const orders = useAsync(() => api.myOrders(), []);

  return (
    <section>
      <h2 className="text-[15px] uppercase tracking-label text-navy">{t('account.orders')}</h2>
      <div className="mt-5 space-y-6">
        {orders.loading ? <Skeleton className="h-56 w-full" /> : null}
        {orders.error ? (
          <EmptyState
            title={t('common.errorTitle')}
            body={t('common.errorBody')}
            action={
              <Button variant="outline" size="sm" onClick={orders.reload}>
                {t('action.retry')}
              </Button>
            }
          />
        ) : null}
        {!orders.loading && !orders.error && (orders.data?.items.length ?? 0) === 0 ? (
          <EmptyState
            title={t('account.noOrders')}
            body={t('cart.emptyBody')}
            action={
              <LinkButton to="/eyeglasses" size="sm" variant="outline">
                {t('nav.eyeglasses')}
              </LinkButton>
            }
          />
        ) : null}
        {(orders.data?.items ?? []).map((order) => (
          <OrderSummaryCard key={order.orderNumber} order={order} />
        ))}
      </div>
      <p className="mt-6 text-[13px] text-slate">
        <Link to="/track-order" className="underline decoration-champagne decoration-2 underline-offset-4">
          {t('action.trackOrder')}
        </Link>
      </p>
    </section>
  );
};
