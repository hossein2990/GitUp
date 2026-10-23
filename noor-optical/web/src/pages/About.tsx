import { useI18n } from '../lib/i18n';
import { useReveal } from '../lib/hooks';
import { useSettings } from '../lib/settings';
import { CRAFT_IMAGE, SHOWROOM_IMAGE, RACK_IMAGE } from '../lib/seed-images';
import { Breadcrumbs } from '../components/ui/nav';
import { LinkButton } from '../components/ui/primitives';

export const AboutPage = () => {
  const { t, pick } = useI18n();
  const settings = useSettings();
  const ref = useReveal<HTMLDivElement>();

  const values = [
    { title: t('about.v1Title'), body: t('about.v1Body') },
    { title: t('about.v2Title'), body: t('about.v2Body') },
    { title: t('about.v3Title'), body: t('about.v3Body') },
  ];

  return (
    <div className="pb-10">
      <div className="mx-auto max-w-[1600px] px-4 pt-10 md:px-8 md:pt-14">
        <Breadcrumbs items={[{ label: t('nav.home'), to: '/' }, { label: t('nav.about') }]} />
        <div className="mt-6 max-w-3xl">
          <p className="label-eyebrow text-champagne-dark">{t('about.eyebrow')}</p>
          <h1 className="mt-4 text-display text-navy">{t('about.title')}</h1>
          <p className="mt-6 text-[16px] leading-relaxed text-slate">{t('about.p1')}</p>
          <p className="mt-4 text-[16px] leading-relaxed text-slate">{t('about.p2')}</p>
        </div>
      </div>

      <div className="mx-auto mt-12 grid max-w-[1600px] gap-4 px-4 md:grid-cols-3 md:px-8">
        <img src={SHOWROOM_IMAGE} alt={t('about.title')} loading="lazy" className="aspect-[4/3] w-full object-cover md:col-span-2 md:aspect-[16/9]" />
        <img src={RACK_IMAGE} alt={t('about.title')} loading="lazy" className="aspect-[4/3] w-full object-cover" />
      </div>

      <section ref={ref} className="mx-auto max-w-[1600px] px-4 py-20 md:px-8">
        <h2 className="text-section text-navy">{t('about.valuesTitle')}</h2>
        <div className="mt-10 grid gap-px border border-line bg-line md:grid-cols-3">
          {values.map((value) => (
            <div key={value.title} className="bg-paper p-7">
              <h3 className="text-[16px] text-navy">{value.title}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-slate">{value.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-navy text-ivory">
        <div className="mx-auto grid max-w-[1600px] items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-8">
          <div>
            <p className="label-eyebrow text-champagne">{t('contact.eyebrow')}</p>
            <h2 className="mt-4 text-display text-ivory">{pick(settings.brand.nameFa, settings.brand.nameEn)}</h2>
            <dl className="mt-8 space-y-4 text-[14px] text-ivory/75">
              <div>
                <dt className="label-eyebrow text-champagne">{t('contact.address')}</dt>
                <dd className="mt-2">{pick(settings.contact.addressFa, settings.contact.addressEn)}</dd>
              </div>
              <div>
                <dt className="label-eyebrow text-champagne">{t('contact.hours')}</dt>
                <dd className="mt-2">{pick(settings.contact.hoursFa, settings.contact.hoursEn)}</dd>
              </div>
            </dl>
            <p className="mt-6 text-[13px] leading-relaxed text-ivory/55">{t('about.p3')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton to="/contact" variant="inverse" size="sm">
                {t('action.contactUs')}
              </LinkButton>
              <LinkButton to="/appointment" variant="ghost" size="sm" className="border-ivory/35 text-ivory hover:bg-ivory/10">
                {t('nav.appointment')}
              </LinkButton>
            </div>
          </div>
          <img src={CRAFT_IMAGE} alt={t('about.eyebrow')} loading="lazy" className="aspect-[4/3] w-full object-cover" />
        </div>
      </section>
    </div>
  );
};
