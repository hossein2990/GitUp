import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { formatPrice } from '../lib/format';
import { useAsync, useReveal } from '../lib/hooks';
import { useI18n } from '../lib/i18n';
import { Breadcrumbs } from '../components/ui/nav';
import { Button, EmptyState, LinkButton, SectionHeading, Skeleton } from '../components/ui/primitives';
import { ClockIcon } from '../components/ui/Icons';

export const ServicesPage = () => {
  const { t, pick, locale } = useI18n();
  const { data, loading, error, reload } = useAsync(() => api.services(), []);
  const ref = useReveal<HTMLDivElement>();

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 md:px-8 md:py-14">
      <Breadcrumbs items={[{ label: t('nav.home'), to: '/' }, { label: t('nav.services') }]} />
      <div className="mt-6">
        <SectionHeading
          eyebrow={t('services.eyebrow')}
          title={t('services.title')}
          body={t('services.intro')}
          action={
            <LinkButton to="/appointment" size="sm">
              {t('action.bookAppointment')}
            </LinkButton>
          }
        />
      </div>

      {loading ? (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-72 w-full" />
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
        <div ref={ref} className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(data?.items ?? []).map((service) => (
            <article key={service.slug} className="flex flex-col border border-line bg-paper">
              {service.imageUrl ? (
                <div className="aspect-[16/10] overflow-hidden hover-focal">
                  <img
                    src={service.imageUrl}
                    alt={pick(service.nameFa, service.nameEn)}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col p-6">
                <h2 className="text-[17px] text-navy">{pick(service.nameFa, service.nameEn)}</h2>
                <p className="mt-3 flex-1 text-[14px] leading-relaxed text-slate">
                  {pick(service.summaryFa ?? '', service.summaryEn ?? '')}
                </p>
                <div className="mt-5 flex items-center justify-between gap-3 text-[12px] text-slate">
                  <span className="flex items-center gap-2">
                    <ClockIcon size={15} />
                    {pick(service.durationFa ?? '', service.durationEn ?? '')}
                  </span>
                  <span className="text-navy">
                    {service.priceFrom === null
                      ? t('services.free')
                      : `${t('services.priceFrom')} ${formatPrice(service.priceFrom, locale, 'IRT')}`}
                  </span>
                </div>
                <Link
                  to={`/services/${service.slug}`}
                  className="mt-6 text-[12px] uppercase tracking-label text-navy underline decoration-champagne decoration-2 underline-offset-4 transition-colors hover:text-champagne-dark"
                >
                  {t('action.learnMore')}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export const ServiceDetailPage = () => {
  const { slug = '' } = useParams();
  const { t, pick, locale } = useI18n();
  const { data, loading, error, reload } = useAsync(() => api.service(slug), [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-6 h-12 w-3/4" />
        <Skeleton className="mt-4 h-32 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 md:px-8">
        <Breadcrumbs items={[{ label: t('nav.home'), to: '/' }, { label: t('nav.services'), to: '/services' }]} />
        <EmptyState
          className="mt-8"
          title={t('common.pageNotFound')}
          body={t('common.pageNotFoundBody')}
          action={
            <Button variant="outline" size="sm" onClick={reload}>
              {t('action.retry')}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-8 md:py-14">
      <Breadcrumbs
        items={[
          { label: t('nav.home'), to: '/' },
          { label: t('nav.services'), to: '/services' },
          { label: pick(data.nameFa, data.nameEn) },
        ]}
      />

      <div className="mt-8 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="label-eyebrow text-champagne-dark">{t('services.eyebrow')}</p>
          <h1 className="mt-4 text-display text-navy">{pick(data.nameFa, data.nameEn)}</h1>
          <p className="mt-5 text-[16px] leading-relaxed text-slate">
            {pick(data.descriptionFa ?? '', data.descriptionEn ?? '')}
          </p>

          <dl className="mt-10 divide-y divide-line border-y border-line text-[14px]">
            <div className="flex items-center justify-between py-4">
              <dt className="text-slate">{t('services.duration')}</dt>
              <dd className="text-navy">{pick(data.durationFa ?? '', data.durationEn ?? '')}</dd>
            </div>
            <div className="flex items-center justify-between py-4">
              <dt className="text-slate">{t('catalog.priceRange')}</dt>
              <dd className="text-navy">
                {data.priceFrom === null
                  ? t('services.free')
                  : `${t('services.priceFrom')} ${formatPrice(data.priceFrom, locale, 'IRT')}`}
              </dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton to={`/appointment?service=${data.slug}`}>{t('services.bookFor')}</LinkButton>
            <LinkButton to="/services" variant="outline">
              {t('services.backToList')}
            </LinkButton>
          </div>
        </div>

        {data.imageUrl ? (
          <img
            src={data.imageUrl}
            alt={pick(data.nameFa, data.nameEn)}
            className="aspect-[4/5] w-full object-cover"
          />
        ) : null}
      </div>
    </div>
  );
};
