import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAsync, useReveal } from '../lib/hooks';
import { useI18n } from '../lib/i18n';
import { CatalogPage } from './Catalog';
import { Breadcrumbs } from '../components/ui/nav';
import { Button, EmptyState, SectionHeading, Skeleton } from '../components/ui/primitives';

export const BrandsPage = () => {
  const { t, pick, locale, formatNumber } = useI18n();
  const { data, loading, error, reload } = useAsync(() => api.brands(), []);
  const ref = useReveal<HTMLDivElement>();

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 md:px-8 md:py-14">
      <Breadcrumbs items={[{ label: t('nav.home'), to: '/' }, { label: t('nav.brands') }]} />
      <div className="mt-6">
        <SectionHeading
          eyebrow={t('search.brands')}
          title={t('nav.brands')}
          body={t('catalog.filtersTitle')}
        />
      </div>

      {loading ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-64 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-12">
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
      ) : (
        <div ref={ref} className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.items ?? []).map((brand) => (
            <Link
              key={brand.slug}
              to={`/brands/${brand.slug}`}
              className="group border border-line bg-paper transition-colors hover:border-line-strong"
            >
              <div className="aspect-[16/10] overflow-hidden bg-navy/[0.04] hover-focal">
                {brand.imageUrl ? (
                  <img
                    src={brand.imageUrl}
                    alt={pick(brand.nameFa ?? brand.name, brand.name)}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="p-5">
                <h2 className="text-[17px] text-navy">{pick(brand.nameFa ?? brand.name, brand.name)}</h2>
                <p className="mt-2 text-[13px] text-slate">
                  {[brand.country, brand.productCount ? t('common.results', { count: formatNumber(brand.productCount, locale) }) : null]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                <p className="mt-4 text-[14px] leading-relaxed text-slate">
                  {pick(brand.descriptionFa ?? '', brand.descriptionEn ?? '')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

/** A brand page is the catalogue listing pre-filtered by brand, plus its story. */
export const BrandDetailPage = () => {
  const { slug = '' } = useParams();
  const { t, pick } = useI18n();
  const { data, loading } = useAsync(() => api.brand(slug), [slug]);

  if (!loading && !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 md:px-8">
        <EmptyState title={t('common.pageNotFound')} body={t('common.pageNotFoundBody')} />
      </div>
    );
  }

  return (
    <CatalogPage
      baseQuery={{ brand: slug }}
      title={data ? pick(data.nameFa ?? data.name, data.name) : t('common.loading')}
      eyebrow={t('nav.brands')}
      description={data ? pick(data.descriptionFa ?? '', data.descriptionEn ?? '') : undefined}
      breadcrumbs={[
        { label: t('nav.home'), to: '/' },
        { label: t('nav.brands'), to: '/brands' },
        { label: data ? pick(data.nameFa ?? data.name, data.name) : '' },
      ]}
      family="all"
    />
  );
};
