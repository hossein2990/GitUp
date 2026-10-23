import { Link } from 'react-router-dom';
import { useCart } from '../../lib/cart';
import { imageAlt, priceForVariant } from '../../lib/catalog';
import { formatPrice } from '../../lib/format';
import { useI18n } from '../../lib/i18n';
import type { Product } from '../../lib/types';
import { Badge, PriceBlock } from '../ui/primitives';
import { FavoriteButton } from './FavoriteButton';

export const ProductCard = ({
  product,
  onQuickView,
  className = '',
}: {
  product: Product;
  onQuickView?: (product: Product) => void;
  className?: string;
}) => {
  const { t, pick, locale, tValue } = useI18n();
  const { addLine } = useCart();

  const defaultVariant = product.variants.find((variant) => variant.inStock) ?? product.variants[0] ?? null;
  const { price, salePrice } = priceForVariant(product, defaultVariant);
  const image = defaultVariant?.images[0]?.url ?? product.images[0]?.url ?? '';
  const onSale = salePrice !== null && salePrice < price;
  const attributeLine = [product.shape, product.material].filter(Boolean).map((value) => tValue(value)).join(' · ');

  const addToBag = () => {
    if (!product.inStock) return;
    addLine({
      productId: product.id,
      slug: product.slug,
      nameEn: product.nameEn,
      nameFa: product.nameFa,
      brandName: product.brand?.name ?? null,
      variantId: defaultVariant?.id ?? null,
      colorNameEn: defaultVariant?.colorNameEn ?? null,
      colorNameFa: defaultVariant?.colorNameFa ?? null,
      colorHex: defaultVariant?.colorHex ?? null,
      sku: defaultVariant?.sku ?? product.sku,
      unitPrice: salePrice !== null && salePrice < price ? salePrice : price,
      imageUrl: image || null,
      currency: product.currency,
    });
  };

  return (
    <article className={`group flex h-full flex-col border border-line bg-paper transition-colors duration-300 hover:border-line-strong ${className}`}>
      <div className="relative overflow-hidden hover-focal">
        <Link to={`/product/${product.slug}`} aria-label={pick(product.nameFa, product.nameEn)}>
          <div className="aspect-[4/5] w-full overflow-hidden bg-navy/[0.04]">
            {image ? (
              <img
                src={image}
                alt={imageAlt(product, defaultVariant, locale, product.brand?.name)}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
        </Link>

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <div className="flex flex-col items-start gap-1">
            {product.isNew ? <Badge tone="navy">{t('common.new')}</Badge> : null}
            {onSale ? <Badge tone="champagne">{t('common.sale')}</Badge> : null}
            {!product.inStock ? <Badge tone="muted">{t('common.outOfStock')}</Badge> : null}
          </div>
          <div className="pointer-events-auto">
            <FavoriteButton product={product} variant={defaultVariant} />
          </div>
        </div>

        {onQuickView ? (
          <div className="absolute inset-x-0 bottom-0 translate-y-full p-3 opacity-0 transition-all duration-300 ease-focus group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
            <button
              type="button"
              onClick={() => onQuickView(product)}
              className="w-full border border-navy bg-ivory/95 py-2 text-[11px] uppercase tracking-label text-navy backdrop-blur transition-colors hover:bg-navy hover:text-ivory"
            >
              {t('action.quickView')}
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="label-eyebrow text-slate">{product.brand?.name ?? '—'}</p>
        <h3 className="mt-2 text-[15px] leading-snug text-navy">
          <Link to={`/product/${product.slug}`} className="transition-colors hover:text-champagne-dark">
            {pick(product.nameFa, product.nameEn)}
          </Link>
        </h3>
        {attributeLine ? <p className="mt-1 text-[12px] text-slate">{attributeLine}</p> : null}

        <div className="mt-3 flex items-center gap-2">
          {product.variants.slice(0, 4).map((variant) => (
            <span
              key={variant.id}
              title={pick(variant.colorNameFa, variant.colorNameEn)}
              className="h-[14px] w-[14px] rounded-full border border-line-strong"
              style={{ backgroundColor: variant.colorHex ?? 'transparent' }}
            />
          ))}
          {product.variants.length > 4 ? (
            <span className="text-[11px] text-slate">+{product.variants.length - 4}</span>
          ) : null}
        </div>

        <div className="mt-auto pt-4">
          <PriceBlock
            price={price}
            salePrice={salePrice}
            currency={product.currency}
            locale={locale}
            formatPrice={formatPrice}
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className={`text-[11px] uppercase tracking-label ${product.inStock ? 'text-slate' : 'text-[#8E3722]'}`}>
              {product.inStock ? t('common.inStock') : t('common.outOfStock')}
            </span>
            <button
              type="button"
              onClick={addToBag}
              disabled={!product.inStock}
              className="text-[11px] uppercase tracking-label text-navy underline decoration-champagne decoration-2 underline-offset-4 transition-colors hover:text-champagne-dark disabled:cursor-not-allowed disabled:text-slate disabled:no-underline"
            >
              {t('action.addToBag')}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
