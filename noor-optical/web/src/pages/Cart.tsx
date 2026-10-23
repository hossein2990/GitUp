import { Link } from 'react-router-dom';
import { cartLineKey, useCart } from '../lib/cart';
import { formatPrice } from '../lib/format';
import { useI18n } from '../lib/i18n';
import { useSettings } from '../lib/settings';
import { Breadcrumbs } from '../components/ui/nav';
import { QuantityStepper } from '../components/ui/form';
import { Button, EmptyState, LinkButton } from '../components/ui/primitives';
import { TrashIcon } from '../components/ui/Icons';

export const CartPage = () => {
  const { t, pick, locale } = useI18n();
  const settings = useSettings();
  const { lines, subtotal, setQuantity, removeLine, clear } = useCart();

  const currency = lines[0]?.currency ?? settings.commerce.currency;
  const threshold = settings.commerce.freeShippingThreshold;
  const shipping = threshold !== null && subtotal >= threshold ? 0 : settings.commerce.shippingFlat;
  const remaining = threshold !== null && subtotal < threshold ? threshold - subtotal : null;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-8 md:py-14">
      <Breadcrumbs items={[{ label: t('nav.home'), to: '/' }, { label: t('cart.title') }]} />
      <h1 className="mt-6 text-display text-navy">{t('cart.title')}</h1>

      {lines.length === 0 ? (
        <EmptyState
          className="mt-10"
          title={t('cart.empty')}
          body={t('cart.emptyBody')}
          action={
            <LinkButton to="/eyeglasses" size="sm">
              {t('nav.eyeglasses')}
            </LinkButton>
          }
        />
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
          <section>
            <ul className="divide-y divide-line border-y border-line">
              {lines.map((line) => {
                const key = cartLineKey(line);
                return (
                  <li key={key} className="flex gap-5 py-6">
                    <Link to={`/product/${line.slug}`} className="shrink-0">
                      {line.imageUrl ? (
                        <img
                          src={line.imageUrl}
                          alt={pick(line.nameFa, line.nameEn)}
                          className="h-32 object-cover"
                          style={{ width: '6.5rem' }}
                        />
                      ) : (
                        <span className="block h-32 w-[6.5rem] bg-navy/[0.06]" />
                      )}
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="label-eyebrow text-slate">{line.brandName}</p>
                          <Link to={`/product/${line.slug}`} className="mt-2 block text-[15px] text-navy">
                            {pick(line.nameFa, line.nameEn)}
                          </Link>
                          <p className="mt-1 text-[13px] text-slate">
                            {pick(line.colorNameFa ?? '', line.colorNameEn ?? '')}
                            {line.sku ? ` · ${line.sku}` : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLine(key)}
                          aria-label={t('action.remove')}
                          className="text-slate transition-colors hover:text-navy"
                        >
                          <TrashIcon size={17} />
                        </button>
                      </div>
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-5">
                        <QuantityStepper
                          value={line.quantity}
                          onChange={(next) => setQuantity(key, next)}
                          label={t('product.quantity')}
                        />
                        <span className="text-[15px] text-navy">
                          {formatPrice(line.unitPrice * line.quantity, locale, line.currency)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <LinkButton to="/eyeglasses" variant="outline" size="sm">
                {t('action.continueShopping')}
              </LinkButton>
              <Button variant="ghost" size="sm" onClick={clear}>
                {t('action.clearAll')}
              </Button>
            </div>
          </section>

          <aside className="lg:sticky lg:top-[96px] lg:self-start">
            <div className="border border-line bg-paper p-6">
              <h2 className="text-[15px] uppercase tracking-label text-navy">{t('checkout.summary')}</h2>
              <dl className="mt-6 space-y-3 text-[14px]">
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

              {remaining ? (
                <p className="mt-4 text-[12px] leading-relaxed text-slate">
                  {t('cart.freeShippingNote', { amount: formatPrice(remaining, locale, currency) })}
                </p>
              ) : null}

              <LinkButton to="/checkout" block size="lg" className="mt-6">
                {t('action.checkout')}
              </LinkButton>
              <p className="mt-4 text-[12px] leading-relaxed text-slate">{t('cart.deliveryNote')}</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
