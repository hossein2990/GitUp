import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../lib/cart';
import { imageAlt, imagesForVariant, priceForVariant, VIEW_LABEL_KEYS } from '../../lib/catalog';
import { formatPrice } from '../../lib/format';
import { useI18n } from '../../lib/i18n';
import { useBodyScrollLock } from '../../lib/hooks';
import type { Product, Variant } from '../../lib/types';
import { QuantityStepper } from '../ui/form';
import { Modal } from '../ui/overlay';
import { Badge, Button } from '../ui/primitives';

/** Quick view: variant, image and price without leaving the listing page. */
export const QuickView = ({
  product,
  open,
  onClose,
}: {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}) => {
  const { t, pick, locale, tValue } = useI18n();
  const { addLine } = useCart();
  const [variantId, setVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  useBodyScrollLock(open);

  if (!product) return null;

  const variant: Variant | null =
    product.variants.find((entry) => entry.id === variantId) ??
    product.variants.find((entry) => entry.inStock) ??
    product.variants[0] ??
    null;
  const { price, salePrice } = priceForVariant(product, variant);
  const images = imagesForVariant(product, variant);
  const image = images[0]?.url ?? '';

  const add = () => {
    addLine(
      {
        productId: product.id,
        slug: product.slug,
        nameEn: product.nameEn,
        nameFa: product.nameFa,
        brandName: product.brand?.name ?? null,
        variantId: variant?.id ?? null,
        colorNameEn: variant?.colorNameEn ?? null,
        colorNameFa: variant?.colorNameFa ?? null,
        colorHex: variant?.colorHex ?? null,
        sku: variant?.sku ?? product.sku,
        unitPrice: salePrice !== null && salePrice < price ? salePrice : price,
        imageUrl: image || null,
        currency: product.currency,
      },
      quantity,
    );
    onClose();
  };

  const specs = Object.entries(product.specs).filter(([key]) => key in VIEW_LABEL_KEYS || true).slice(0, 4);

  return (
    <Modal open={open} onClose={onClose} title={t('action.quickView')} size="lg" closeLabel={t('action.close')}>
      <div className="grid gap-0 md:grid-cols-2">
        <div className="bg-navy/[0.04]">
          {image ? (
            <img
              src={image}
              alt={imageAlt(product, variant, locale, product.brand?.name)}
              className="h-full max-h-[520px] w-full object-cover"
            />
          ) : null}
        </div>
        <div className="flex flex-col p-6">
          <div className="flex items-center gap-2">
            <p className="label-eyebrow text-slate">{product.brand?.name}</p>
            {product.isNew ? <Badge tone="navy">{t('common.new')}</Badge> : null}
          </div>
          <h2 className="mt-3 text-xl text-navy">{pick(product.nameFa, product.nameEn)}</h2>
          <p className="mt-2 text-[14px] text-slate">
            {[product.shape, product.material, product.frameSize].filter(Boolean).map((entry) => tValue(entry)).join(' · ')}
          </p>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-lg text-navy">{formatPrice(salePrice ?? price, locale, product.currency)}</span>
            {salePrice !== null && salePrice < price ? (
              <span className="text-[13px] text-slate line-through">{formatPrice(price, locale, product.currency)}</span>
            ) : null}
          </div>

          {product.variants.length > 1 ? (
            <div className="mt-6">
              <p className="label-eyebrow mb-3 text-slate">{t('product.selectColor')}</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setVariantId(entry.id)}
                    disabled={!entry.inStock}
                    title={`${pick(entry.colorNameFa, entry.colorNameEn)}${entry.inStock ? '' : ` — ${t('common.outOfStock')}`}`}
                    aria-pressed={entry.id === variant?.id}
                    className={`flex items-center gap-2 border px-3 py-2 text-[12px] transition-colors ${
                      entry.id === variant?.id ? 'border-navy bg-navy/[0.04]' : 'border-line hover:border-navy'
                    } ${entry.inStock ? '' : 'opacity-45'}`}
                  >
                    <span
                      className="h-[14px] w-[14px] rounded-full border border-line-strong"
                      style={{ backgroundColor: entry.colorHex ?? 'transparent' }}
                    />
                    {pick(entry.colorNameFa, entry.colorNameEn)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {specs.length ? (
            <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-4 text-[13px]">
              {specs.map(([key, value]) => (
                <div key={key} className="flex justify-between gap-2">
                  <dt className="text-slate">{key.replace(/_/g, ' ')}</dt>
                  <dd className="text-navy">{tValue(value)}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className="mt-auto flex flex-col gap-3 pt-6">
            <div className="flex items-center gap-3">
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                max={Math.max(1, variant?.stock ?? 10)}
                label={t('product.quantity')}
              />
              <Button onClick={add} disabled={!product.inStock} className="flex-1">
                {t('action.addToBag')}
              </Button>
            </div>
            <Link
              to={`/product/${product.slug}`}
              onClick={onClose}
              className="text-center text-[12px] uppercase tracking-label text-slate underline decoration-champagne decoration-2 underline-offset-4 transition-colors hover:text-navy"
            >
              {t('action.viewDetails')}
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
};
