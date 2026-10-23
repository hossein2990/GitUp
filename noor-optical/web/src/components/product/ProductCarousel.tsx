import { useCallback, useEffect, useRef, useState } from 'react';
import type { Product } from '../../lib/types';
import { useI18n } from '../../lib/i18n';
import { ChevronIcon, ZoomIcon } from '../ui/Icons';
import { ProductCard } from './ProductCard';
import { QuickView } from './QuickView';

/**
 * Horizontal product carousel.
 *
 * Scrolling is native (touch swipe, trackpad, arrow keys inside the track) with
 * scroll-snap for a clean landing, plus prev/next controls and pointer dragging
 * for mouse users. Controls disable at the ends instead of looping.
 */
export const ProductCarousel = ({ products }: { products: Product[] }) => {
  const { t } = useI18n();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);

  const updateEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    const position = Math.abs(track.scrollLeft);
    setAtStart(position < 8);
    setAtEnd(position >= max - 8);
  }, []);

  useEffect(() => {
    updateEdges();
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener('scroll', updateEdges, { passive: true });
    window.addEventListener('resize', updateEdges);
    return () => {
      track.removeEventListener('scroll', updateEdges);
      window.removeEventListener('resize', updateEdges);
    };
  }, [updateEdges, products.length]);

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('[data-carousel-item]');
    const step = card ? card.offsetWidth + 20 : track.clientWidth * 0.8;
    track.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  // Pointer dragging: grab the track and move it, ignoring drags that start on a
  // link so a click still navigates.
  const dragState = useRef({ active: false, startX: 0, startScroll: 0, moved: false });

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    const track = trackRef.current;
    if (!track) return;
    dragState.current = {
      active: true,
      startX: event.clientX,
      startScroll: track.scrollLeft,
      moved: false,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || !dragState.current.active) return;
    const delta = event.clientX - dragState.current.startX;
    if (Math.abs(delta) > 6) dragState.current.moved = true;
    track.scrollLeft = dragState.current.startScroll - delta;
  };

  const endDrag = () => {
    dragState.current.active = false;
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollByCard(-1);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollByCard(1);
    }
  };

  return (
    <div className="relative">
      <div className="mb-6 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          disabled={atStart}
          aria-label={t('action.previous')}
          className="flex h-11 w-11 items-center justify-center border border-line bg-paper text-navy transition-colors hover:border-navy disabled:opacity-35"
        >
          <ChevronIcon direction="start" size={18} className="flip-rtl" />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          disabled={atEnd}
          aria-label={t('action.next')}
          className="flex h-11 w-11 items-center justify-center border border-line bg-paper text-navy transition-colors hover:border-navy disabled:opacity-35"
        >
          <ChevronIcon direction="end" size={18} className="flip-rtl" />
        </button>
      </div>

      <div
        ref={trackRef}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        tabIndex={0}
        role="group"
        aria-label={t('home.featuredTitle')}
        className="carousel-track flex cursor-grab gap-5 overflow-x-auto pb-2 active:cursor-grabbing"
      >
        {products.map((product) => (
          <div
            key={product.id}
            data-carousel-item
            className="w-[78%] shrink-0 sm:w-[46%] lg:w-[31%] xl:w-[23.4%]"
          >
            <ProductCard product={product} onQuickView={setQuickView} />
          </div>
        ))}
      </div>

      <p className="mt-3 flex items-center gap-2 text-[11px] uppercase tracking-label text-slate">
        <ZoomIcon size={14} />
        {t('product.zoomHint')}
      </p>

      <QuickView product={quickView} open={quickView !== null} onClose={() => setQuickView(null)} />
    </div>
  );
};
