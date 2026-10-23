import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useCart } from '../lib/cart';
import { imageAlt, imagesForVariant, priceForVariant } from '../lib/catalog';

/** Included accessories are stored in English; these are their Persian labels. */
const ACCESSORY_LABELS: Record<string, string> = {
  'Hard case': 'کاور سخت',
  'Soft pouch': 'کیف نرم',
  'Microfibre cloth': 'دستمال میکروفایبر',
  'Leather case': 'کاور چرمی',
  'Certificate card (placeholder)': 'کارت مشخصات (نمایشی)',
};
import { formatDigits, formatPrice } from '../lib/format';
import { useAsync } from '../lib/hooks';
import { useI18n } from '../lib/i18n';
import { useSettings } from '../lib/settings';
import { FavoriteButton } from '../components/product/FavoriteButton';
import { ProductCarousel } from '../components/product/ProductCarousel';
import { ProductGallery, SpecTable } from '../components/product/ProductGallery';
import { Breadcrumbs } from '../components/ui/nav';
import { Accordion } from '../components/ui/overlay';
import { QuantityStepper } from '../components/ui/form';
import { Badge, Button, EmptyState, Skeleton } from '../components/ui/primitives';
import { CheckIcon, ShareIcon } from '../components/ui/Icons';

/**
 * Product detail: gallery on one side, a sticky purchase panel on the other, and
 * technical specifications below. Changing colour swaps the imagery, price, SKU
 * and availability, because every variant carries its own data.
 */
export const ProductDetailPage = () => {
  const { slug = '' } = useParams();
  const { t, pick, locale, tValue } = useI18n();
  const settings = useSettings();
  const navigate = useNavigate();
  const { addLine } = useCart();

  const { data, loading, error, reload } = useAsync(() => api.product(slug), [slug]);
  const [variantId, setVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [openSection, setOpenSection] = useState<'specs' | 'delivery' | 'returns' | null>('specs');
  const [shareNote, setShareNote] = useState<string | null>(null);

  const product = data?.product ?? null;

  useEffect(() => {
    if (!product) return;
    const preferred =
      product.variants.find((variant) => variant.inStock) ?? product.variants[0] ?? null;
    setVariantId(preferred?.id ?? null);
    setQuantity(1);
  }, [product]);

  const variant = useMemo(
    () => product?.variants.find((entry) => entry.id === variantId) ?? null,
    [product, variantId],
  );

  const cartPayload = useMemo(() => {
    if (!product) return null;
    const { price, salePrice } = priceForVariant(product, variant);
    const images = imagesForVariant(product, variant);
    return {
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
      imageUrl: images[0]?.url ?? null,
      currency: product.currency,
    };
  }, [product, variant]);

  if (loading) {
    return (
      <div className="mx-auto grid max-w-[1600px] gap-10 px-4 py-14 md:grid-cols-2 md:px-8">
        <Skeleton className="aspect-[5/6] w-full" />
        <div className="space-y-5">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 md:px-8">
        <EmptyState
          title={t('common.errorTitle')}
          body={t('common.errorBody')}
          action={
            <Button variant="outline" size="sm" onClick={reload}>
              {t('action.retry')}
            </Button>
          }
        />
      </div>
    );
  }

  const { price, salePrice } = priceForVariant(product, variant);
  const images = imagesForVariant(product, variant);
  const inStock = variant ? variant.inStock : product.inStock;
  const maxQuantity = Math.max(1, Math.min(10, variant?.stock ?? 10));
  const alt = imageAlt(product, variant, locale, product.brand?.name);
  const categoryPath = product.category ? `/${product.category.slug === 'premium-frames' ? 'premium-frames' : product.category.slug}` : '/eyeglasses';

  const addToBag = () => {
    if (!cartPayload) return;
    addLine(cartPayload, quantity);
  };

  const buyNow = () => {
    if (!cartPayload) return;
    addLine(cartPayload, quantity);
    navigate('/checkout');
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: pick(product.nameFa, product.nameEn), url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareNote(t('action.copied'));
      window.setTimeout(() => setShareNote(null), 2200);
    } catch {
      setShareNote(url);
    }
  };

  const specRows = [
    { label: t('product.shape'), value: tValue(product.shape) },
    { label: t('product.material'), value: tValue(product.material) },
    { label: t('product.frameSize'), value: tValue(product.frameSize) },
    { label: t('spec.lens_width'), value: product.specs.lens_width },
    { label: t('spec.bridge'), value: product.specs.bridge },
    { label: t('spec.temple'), value: product.specs.temple },
    { label: t('product.lensColor'), value: tValue(product.lensColor) },
    { label: t('product.uv'), value: product.uvProtection ? formatDigits(product.uvProtection, locale) : null },
    { label: t('product.polarized'), value: product.polarized ? t('common.yes') : null },
    {
      label: t('product.prescriptionCompatible'),
      value: product.prescriptionCompatible ? t('common.yes') : null,
    },
    ...Object.entries(product.specs)
      .filter(([key]) => ['lens_type', 'lens_material', 'refractive_index', 'coating', 'vision_type', 'photochromic', 'replacement_schedule', 'pack_size', 'water_content'].includes(key))
      .map(([key, value]) => ({
        label: t(`spec.${key}` as never),
        value: tValue(value),
      })),
  ];

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 md:px-8 md:py-14">
      <Breadcrumbs
        items={[
          { label: t('nav.home'), to: '/' },
          ...(product.category
            ? [{ label: pick(product.category.nameFa, product.category.nameEn), to: categoryPath }]
            : []),
          { label: pick(product.nameFa, product.nameEn) },
        ]}
      />

      <div className="mt-8 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <ProductGallery images={images} alt={alt} />

        <div className="lg:sticky lg:top-[96px] lg:self-start">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label-eyebrow text-slate">{product.brand?.name ?? '—'}</p>
              <h1 className="mt-3 text-display text-navy">{pick(product.nameFa, product.nameEn)}</h1>
            </div>
            <div className="flex items-center gap-2">
              {product.isNew ? <Badge tone="navy">{t('common.new')}</Badge> : null}
              <FavoriteButton product={product} variant={variant} tone="light" />
            </div>
          </div>

          <p className="mt-3 text-[14px] text-slate">
            {[product.shape, product.material, product.frameSize].filter(Boolean).map((entry) => tValue(entry)).join(' · ')}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <span className="text-xl text-navy">
              {formatPrice(salePrice !== null && salePrice < price ? salePrice : price, locale, product.currency)}
            </span>
            {salePrice !== null && salePrice < price ? (
              <span className="text-[14px] text-slate line-through">
                {formatPrice(price, locale, product.currency)}
              </span>
            ) : null}
            <span className={`text-[12px] uppercase tracking-label ${inStock ? 'text-slate' : 'text-[#8E3722]'}`}>
              {inStock ? t('common.inStock') : t('common.outOfStock')}
            </span>
          </div>

          <p className="mt-3 text-[12px] text-slate">
            {t('product.sku')}: {formatDigits(variant?.sku ?? product.sku, locale)}
          </p>

          {product.summaryFa || product.summaryEn ? (
            <p className="mt-5 text-[15px] leading-relaxed text-slate">
              {pick(product.summaryFa ?? '', product.summaryEn ?? '')}
            </p>
          ) : null}

          {product.variants.length > 1 ? (
            <fieldset className="mt-8">
              <legend className="label-eyebrow mb-3 text-slate">
                {t('product.selectColor')}:{' '}
                <span className="normal-case tracking-normal text-navy">
                  {pick(variant?.colorNameFa ?? '', variant?.colorNameEn ?? '')}
                </span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setVariantId(entry.id)}
                    disabled={!entry.inStock}
                    aria-pressed={entry.id === variant?.id}
                    title={`${pick(entry.colorNameFa, entry.colorNameEn)}${entry.inStock ? '' : ` — ${t('common.outOfStock')}`}`}
                    className={`h-11 w-11 rounded-full border-2 transition-transform ${
                      entry.id === variant?.id ? 'border-navy scale-105' : 'border-line hover:border-line-strong'
                    } ${entry.inStock ? '' : 'opacity-40'}`}
                    style={{ backgroundColor: entry.colorHex ?? 'transparent' }}
                  >
                    <span className="sr-only">{pick(entry.colorNameFa, entry.colorNameEn)}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              max={maxQuantity}
              label={t('product.quantity')}
            />
            <Button onClick={addToBag} disabled={!inStock} size="lg" className="flex-1 min-w-[180px]">
              {t('action.addToBag')}
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            <Button variant="outline" size="md" onClick={buyNow} disabled={!inStock} className="flex-1 min-w-[160px]">
              {t('action.checkout')}
            </Button>
            <button
              type="button"
              onClick={share}
              className="inline-flex h-11 items-center gap-2 border border-line px-5 text-[13px] text-navy transition-colors hover:border-navy"
            >
              <ShareIcon size={16} />
              {t('action.share')}
            </button>
          </div>
          {shareNote ? (
            <p className="mt-3 flex items-center gap-2 text-[12px] text-slate">
              <CheckIcon size={14} className="text-champagne-dark" />
              {shareNote}
            </p>
          ) : null}

          {product.prescriptionCompatible ? (
            <p className="mt-6 border-s-2 border-champagne/70 bg-paper px-4 py-3 text-[13px] leading-relaxed text-slate">
              {t('product.prescriptionNote')}
            </p>
          ) : null}

          <div className="mt-8">
            <Accordion
              title={t('product.specs')}
              open={openSection === 'specs'}
              onToggle={() => setOpenSection(openSection === 'specs' ? null : 'specs')}
            >
              <SpecTable rows={specRows} />
            </Accordion>
            <Accordion
              title={t('product.delivery')}
              open={openSection === 'delivery'}
              onToggle={() => setOpenSection(openSection === 'delivery' ? null : 'delivery')}
            >
              <p>{pick(settings.commerce.deliveryDaysFa, settings.commerce.deliveryDaysEn)}</p>
            </Accordion>
            <Accordion
              title={t('product.returns')}
              open={openSection === 'returns'}
              onToggle={() => setOpenSection(openSection === 'returns' ? null : 'returns')}
            >
              <p>{pick(settings.commerce.returnsFa, settings.commerce.returnsEn)}</p>
            </Accordion>
          </div>

          {product.includedAccessories.length ? (
            <div className="mt-8 border-t border-line pt-6">
              <h2 className="label-eyebrow text-slate">{t('product.accessories')}</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {product.includedAccessories.map((item) => (
                  <li key={item} className="border border-line bg-paper px-3 py-2 text-[13px] text-ink">
                    {pick(ACCESSORY_LABELS[item] ?? item, item)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {product.warrantyFa || product.warrantyEn ? (
            <p className="mt-6 text-[13px] text-slate">
              <span className="text-navy">{t('product.warranty')}: </span>
              {pick(product.warrantyFa ?? '', product.warrantyEn ?? '')}
            </p>
          ) : null}
        </div>
      </div>

      {product.descriptionFa || product.descriptionEn ? (
        <section className="mt-16 max-w-3xl">
          <h2 className="text-section text-navy">{t('product.description')}</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-slate">
            {pick(product.descriptionFa ?? '', product.descriptionEn ?? '')}
          </p>
        </section>
      ) : null}

      {data?.related.length ? (
        <section className="mt-20 border-t border-line pt-14">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-section text-navy">{t('product.related')}</h2>
            <Link to={categoryPath} className="text-[12px] uppercase tracking-label text-slate transition-colors hover:text-navy">
              {t('action.viewAll')}
            </Link>
          </div>
          <div className="mt-8">
            <ProductCarousel products={data.related} />
          </div>
        </section>
      ) : null}
    </div>
  );
};
