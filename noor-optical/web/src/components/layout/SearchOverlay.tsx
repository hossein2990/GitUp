import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useI18n } from '../../lib/i18n';
import { useDebounced, useEscapeKey } from '../../lib/hooks';
import { formatPrice } from '../../lib/format';
import { catalogPathForCategory } from '../../lib/catalog';
import { CloseIcon, SearchIcon } from '../ui/Icons';
import { Spinner } from '../ui/primitives';

type Suggestions = Awaited<ReturnType<typeof api.suggest>>;

/**
 * Full-screen search panel with live suggestions across products, brands, SKUs
 * and categories. Arrow keys move through the results, Enter opens the focused
 * one, Escape closes.
 */
export const SearchOverlay = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { t, pick, locale } = useI18n();
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  const debounced = useDebounced(term, 250);
  const [data, setData] = useState<Suggestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEscapeKey(open, onClose);

  useEffect(() => {
    if (open) {
      const timeout = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => window.clearTimeout(timeout);
    }
    setTerm('');
    setData(null);
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const query = debounced.trim();
    if (query.length < 2) {
      setData(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .suggest(query)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : t('common.errorTitle'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, open]);

  const submit = (event?: { preventDefault: () => void }) => {
    event?.preventDefault();
    const query = term.trim();
    if (!query) return;
    onClose();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const nodes = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>('a, button[data-suggestion]') ?? [],
    );
    if (!nodes.length) return;
    event.preventDefault();
    const activeIndex = nodes.findIndex((node) => node === document.activeElement);
    const nextIndex =
      event.key === 'ArrowDown'
        ? activeIndex < 0
          ? 0
          : (activeIndex + 1) % nodes.length
        : activeIndex <= 0
          ? nodes.length - 1
          : activeIndex - 1;
    nodes[nextIndex]?.focus();
  };

  if (!open) return null;

  const hasResults = Boolean(data && (data.products.length || data.brands.length || data.categories.length));

  return (
    <div className="fixed inset-0 z-[75] bg-ivory animate-fade" role="dialog" aria-modal="true" aria-label={t('search.title')}>
      <div className="mx-auto flex h-full max-w-3xl flex-col px-5 pt-6 md:pt-12">
        <form onSubmit={submit} className="flex items-center gap-3 border-b border-line pb-4">
          <SearchIcon size={22} className="text-slate" />
          <input
            ref={inputRef}
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t('search.placeholder')}
            aria-label={t('search.title')}
            className="w-full bg-transparent text-lg text-navy placeholder:text-slate-light focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={t('action.close')}
            className="flex h-10 w-10 items-center justify-center text-slate transition-colors hover:text-navy"
          >
            <CloseIcon size={20} />
          </button>
        </form>

        <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto py-6" onKeyDown={onKeyDown}>
          {loading ? <Spinner /> : null}

          {!loading && error ? <p className="text-[14px] text-[#8E3722]">{error}</p> : null}

          {!loading && !error && term.trim().length < 2 ? (
            <p className="text-[14px] text-slate">{t('search.hint')}</p>
          ) : null}

          {!loading && !error && term.trim().length >= 2 && !hasResults ? (
            <p className="text-[14px] text-slate">{t('common.noResults')}</p>
          ) : null}

          {!loading && data && data.products.length ? (
            <section className="mb-8">
              <h3 className="label-eyebrow mb-3 text-champagne-dark">{t('search.products')}</h3>
              <ul className="divide-y divide-line border-y border-line">
                {data.products.map((product) => (
                  <li key={product.slug}>
                    <Link
                      to={`/product/${product.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-4 py-3 transition-colors hover:bg-navy/[0.03]"
                    >
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={pick(product.nameFa, product.nameEn)}
                          loading="lazy"
                          className="h-16 w-16 object-cover"
                        />
                      ) : (
                        <span className="h-16 w-16 bg-navy/5" />
                      )}
                      <span className="flex-1">
                        <span className="block text-[14px] text-ink">{pick(product.nameFa, product.nameEn)}</span>
                        <span className="mt-1 block text-[12px] text-slate">
                          {[product.brandName, product.categoryFa].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                      <span className="text-[13px] text-navy">
                        {formatPrice(product.salePrice ?? product.price, locale, product.currency)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => submit()}
                data-suggestion
                className="mt-4 text-[13px] uppercase tracking-label text-navy underline decoration-champagne decoration-2 underline-offset-4"
              >
                {t('search.submit')} — {term.trim()}
              </button>
            </section>
          ) : null}

          {!loading && data && (data.brands.length || data.categories.length) ? (
            <div className="grid gap-8 md:grid-cols-2">
              {data.categories.length ? (
                <section>
                  <h3 className="label-eyebrow mb-3 text-champagne-dark">{t('search.categories')}</h3>
                  <ul className="flex flex-wrap gap-2">
                    {data.categories.map((category) => (
                      <li key={category.slug}>
                        <Link
                          to={catalogPathForCategory(category.slug)}
                          onClick={onClose}
                          className="inline-flex border border-line bg-paper px-3 py-2 text-[13px] text-navy transition-colors hover:border-navy"
                        >
                          {pick(category.nameFa, category.nameEn)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              {data.brands.length ? (
                <section>
                  <h3 className="label-eyebrow mb-3 text-champagne-dark">{t('search.brands')}</h3>
                  <ul className="flex flex-wrap gap-2">
                    {data.brands.map((brand) => (
                      <li key={brand.slug}>
                        <Link
                          to={`/brands/${brand.slug}`}
                          onClick={onClose}
                          className="inline-flex border border-line bg-paper px-3 py-2 text-[13px] text-navy transition-colors hover:border-navy"
                        >
                          {pick(brand.nameFa ?? brand.name, brand.name)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
