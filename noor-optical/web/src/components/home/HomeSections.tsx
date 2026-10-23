import { Link } from 'react-router-dom';
import { formatPrice } from '../../lib/format';
import { useI18n } from '../../lib/i18n';
import { useReveal } from '../../lib/hooks';
import { catalogPathForCategory } from '../../lib/catalog';
import type { Category, PublicSettings, Service } from '../../lib/types';
import { ChevronIcon, ClockIcon, PhoneIcon } from '../ui/Icons';
import { LinkButton, SectionHeading } from '../ui/primitives';

/**
 * Category showcase on an asymmetric grid: the first collection takes a double
 * cell so the composition reads editorially rather than as an icon wall.
 */
export const CategoryShowcase = ({ categories }: { categories: Category[] }) => {
  const { t, pick } = useI18n();
  const ref = useReveal<HTMLDivElement>();

  if (!categories.length) return null;

  return (
    <section className="mx-auto max-w-[1600px] px-4 py-20 md:px-8 md:py-28">
      <SectionHeading
        eyebrow={t('home.categoriesEyebrow')}
        title={t('home.categoriesTitle')}
        body={t('home.categoriesBody')}
        action={
          <LinkButton to="/search" variant="outline" size="sm">
            {t('action.viewAll')}
          </LinkButton>
        }
      />

      <div ref={ref} className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category, index) => {
          const featured = index === 0;
          return (
            <Link
              key={category.slug}
              to={catalogPathForCategory(category.slug)}
              className={`group relative overflow-hidden border border-line bg-paper hover-focal ${
                featured ? 'sm:col-span-2 lg:row-span-2' : ''
              }`}
            >
              <div className={`relative w-full ${featured ? 'aspect-[4/3] lg:aspect-[4/4.6]' : 'aspect-[4/3]'}`}>
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={pick(category.nameFa, category.nameEn)}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-navy/[0.06]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-navy/15 to-transparent" />
              </div>

              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="label-eyebrow text-champagne">
                  {pick(category.taglineFa ?? '', category.taglineEn ?? '')}
                </p>
                <h3 className={`mt-2 text-ivory ${featured ? 'text-2xl' : 'text-lg'}`}>
                  {pick(category.nameFa, category.nameEn)}
                </h3>
                {featured && category.descriptionFa ? (
                  <p className="mt-2 max-w-[42ch] text-[13px] leading-relaxed text-ivory/70">
                    {pick(category.descriptionFa ?? '', category.descriptionEn ?? '')}
                  </p>
                ) : null}
                <span className="mt-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-label text-ivory/85 transition-colors group-hover:text-champagne">
                  {t('action.shopNow')}
                  <ChevronIcon direction="end" size={14} className="flip-rtl" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export const TrustStrip = ({ settings }: { settings: PublicSettings }) => {
  const { pick } = useI18n();
  const ref = useReveal<HTMLDivElement>();
  if (!settings.trust.length) return null;

  return (
    <section ref={ref} className="border-y border-line bg-paper">
      <div className="mx-auto grid max-w-[1600px] gap-8 px-4 py-14 md:grid-cols-3 md:px-8">
        {settings.trust.map((item, index) => (
          <div key={`${item.titleEn}-${index}`} className="relative ps-6">
            <span className="absolute inset-y-1 start-0 w-[2px] bg-champagne/70" aria-hidden />
            <h3 className="text-[15px] text-navy">{pick(item.titleFa, item.titleEn)}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-slate">{pick(item.bodyFa, item.bodyEn)}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

/** Editorial split: the showroom experience, with a quiet navy backdrop. */
export const EditorialSplit = ({
  imageUrl,
  primaryTo,
  secondaryTo,
}: {
  imageUrl: string;
  primaryTo: string;
  secondaryTo: string;
}) => {
  const { t } = useI18n();
  const ref = useReveal<HTMLDivElement>();

  return (
    <section ref={ref} className="bg-navy text-ivory">
      <div className="mx-auto grid max-w-[1600px] items-stretch lg:grid-cols-2">
        <div className="order-2 flex flex-col justify-center px-5 py-16 md:px-8 lg:order-1 lg:py-24">
          <p className="label-eyebrow text-champagne">{t('home.editorialEyebrow')}</p>
          <h2 className="mt-5 max-w-[24ch] text-display text-ivory">{t('home.editorialTitle')}</h2>
          <p className="mt-5 max-w-[48ch] text-[15px] leading-relaxed text-ivory/70">
            {t('home.editorialBody')}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton to={primaryTo} variant="inverse" size="sm">
              {t('action.bookAppointment')}
            </LinkButton>
            <LinkButton
              to={secondaryTo}
              variant="ghost"
              size="sm"
              className="border-ivory/35 text-ivory hover:bg-ivory/10"
            >
              {t('nav.services')}
            </LinkButton>
          </div>
        </div>
        <div className="order-1 min-h-[280px] lg:order-2">
          <img
            src={imageUrl}
            alt={t('home.editorialTitle')}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
};

/** Lens guide teaser: three decisions explained, linking to the full guide. */
export const LensGuideTeaser = ({ imageUrl }: { imageUrl: string }) => {
  const { t } = useI18n();
  const ref = useReveal<HTMLDivElement>();
  const items = [
    { title: t('guide.item2Title'), body: t('guide.item2Body') },
    { title: t('guide.item3Title'), body: t('guide.item3Body') },
  ];

  return (
    <section ref={ref} className="mx-auto max-w-[1600px] px-4 py-20 md:px-8 md:py-28">
      <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <p className="label-eyebrow text-champagne-dark">{t('home.lensEyebrow')}</p>
          <h2 className="mt-5 max-w-[22ch] text-display text-navy">{t('home.lensTitle')}</h2>
          <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-slate">{t('home.lensBody')}</p>

          <dl className="mt-10 space-y-6">
            {items.map((item) => (
              <div key={item.title} className="border-t border-line pt-5">
                <dt className="text-[15px] text-navy">{item.title}</dt>
                <dd className="mt-2 max-w-[58ch] text-[14px] leading-relaxed text-slate">{item.body}</dd>
              </div>
            ))}
          </dl>

          <LinkButton to="/guide/lenses" variant="outline" size="sm" className="mt-8">
            {t('home.guideCta')}
          </LinkButton>
        </div>
        <div className="relative">
          <img
            src={imageUrl}
            alt={t('home.lensTitle')}
            loading="lazy"
            className="aspect-[4/5] w-full object-cover"
          />
          <span className="absolute inset-0 border border-champagne/40" aria-hidden />
        </div>
      </div>
    </section>
  );
};

export const ServicesPreview = ({ services }: { services: Service[] }) => {
  const { t, pick, locale } = useI18n();
  const ref = useReveal<HTMLDivElement>();

  if (!services.length) return null;

  return (
    <section ref={ref} className="border-y border-line bg-ivory">
      <div className="mx-auto max-w-[1600px] px-4 py-20 md:px-8 md:py-24">
        <SectionHeading
          eyebrow={t('home.servicesEyebrow')}
          title={t('home.servicesTitle')}
          action={
            <LinkButton to="/services" variant="outline" size="sm">
              {t('action.learnMore')}
            </LinkButton>
          }
        />
        <ul className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 6).map((service) => (
            <li key={service.slug} className="bg-paper">
              <Link to={`/services/${service.slug}`} className="flex h-full flex-col p-6 transition-colors hover:bg-ivory">
                <h3 className="text-[16px] text-navy">{pick(service.nameFa, service.nameEn)}</h3>
                <p className="mt-3 flex-1 text-[14px] leading-relaxed text-slate">
                  {pick(service.summaryFa ?? '', service.summaryEn ?? '')}
                </p>
                <div className="mt-6 flex items-center justify-between gap-3 text-[12px] text-slate">
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
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export const AppointmentCta = ({ phone }: { phone: string }) => {
  const { t } = useI18n();
  const ref = useReveal<HTMLDivElement>();

  return (
    <section ref={ref} className="mx-auto max-w-[1600px] px-4 py-20 md:px-8">
      <div className="flex flex-col items-start gap-8 border border-line bg-paper p-8 md:flex-row md:items-center md:justify-between md:p-12">
        <div>
          <h2 className="max-w-[26ch] text-section text-navy">{t('home.appointmentTitle')}</h2>
          <p className="mt-3 max-w-[54ch] text-[15px] leading-relaxed text-slate">
            {t('home.appointmentBody')}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
          <LinkButton to="/appointment" size="md">
            {t('nav.appointment')}
          </LinkButton>
          {phone ? (
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="inline-flex h-11 items-center justify-center gap-2 border border-line px-6 text-[13px] text-navy transition-colors hover:border-navy"
            >
              <PhoneIcon size={16} />
              {phone}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
};
