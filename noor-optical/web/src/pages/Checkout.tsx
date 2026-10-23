import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { cartLineKey, useCart } from '../lib/cart';
import { formatPrice } from '../lib/format';
import { useI18n } from '../lib/i18n';
import { useSettings } from '../lib/settings';
import { useAuth } from '../lib/auth';
import { Breadcrumbs } from '../components/ui/nav';
import { Field, FormNotice, Input, RadioOption, Textarea } from '../components/ui/form';
import { Button, EmptyState, LinkButton } from '../components/ui/primitives';

const LAST_ORDER_EMAIL_KEY = 'noor.lastOrderEmail';

/**
 * Checkout. The browser sends what is being bought; the API re-prices every line
 * from the catalogue, applies shipping and returns the recorded order.
 */
export const CheckoutPage = () => {
  const { t, pick, locale } = useI18n();
  const settings = useSettings();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { lines, subtotal, clear } = useCart();

  const [form, setForm] = useState({
    fullName: user?.fullName ?? '',
    email: user?.email ?? '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    note: '',
    prescriptionStatus: 'later',
    deliveryMethod: 'delivery',
    prescriptionDetails: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<{ status: 'idle' | 'sending' | 'error'; message?: string }>({
    status: 'idle',
  });

  const currency = lines[0]?.currency ?? settings.commerce.currency;
  const threshold = settings.commerce.freeShippingThreshold;
  const shippingFor = (method: string, total: number) =>
    method === 'pickup' || (threshold !== null && total >= threshold) ? 0 : settings.commerce.shippingFlat;

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 md:px-8">
        <EmptyState
          title={t('cart.empty')}
          body={t('cart.emptyBody')}
          action={
            <LinkButton to="/eyeglasses" size="sm">
              {t('nav.eyeglasses')}
            </LinkButton>
          }
        />
      </div>
    );
  }

  const submit = async () => {
    const nextErrors: Record<string, string> = {};
    if (!form.fullName.trim()) nextErrors.fullName = t('checkout.incomplete');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = t('checkout.incomplete');
    if (!form.phone.trim()) nextErrors.phone = t('checkout.incomplete');
    if (form.deliveryMethod === 'delivery') {
      if (!form.address.trim()) nextErrors.address = t('checkout.incomplete');
      if (!form.city.trim()) nextErrors.city = t('checkout.incomplete');
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setState({ status: 'idle' });
      return;
    }

    setState({ status: 'sending' });
    try {
      const order = await api.createOrder({
        items: lines.map((line) => ({
          productId: line.productId,
          variantId: line.variantId,
          quantity: line.quantity,
        })),
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        address: form.address || null,
        city: form.city || null,
        postalCode: form.postalCode || null,
        note: [form.note, form.prescriptionDetails ? `Rx: ${form.prescriptionDetails}` : '']
          .filter(Boolean)
          .join('\n'),
        prescriptionStatus: form.prescriptionStatus,
        deliveryMethod: form.deliveryMethod,
      });
      try {
        window.localStorage.setItem(LAST_ORDER_EMAIL_KEY, form.email.trim().toLowerCase());
      } catch {
        // Non-fatal.
      }
      clear();
      navigate(`/order/${order.orderNumber}`, { state: { order } });
    } catch (cause) {
      setState({
        status: 'error',
        message: cause instanceof ApiError ? cause.message : t('common.errorBody'),
      });
    }
  };

  const shipping = shippingFor(form.deliveryMethod, subtotal);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-8 md:py-14">
      <Breadcrumbs
        items={[
          { label: t('nav.home'), to: '/' },
          { label: t('cart.title'), to: '/cart' },
          { label: t('checkout.title') },
        ]}
      />
      <h1 className="mt-6 text-display text-navy">{t('checkout.title')}</h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-10">
          <section>
            <h2 className="text-[15px] uppercase tracking-label text-navy">{t('checkout.contact')}</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label={t('checkout.fullName')} required htmlFor="co-name" error={errors.fullName}>
                <Input id="co-name" value={form.fullName} onChange={(event) => update('fullName')(event.target.value)} autoComplete="name" />
              </Field>
              <Field label={t('checkout.phone')} required htmlFor="co-phone" error={errors.phone}>
                <Input id="co-phone" value={form.phone} onChange={(event) => update('phone')(event.target.value)} autoComplete="tel" />
              </Field>
              <Field label={t('checkout.email')} required htmlFor="co-email" error={errors.email} className="sm:col-span-2">
                <Input id="co-email" type="email" value={form.email} onChange={(event) => update('email')(event.target.value)} autoComplete="email" />
              </Field>
            </div>
          </section>

          <section>
            <h2 className="text-[15px] uppercase tracking-label text-navy">{t('checkout.deliveryMethod')}</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <RadioOption
                label={t('checkout.deliveryHome')}
                description={pick(settings.commerce.deliveryDaysFa, settings.commerce.deliveryDaysEn)}
                checked={form.deliveryMethod === 'delivery'}
                onSelect={() => update('deliveryMethod')('delivery')}
              />
              <RadioOption
                label={t('checkout.pickup')}
                description={pick(settings.contact.addressFa, settings.contact.addressEn)}
                checked={form.deliveryMethod === 'pickup'}
                onSelect={() => update('deliveryMethod')('pickup')}
              />
            </div>

            {form.deliveryMethod === 'delivery' ? (
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label={t('checkout.address')} required htmlFor="co-address" error={errors.address} className="sm:col-span-2">
                  <Input id="co-address" value={form.address} onChange={(event) => update('address')(event.target.value)} autoComplete="street-address" />
                </Field>
                <Field label={t('checkout.city')} required htmlFor="co-city" error={errors.city}>
                  <Input id="co-city" value={form.city} onChange={(event) => update('city')(event.target.value)} autoComplete="address-level2" />
                </Field>
                <Field label={t('checkout.postalCode')} htmlFor="co-postal" optionalLabel={t('common.optional')}>
                  <Input id="co-postal" value={form.postalCode} onChange={(event) => update('postalCode')(event.target.value)} autoComplete="postal-code" />
                </Field>
              </div>
            ) : null}
          </section>

          <section>
            <h2 className="text-[15px] uppercase tracking-label text-navy">{t('checkout.prescriptionStatus')}</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <RadioOption
                label={t('checkout.prescriptionUploaded')}
                checked={form.prescriptionStatus === 'uploaded'}
                onSelect={() => update('prescriptionStatus')('uploaded')}
              />
              <RadioOption
                label={t('checkout.prescriptionLater')}
                checked={form.prescriptionStatus === 'later'}
                onSelect={() => update('prescriptionStatus')('later')}
              />
              <RadioOption
                label={t('checkout.prescriptionNotRequired')}
                checked={form.prescriptionStatus === 'not_required'}
                onSelect={() => update('prescriptionStatus')('not_required')}
              />
            </div>
            {form.prescriptionStatus !== 'not_required' ? (
              <div className="mt-5 grid gap-5">
                <Field label={t('checkout.prescriptionFields')} htmlFor="co-rx" hint={t('checkout.prescriptionHint')}>
                  <Textarea
                    id="co-rx"
                    value={form.prescriptionDetails}
                    onChange={(event) => update('prescriptionDetails')(event.target.value)}
                    placeholder="OD: -1.25 / -0.50 × 90 · OS: -1.00"
                  />
                </Field>
              </div>
            ) : null}
            <div className="mt-5">
              <Field label={t('checkout.note')} htmlFor="co-note" optionalLabel={t('common.optional')}>
                <Textarea id="co-note" value={form.note} onChange={(event) => update('note')(event.target.value)} />
              </Field>
            </div>
          </section>

          <section>
            <h2 className="text-[15px] uppercase tracking-label text-navy">{t('checkout.paymentTitle')}</h2>
            <FormNotice tone="info">
              {t('checkout.paymentNote')}
              {settings.commerce.codEnabled ? null : null}
            </FormNotice>
          </section>
        </div>

        <aside className="lg:sticky lg:top-[96px] lg:self-start">
          <div className="border border-line bg-paper p-6">
            <h2 className="text-[15px] uppercase tracking-label text-navy">{t('checkout.summary')}</h2>
            <ul className="mt-5 space-y-4 border-b border-line pb-5">
              {lines.map((line) => (
                <li key={cartLineKey(line)} className="flex items-start gap-3">
                  {line.imageUrl ? (
                    <img src={line.imageUrl} alt={pick(line.nameFa, line.nameEn)} className="h-16 w-14 object-cover" />
                  ) : null}
                  <div className="min-w-0 flex-1 text-[13px]">
                    <p className="text-ink">{pick(line.nameFa, line.nameEn)}</p>
                    <p className="mt-1 text-slate">
                      {pick(line.colorNameFa ?? '', line.colorNameEn ?? '')} × {line.quantity}
                    </p>
                  </div>
                  <span className="text-[13px] text-navy">
                    {formatPrice(line.unitPrice * line.quantity, locale, line.currency)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-3 text-[14px]">
              <div className="flex items-center justify-between">
                <dt className="text-slate">{t('cart.subtotal')}</dt>
                <dd className="text-navy">{formatPrice(subtotal, locale, currency)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate">{t('cart.shipping')}</dt>
                <dd className="text-navy">
                  {shipping === 0 ? t('cart.shippingFree') : formatPrice(shipping, locale, currency)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-line pt-3">
                <dt className="text-navy">{t('cart.total')}</dt>
                <dd className="text-[16px] text-navy">{formatPrice(subtotal + shipping, locale, currency)}</dd>
              </div>
            </dl>

            {state.status === 'error' ? (
              <div className="mt-5">
                <FormNotice tone="error">{state.message}</FormNotice>
              </div>
            ) : null}

            <Button
              block
              size="lg"
              className="mt-6"
              onClick={submit}
              loading={state.status === 'sending'}
            >
              {t('action.placeOrder')}
            </Button>
            <Link to="/cart" className="mt-4 block text-center text-[12px] text-slate underline decoration-champagne decoration-2 underline-offset-4">
              {t('cart.title')}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};
