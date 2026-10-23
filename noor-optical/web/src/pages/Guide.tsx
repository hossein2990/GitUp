import { useI18n } from '../lib/i18n';
import { useReveal } from '../lib/hooks';
import { CONSULT_IMAGE, CRAFT_IMAGE } from '../lib/seed-images';
import { Breadcrumbs } from '../components/ui/nav';
import { LinkButton, SectionHeading } from '../components/ui/primitives';

/** Standing lens guide: how material, index, coating and vision type interact. */
export const GuidePage = () => {
  const { t, pick, tValue } = useI18n();
  const ref = useReveal<HTMLDivElement>();

  const items = [
    { title: t('guide.item1Title'), body: t('guide.item1Body'), values: ['CR-39', 'Polycarbonate', 'High-Index'] },
    { title: t('guide.item2Title'), body: t('guide.item2Body'), values: ['1.50', '1.60', '1.67'] },
    { title: t('guide.item3Title'), body: t('guide.item3Body'), values: ['Anti-Reflective', 'Blue Light Filter', 'Photochromic'] },
    { title: t('guide.item4Title'), body: t('guide.item4Body'), values: ['Single Vision', 'Progressive', 'Computer'] },
  ];

  return (
    <div className="pb-16">
      <div className="bg-navy text-ivory">
        <div className="mx-auto grid max-w-[1600px] items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-8 md:py-20">
          <div>
            <p className="label-eyebrow text-champagne">{t('guide.eyebrow')}</p>
            <h1 className="mt-4 text-display text-ivory">{t('guide.title')}</h1>
            <p className="mt-6 max-w-[52ch] text-[15px] leading-relaxed text-ivory/75">{t('guide.intro')}</p>
            <LinkButton to="/appointment" variant="inverse" size="sm" className="mt-8">
              {t('guide.cta')}
            </LinkButton>
          </div>
          <img src={CONSULT_IMAGE} alt={t('guide.title')} className="aspect-[4/3] w-full object-cover" />
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 pt-10 md:px-8">
        <Breadcrumbs items={[{ label: t('nav.home'), to: '/' }, { label: t('guide.title') }]} />
      </div>

      <section ref={ref} className="mx-auto max-w-[1200px] px-4 py-14 md:px-8">
        <SectionHeading eyebrow={t('guide.howEyebrow')} title={t('guide.howTitle')} />

        <div className="mt-12 space-y-10">
          {items.map((item) => (
            <article key={item.title} className="border-t border-line pt-6 md:grid md:grid-cols-[0.8fr_1.2fr] md:gap-10">
              <h3 className="text-[18px] text-navy">{item.title}</h3>
              <div>
                <p className="text-[15px] leading-relaxed text-slate">{item.body}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {item.values.map((value) => (
                    <li key={value} className="border border-champagne/60 bg-champagne/10 px-3 py-1 text-[12px] text-navy">
                      {tValue(value)}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 grid gap-6 border border-line bg-paper p-6 md:grid-cols-[1.2fr_0.8fr] md:items-center md:p-8">
          <div>
            <h3 className="text-[18px] text-navy">{t('nav.lenses')}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-slate">{t('home.lensBody')}</p>
            <LinkButton to="/optical-lenses" variant="outline" size="sm" className="mt-6">
              {t('nav.lenses')}
            </LinkButton>
          </div>
          <img src={CRAFT_IMAGE} alt={pick(t('nav.lenses'), 'Optical lenses')} loading="lazy" className="aspect-[4/3] w-full object-cover" />
        </div>
      </section>
    </div>
  );
};
