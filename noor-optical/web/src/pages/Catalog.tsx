import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { orderFilterGroups } from '../lib/catalog';
import { useAsync, useMediaQuery } from '../lib/hooks';
import { useI18n } from '../lib/i18n';
import type { FacetGroup, Product } from '../lib/types';
import {
  ActiveFilters,
  FilterPanel,
  readFilterState,
  SortSelect,
  toApiQuery,
  toggleOption,
  writeFilterState,
  activeFilterCount,
  emptyFilterState,
  type FilterState,
} from '../components/product/ProductFilters';
import { ProductCard } from '../components/product/ProductCard';
import { QuickView } from '../components/product/QuickView';
import { Breadcrumbs, Pagination } from '../components/ui/nav';
import { Drawer } from '../components/ui/overlay';
import { Button, EmptyState, Skeleton } from '../components/ui/primitives';
import { FilterIcon } from '../components/ui/Icons';

export type CatalogPageProps = {
  baseQuery: Record<string, string>;
  extraUrlParams?: Record<string, string>;
  title: string;
  eyebrow?: string;
  description?: string;
  family?: string;
  breadcrumbs?: Array<{ label: string; to?: string }>;
};

/**
 * One listing experience used by every catalogue route: category pages, brand
 * pages, the sale listing and search results. Filters, sort and page live in the
 * URL, so any view can be shared or bookmarked.
 */
export const CatalogPage = ({
  baseQuery,
  extraUrlParams = {},
  title,
  eyebrow,
  description,
  family,
  breadcrumbs,
}: CatalogPageProps) => {
  const { t, pick, locale, formatNumber } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [draftPrices, setDraftPrices] = useState<{ min: string; max: string } | null>(null);

  const state = useMemo(() => readFilterState(searchParams), [searchParams]);
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const queryKey = JSON.stringify({ ...toApiQuery(state, baseQuery), page });

  const products = useAsync(
    () => api.products({ ...toApiQuery(state, baseQuery), page, per_page: 12 } as never),
    [queryKey],
  );
  const facets = useAsync(
    () => api.facets(toApiQuery(state, baseQuery) as never),
    [JSON.stringify(toApiQuery(state, baseQuery))],
  );

  useEffect(() => {
    setDraftPrices(null);
  }, [searchParams]);

  const groups: FacetGroup[] = useMemo(() => {
    const raw = facets.data?.groups ?? [];
    return orderFilterGroups(raw, family);
  }, [facets.data, family]);

  const applyState = (next: FilterState) => {
    setSearchParams(writeFilterState(next, extraUrlParams));
  };

  const onToggle = (groupKey: string, value: string) => {
    applyState(toggleOption(state, groupKey, value));
  };

  const onClear = () => {
    applyState({ ...emptyFilterState(), sort: state.sort });
  };

  const onPriceChange = (min: string, max: string) => {
    setDraftPrices({ min, max });
  };

  const onApplyPrice = () => {
    const next: FilterState = {
      ...state,
      priceMin: draftPrices?.min ?? state.priceMin,
      priceMax: draftPrices?.max ?? state.priceMax,
    };
    applyState(next);
  };

  const activeCount = activeFilterCount(state);
  const items = products.data?.items ?? [];
  const total = products.data?.total ?? 0;

  const filterPanel = (
    <FilterPanel
      groups={groups}
      state={{ ...state, priceMin: draftPrices?.min ?? state.priceMin, priceMax: draftPrices?.max ?? state.priceMax }}
      onToggle={onToggle}
      onPriceChange={onPriceChange}
      onApplyPrice={onApplyPrice}
      onClear={onClear}
    />
  );

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 md:px-8 md:py-14">
      {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}

      <header className={`flex flex-col gap-6 ${breadcrumbs ? 'mt-6' : ''} md:flex-row md:items-end md:justify-between`}>
        <div className="max-w-2xl">
          {eyebrow ? <p className="label-eyebrow mb-3 text-champagne-dark">{eyebrow}</p> : null}
          <h1 className="text-display text-navy">{title}</h1>
          {description ? <p className="mt-3 text-[15px] leading-relaxed text-slate">{description}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-[12px] uppercase tracking-label text-slate">
            {t('common.results', { count: formatNumber(total, locale) })}
          </span>
          <SortSelect value={state.sort} onChange={(sort) => applyState({ ...state, sort })} />
          {!isDesktop ? (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex h-10 items-center gap-2 border border-line bg-paper px-4 text-[12px] uppercase tracking-label text-navy transition-colors hover:border-navy"
            >
              <FilterIcon size={16} />
              {t('action.filters')}
              {activeCount ? <span className="text-champagne-dark">({activeCount})</span> : null}
            </button>
          ) : null}
        </div>
      </header>

      {activeCount ? (
        <div className="mt-6">
          <ActiveFilters groups={groups} state={state} onToggle={onToggle} onClear={onClear} />
        </div>
      ) : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-[270px_1fr]">
        {isDesktop ? (
          <aside className="hidden lg:block">
            <div className="sticky top-[96px] max-h-[calc(100vh-140px)] overflow-y-auto pe-2">
              {facets.loading ? <Skeleton className="h-[420px] w-full" /> : filterPanel}
            </div>
          </aside>
        ) : null}

        <section>
          {products.loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <Skeleton key={index} className="h-[440px] w-full" />
              ))}
            </div>
          ) : products.error ? (
            <EmptyState
              title={t('common.errorTitle')}
              body={t('common.errorBody')}
              action={
                <Button variant="outline" size="sm" onClick={products.reload}>
                  {t('action.retry')}
                </Button>
              }
            />
          ) : items.length ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((product) => (
                  <ProductCard key={product.id} product={product} onQuickView={setQuickView} />
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={products.data?.totalPages ?? 1}
                previousLabel={t('action.previous')}
                nextLabel={t('action.next')}
                pageOfLabel={t('common.pageOf', { page, total: products.data?.totalPages ?? 1 })}
                onChange={(nextPage) => {
                  const params = writeFilterState(state, extraUrlParams);
                  if (nextPage > 1) params.set('page', String(nextPage));
                  setSearchParams(params);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </>
          ) : (
            <EmptyState
              title={t('catalog.emptyTitle')}
              body={t('catalog.emptyBody')}
              action={
                <Button variant="outline" size="sm" onClick={onClear}>
                  {t('action.clearAll')}
                </Button>
              }
            />
          )}

          <p className="mt-10 text-[13px] text-slate">
            {t('guide.cta')}{' '}
            <Link to="/appointment" className="text-navy underline decoration-champagne decoration-2 underline-offset-4">
              {t('nav.appointment')}
            </Link>
          </p>
        </section>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={t('catalog.filtersTitle')}
        closeLabel={t('action.close')}
        footer={
          <Button block onClick={() => setDrawerOpen(false)}>
            {t('common.results', { count: formatNumber(total, locale) })}
          </Button>
        }
      >
        {filterPanel}
      </Drawer>

      <QuickView product={quickView} open={quickView !== null} onClose={() => setQuickView(null)} />
    </div>
  );
};

/** Search results: the same listing, driven by the `q` query parameter. */
export const SearchPage = () => {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const term = searchParams.get('q') ?? '';

  return (
    <CatalogPage
      baseQuery={{ q: term }}
      extraUrlParams={{ q: term }}
      title={term ? t('search.forQuery', { q: term }) : t('search.title')}
      description={t('search.hint')}
      breadcrumbs={[{ label: t('nav.home'), to: '/' }, { label: t('search.title') }]}
      family="all"
    />
  );
};
