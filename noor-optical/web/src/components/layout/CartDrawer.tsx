import { Link } from 'react-router-dom';
import { cartLineKey, useCart } from '../../lib/cart';
import { formatPrice } from '../../lib/format';
import { useI18n } from '../../lib/i18n';
import { useSettings } from '../../lib/settings';
import { Drawer } from '../ui/overlay';
import { QuantityStepper } from '../ui/form';
import { LinkButton } from '../ui/primitives';
import { TrashIcon } from '../ui/Icons';

/**
 * The bag: full-height panel, frame price and lens upgrades kept visually
 * separate, and a clear line price on every item.
 */
export const CartDrawer = () => {
  const { t, pick, locale } = useI18n();
  const settings = useSettings();
  const { lines, isOpen, closeCart, setQuantity, removeLine, subtotal, count } = useCart();

  const threshold = settings.commerce.freeShippingThreshold;
  const remaining = threshold !== null && subtotal < threshold ? threshold - subtotal : null;

  return (
    <Drawer
      open={isOpen}
      onClose={closeCart}
      title={`${t('cart.title')} (${count})`}
      closeLabel={t('action.close')}
      footer={
        lines.length ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[15px]">
              <span className="text-slate">{t('cart.subtotal')}</span>
              <span className="text-navy">{formatPrice(subtotal, locale, lines[0]?.currency ?? 'IRT')}</span>
            </div>
            <p className="text-[12px] text-slate">
              {remaining
                ? t('cart.freeShippingNote', {
                    amount: formatPrice(remaining, locale, lines[0]?.currency ?? 'IRT'),
                  })
                : t('cart.deliveryNote')}
            </p>
            <LinkButton to="/checkout" block size="lg" onClick={closeCart}>
              {t('action.checkout')}
            </LinkButton>
            <LinkButton to="/cart" block variant="outline" size="sm" onClick={closeCart}>
              {t('cart.title')}
            </LinkButton>
          </div>
        ) : null
      }
    >
      {lines.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[15px] text-navy">{t('cart.empty')}</p>
          <p className="mx-auto mt-2 max-w-xs text-[14px] text-slate">{t('cart.emptyBody')}</p>
          <Link
            to="/eyeglasses"
            onClick={closeCart}
            className="mt-6 inline-block text-[13px] uppercase tracking-label text-navy underline decoration-champagne decoration-2 underline-offset-4"
          >
            {t('nav.eyeglasses')}
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {lines.map((line) => {
            const key = cartLineKey(line);
            const color = pick(line.colorNameFa, line.colorNameEn);
            return (
              <li key={key} className="flex gap-4 py-5">
                {line.imageUrl ? (
                  <Link to={`/product/${line.slug}`} onClick={closeCart} className="shrink-0">
                    <img
                      src={line.imageUrl}
                      alt={pick(line.nameFa, line.nameEn)}
                      loading="lazy"
                      className="h-24 w-20 object-cover"
                    />
                  </Link>
                ) : null}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <Link to={`/product/${line.slug}`} onClick={closeCart} className="block">
                      <span className="block text-[14px] text-ink">{pick(line.nameFa, line.nameEn)}</span>
                      <span className="mt-1 block text-[12px] text-slate">
                        {[line.brandName, color].filter(Boolean).join(' · ')}
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeLine(key)}
                      aria-label={t('action.remove')}
                      className="text-slate transition-colors hover:text-navy"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <QuantityStepper
                      value={line.quantity}
                      onChange={(next) => setQuantity(key, next)}
                      label={t('product.quantity')}
                    />
                    <span className="text-[14px] text-navy">
                      {formatPrice(line.unitPrice * line.quantity, locale, line.currency)}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Drawer>
  );
};
