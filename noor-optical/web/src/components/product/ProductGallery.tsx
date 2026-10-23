import { useState } from 'react';
import { useI18n } from '../../lib/i18n';
import { VIEW_LABEL_KEYS } from '../../lib/catalog';
import type { ImageRef } from '../../lib/types';
import { useMediaQuery } from '../../lib/hooks';
import { ChevronIcon, ZoomIcon } from '../ui/Icons';
import { Modal } from '../ui/overlay';

/**
 * Product gallery: main image, thumbnails, and a fullscreen viewer with hover
 * zoom. Arrow keys move between images both inline and fullscreen.
 */
export const ProductGallery = ({
  images,
  alt,
}: {
  images: ImageRef[];
  alt: string;
}) => {
  const { t, isRtl } = useI18n();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState('50% 50%');

  if (!images.length) {
    return <div className="aspect-[4/5] w-full bg-navy/[0.06]" />;
  }

  const safeIndex = Math.min(index, images.length - 1);
  const current = images[safeIndex];
  const step = (direction: 1 | -1) =>
    setIndex((value) => (value + direction + images.length) % images.length);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const nextKey = isRtl ? 'ArrowLeft' : 'ArrowRight';
    const previousKey = isRtl ? 'ArrowRight' : 'ArrowLeft';
    if (event.key === nextKey) {
      event.preventDefault();
      step(1);
    }
    if (event.key === previousKey) {
      event.preventDefault();
      step(-1);
    }
  };

  const viewLabel = (view?: string) => {
    const key = view ? VIEW_LABEL_KEYS[view] : undefined;
    return key ? t(key) : t('product.gallery');
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      {isDesktop && images.length > 1 ? (
        <div className="order-2 flex shrink-0 flex-col gap-3 md:order-1">
          {images.map((image, position) => (
            <button
              key={`${image.url}-${position}`}
              type="button"
              onClick={() => setIndex(position)}
              aria-label={viewLabel(image.view)}
              aria-current={position === safeIndex}
              className={`h-[86px] w-[70px] overflow-hidden border transition-colors ${
                position === safeIndex ? 'border-navy' : 'border-line hover:border-line-strong'
              }`}
            >
              <img src={image.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      <div className="order-1 min-w-0 flex-1 md:order-2">
        <div
          tabIndex={0}
          onKeyDown={onKeyDown}
          role="group"
          aria-label={t('product.gallery')}
          className="group relative overflow-hidden border border-line bg-navy/[0.04]"
        >
          <img
            src={current.url}
            alt={alt}
            className="aspect-[4/5] w-full object-cover md:aspect-[5/6]"
          />
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="absolute bottom-4 end-4 flex items-center gap-2 border border-navy bg-ivory/92 px-3 py-2 text-[11px] uppercase tracking-label text-navy opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus:opacity-100"
          >
            <ZoomIcon size={15} />
            {t('product.viewFullscreen')}
          </button>
          <span className="absolute bottom-4 start-4 text-[11px] uppercase tracking-label text-navy/70">
            {viewLabel(current.view)}
          </span>
        </div>

        {images.length > 1 ? (
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex gap-2 md:hidden">
              {images.map((image, position) => (
                <button
                  key={`${image.url}-mobile-${position}`}
                  type="button"
                  onClick={() => setIndex(position)}
                  aria-label={viewLabel(image.view)}
                  className={`h-[52px] w-[42px] overflow-hidden border ${
                    position === safeIndex ? 'border-navy' : 'border-line'
                  }`}
                >
                  <img src={image.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <div className="ms-auto flex gap-2">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label={t('action.previous')}
                className="flex h-9 w-9 items-center justify-center border border-line text-navy transition-colors hover:border-navy"
              >
                <ChevronIcon direction="start" size={16} className="flip-rtl" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label={t('action.next')}
                className="flex h-9 w-9 items-center justify-center border border-line text-navy transition-colors hover:border-navy"
              >
                <ChevronIcon direction="end" size={16} className="flip-rtl" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <Modal
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        title={t('product.gallery')}
        size="full"
        closeLabel={t('action.close')}
      >
        <div
          className="relative flex h-[70vh] items-center justify-center overflow-hidden bg-navy-deep"
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            setZoomOrigin(`${x}% ${y}%`);
          }}
        >
          <img
            src={current.url}
            alt={alt}
            style={{ transformOrigin: zoomOrigin }}
            className="max-h-full max-w-full object-contain transition-transform duration-500 hover:scale-[1.7]"
          />
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label={t('action.previous')}
            className="absolute start-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-ivory/40 text-ivory transition-colors hover:border-champagne"
          >
            <ChevronIcon direction="start" size={18} className="flip-rtl" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label={t('action.next')}
            className="absolute end-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-ivory/40 text-ivory transition-colors hover:border-champagne"
          >
            <ChevronIcon direction="end" size={18} className="flip-rtl" />
          </button>
        </div>
        <div className="flex flex-wrap gap-3 p-4">
          {images.map((image, position) => (
            <button
              key={`${image.url}-full-${position}`}
              type="button"
              onClick={() => setIndex(position)}
              aria-label={viewLabel(image.view)}
              className={`h-[70px] w-[56px] overflow-hidden border ${
                position === safeIndex ? 'border-champagne' : 'border-line'
              }`}
            >
              <img src={image.url} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
          <p className="ms-auto self-end text-[12px] uppercase tracking-label text-slate">
            {t('product.zoomHint')}
          </p>
        </div>
      </Modal>
    </div>
  );
};

/** Technical specifications table — only rows the catalogue actually holds. */
export const SpecTable = ({
  rows,
}: {
  rows: Array<{ label: string; value: string | null | undefined }>;
}) => {
  const visible = rows.filter((row) => row.value !== null && row.value !== undefined && row.value !== '');
  if (!visible.length) return null;

  return (
    <dl className="divide-y divide-line border-y border-line">
      {visible.map((row) => (
        <div key={row.label} className="flex items-baseline justify-between gap-6 py-3">
          <dt className="text-[13px] text-slate">{row.label}</dt>
          <dd className="text-[14px] text-navy">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
};
