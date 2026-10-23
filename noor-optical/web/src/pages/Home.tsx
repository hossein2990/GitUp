import { api } from '../lib/api';
import { CRAFT_IMAGE, CONSULT_IMAGE, LIFESTYLE_IMAGE } from '../lib/seed-images';
import { useAsync } from '../lib/hooks';
import { useI18n } from '../lib/i18n';
import { useSettings } from '../lib/settings';
import { Hero } from '../components/home/Hero';
import {
  AppointmentCta,
  CategoryShowcase,
  EditorialSplit,
  LensGuideTeaser,
  ServicesPreview,
  TrustStrip,
} from '../components/home/HomeSections';
import { ProductCarousel } from '../components/product/ProductCarousel';
import { LinkButton, SectionHeading, Skeleton } from '../components/ui/primitives';

export const HomePage = () => {
  const { t } = useI18n();
  const settings = useSettings();

  const categories = useAsync(() => api.categories(), []);
  const services = useAsync(() => api.services(), []);
  const featured = useAsync(async () => {
    const primary = await api.products({ featured: 'true', per_page: 12, sort: 'relevance' });
    if (primary.items.length >= 4) return primary;
    return api.products({ per_page: 12, sort: 'relevance' });
  }, []);

  const products = featured.data?.items ?? [];

  return (
    <>
      <Hero settings={settings} />
      <TrustStrip settings={settings} />

      {categories.data ? <CategoryShowcase categories={categories.data.items} /> : <div className="mx-auto max-w-[1600px] px-4 py-20 md:px-8"><Skeleton className="h-72 w-full" /></div>}

      <section className="border-y border-line bg-ivory">
        <div className="mx-auto max-w-[1600px] px-4 py-20 md:px-8 md:py-24">
          <SectionHeading
            eyebrow={t('home.featuredEyebrow')}
            title={t('home.featuredTitle')}
            body={t('home.featuredBody')}
            action={
              <LinkButton to="/eyeglasses" variant="outline" size="sm">
                {t('home.featuredAll')}
              </LinkButton>
            }
          />
          <div className="mt-10">
            {featured.loading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {[0, 1, 2, 3].map((index) => (
                  <Skeleton key={index} className="h-[420px] w-full" />
                ))}
              </div>
            ) : products.length ? (
              <ProductCarousel products={products} />
            ) : (
              <p className="text-[15px] text-slate">{t('common.noResults')}</p>
            )}
          </div>
        </div>
      </section>

      <LensGuideTeaser imageUrl={CONSULT_IMAGE} />
      <ServicesPreview services={services.data?.items ?? []} />

      <EditorialSplit imageUrl={LIFESTYLE_IMAGE} primaryTo="/appointment" secondaryTo="/services" />

      <section className="mx-auto max-w-[1600px] px-4 py-20 md:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <img src={CRAFT_IMAGE} alt={t('home.editorialTitle')} loading="lazy" className="aspect-[4/3] w-full object-cover" />
          <div className="flex flex-col justify-center border border-line bg-paper p-8">
            <p className="label-eyebrow text-champagne-dark">{t('about.eyebrow')}</p>
            <h2 className="mt-4 text-section text-navy">{t('about.title')}</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate">{t('about.p1')}</p>
            <LinkButton to="/about" variant="outline" size="sm" className="mt-7 self-start">
              {t('action.learnMore')}
            </LinkButton>
          </div>
        </div>
      </section>

      <AppointmentCta phone={settings.contact.phone} />
    </>
  );
};
