import { Link } from 'react-router-dom';
import { CATALOG_ROUTES } from '../../lib/catalog';
import { useI18n } from '../../lib/i18n';
import { useSettings } from '../../lib/settings';
import { ClockIcon, EyeMark, GlobeIcon, MailIcon, PhoneIcon, PinIcon } from '../ui/Icons';

export const Footer = () => {
  const { t, pick, locale, toggleLocale } = useI18n();
  const settings = useSettings();
  const year = new Date().getFullYear();

  const contactRows = [
    { icon: PhoneIcon, value: settings.contact.phone, href: settings.contact.phone ? `tel:${settings.contact.phone.replace(/\s/g, '')}` : undefined },
    { icon: MailIcon, value: settings.contact.email, href: settings.contact.email ? `mailto:${settings.contact.email}` : undefined },
    { icon: PinIcon, value: pick(settings.contact.addressFa, settings.contact.addressEn) },
    { icon: ClockIcon, value: pick(settings.contact.hoursFa, settings.contact.hoursEn) },
  ].filter((row) => Boolean(row.value));

  return (
    <footer className="mt-24 border-t border-line bg-navy text-ivory">
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <EyeMark size={30} />
              <span className="text-[15px] font-medium uppercase tracking-label">
                {pick(settings.brand.nameFa, settings.brand.nameEn)}
              </span>
            </div>
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-ivory/70">
              {pick(settings.brand.tagline_fa, settings.brand.tagline_en)}
            </p>
            <button
              type="button"
              onClick={toggleLocale}
              className="mt-6 inline-flex items-center gap-2 border border-ivory/30 px-3 py-2 text-[12px] uppercase tracking-label transition-colors hover:border-champagne hover:text-champagne"
            >
              <GlobeIcon size={16} />
              {t('footer.langSwitch')}
              <span className="text-ivory/60">{locale === 'fa' ? 'FA' : 'EN'}</span>
            </button>
          </div>

          <nav aria-label={t('footer.shop')}>
            <h3 className="label-eyebrow text-champagne">{t('footer.shop')}</h3>
            <ul className="mt-5 space-y-3 text-[14px]">
              {CATALOG_ROUTES.map((route) => (
                <li key={route.path}>
                  <Link to={route.path} className="text-ivory/75 transition-colors hover:text-champagne">
                    {t(route.titleKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t('footer.help')}>
            <h3 className="label-eyebrow text-champagne">{t('footer.help')}</h3>
            <ul className="mt-5 space-y-3 text-[14px]">
              <li>
                <Link to="/services" className="text-ivory/75 transition-colors hover:text-champagne">
                  {t('nav.services')}
                </Link>
              </li>
              <li>
                <Link to="/appointment" className="text-ivory/75 transition-colors hover:text-champagne">
                  {t('nav.appointment')}
                </Link>
              </li>
              <li>
                <Link to="/guide/lenses" className="text-ivory/75 transition-colors hover:text-champagne">
                  {t('guide.title')}
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="text-ivory/75 transition-colors hover:text-champagne">
                  {t('footer.trackOrder')}
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="text-ivory/75 transition-colors hover:text-champagne">
                  {t('footer.favorites')}
                </Link>
              </li>
              <li>
                <Link to="/account" className="text-ivory/75 transition-colors hover:text-champagne">
                  {t('footer.account')}
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h3 className="label-eyebrow text-champagne">{t('footer.contact')}</h3>
            <ul className="mt-5 space-y-3 text-[14px] text-ivory/75">
              {contactRows.map((row, index) => (
                <li key={`${row.value}-${index}`} className="flex items-start gap-3">
                  <row.icon size={16} className="mt-[3px] shrink-0 text-champagne" />
                  {row.href ? (
                    <a href={row.href} className="transition-colors hover:text-champagne">
                      {row.value}
                    </a>
                  ) : (
                    <span>{row.value}</span>
                  )}
                </li>
              ))}
            </ul>
            <Link
              to="/contact"
              className="mt-6 inline-flex h-10 items-center border border-ivory/30 px-4 text-[12px] uppercase tracking-label transition-colors hover:border-champagne hover:text-champagne"
            >
              {t('action.contactUs')}
            </Link>
          </div>
        </div>

        <div className="mt-14 space-y-3 border-t border-ivory/15 pt-6 text-[12px] text-ivory/55">
          <p>{pick(settings.commerce.returnsFa, settings.commerce.returnsEn)}</p>
          <p>{t('footer.demoNote')}</p>
          <p>
            © {year} {pick(settings.brand.nameFa, settings.brand.nameEn)} — {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};
