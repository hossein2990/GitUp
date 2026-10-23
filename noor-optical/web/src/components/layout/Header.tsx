import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { CATALOG_ROUTES } from '../../lib/catalog';
import { useCart } from '../../lib/cart';
import { useFavorites } from '../../lib/favorites';
import { useI18n, type MessageKey } from '../../lib/i18n';
import { useBodyScrollLock, useScrollPosition } from '../../lib/hooks';
import { useSettings } from '../../lib/settings';
import { BagIcon, ChevronIcon, CloseIcon, EyeMark, HeartIcon, MenuIcon, SearchIcon, UserIcon, GlobeIcon } from '../ui/Icons';
import { IconButton } from '../ui/primitives';
import { SearchOverlay } from './SearchOverlay';

const PRIMARY_NAV: Array<{ to: string; key: MessageKey }> = [
  { to: '/', key: 'nav.home' },
  { to: '/eyeglasses', key: 'nav.eyeglasses' },
  { to: '/sunglasses', key: 'nav.sunglasses' },
  { to: '/optical-lenses', key: 'nav.lenses' },
  { to: '/contact-lenses', key: 'nav.contacts' },
  { to: '/brands', key: 'nav.brands' },
  { to: '/services', key: 'nav.services' },
  { to: '/about', key: 'nav.about' },
];

const MORE_NAV: Array<{ to: string; key: MessageKey }> = [
  { to: '/computer-glasses', key: 'nav.computer' },
  { to: '/kids-eyewear', key: 'nav.kids' },
  { to: '/premium-frames', key: 'nav.premium' },
  { to: '/accessories', key: 'nav.accessories' },
  { to: '/sale', key: 'nav.sale' },
];

export const Header = () => {
  const { t, pick } = useI18n();
  const settings = useSettings();
  const location = useLocation();
  const scrolled = useScrollPosition(40);
  const { count: cartCount, openCart } = useCart();
  const { count: favoriteCount } = useFavorites();

  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement | null>(null);

  const isHome = location.pathname === '/';
  /** Transparent over the homepage hero, solid everywhere else and after scroll. */
  const overlay = isHome && !scrolled && !mobileOpen;

  useBodyScrollLock(mobileOpen);

  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const handler = (event: MouseEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) setMoreOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMoreOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', escape);
    };
  }, [moreOpen]);

  const textTone = overlay ? 'text-ivory' : 'text-navy';
  const subTone = overlay ? 'text-ivory/70' : 'text-slate';

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative py-2 text-[13px] uppercase tracking-wide2 transition-colors duration-200 ${
      isActive ? `${textTone} after:absolute after:inset-x-0 after:-bottom-[2px] after:h-[2px] after:bg-champagne` : `${subTone} hover:${textTone} hover:text-champagne`
    }`;

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-colors duration-300 ${
          overlay
            ? 'border-b border-ivory/15 bg-navy/25 backdrop-blur-[2px]'
            : 'border-b border-line bg-ivory/95 backdrop-blur-md'
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-[1600px] items-center gap-3 px-4 md:px-8">
          {/* Brand */}
          <Link to="/" className={`flex shrink-0 items-center gap-3 ${textTone}`} aria-label={t('brand.name')}>
            <EyeMark size={30} />
            <span className="hidden leading-tight sm:block">
              <span className="block text-[15px] font-medium uppercase tracking-label">
                {pick(settings.brand.nameFa, settings.brand.nameEn)}
              </span>
              <span className={`block text-[10px] uppercase tracking-label ${subTone}`}>
                {pick(settings.brand.tagline_fa, settings.brand.tagline_en)}
              </span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="mx-auto hidden items-center gap-6 xl:flex" aria-label={t('action.menu')}>
            {PRIMARY_NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className={navLinkClass}>
                {t(item.key)}
              </NavLink>
            ))}
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen((open) => !open)}
                aria-expanded={moreOpen}
                aria-haspopup="true"
                className={`flex items-center gap-1 py-2 text-[13px] uppercase tracking-wide2 transition-colors ${
                  moreOpen ? 'text-champagne' : `${subTone} hover:text-champagne`
                }`}
              >
                {t('nav.more')}
                <ChevronIcon direction={moreOpen ? 'up' : 'down'} size={14} />
              </button>
              {moreOpen ? (
                <div className="absolute end-0 top-full z-50 min-w-[230px] border border-line bg-ivory p-2 shadow-soft animate-fade">
                  {MORE_NAV.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="block px-3 py-2 text-[13px] text-ink transition-colors hover:bg-navy/5"
                    >
                      {t(item.key)}
                    </Link>
                  ))}
                  <div className="my-2 border-t border-line" />
                  {CATALOG_ROUTES.filter((route) => route.key === 'premium').map((route) => (
                    <Link
                      key={route.path}
                      to={route.path}
                      className="block px-3 py-2 text-[13px] text-ink transition-colors hover:bg-navy/5"
                    >
                      {t(route.titleKey)}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </nav>

          {/* Utilities */}
          <div className={`ms-auto flex items-center gap-1 xl:ms-0 ${textTone}`}>
            <IconButton label={t('action.search')} onClick={() => setSearchOpen(true)}>
              <SearchIcon size={19} />
            </IconButton>
            <Link
              to="/account"
              aria-label={t('action.account')}
              title={t('action.account')}
              className="hidden h-10 w-10 items-center justify-center transition-colors hover:text-champagne sm:inline-flex"
            >
              <UserIcon size={19} />
            </Link>
            <Link
              to="/favorites"
              aria-label={t('action.favorites')}
              title={t('action.favorites')}
              className="relative hidden h-10 w-10 items-center justify-center transition-colors hover:text-champagne sm:inline-flex"
            >
              <HeartIcon size={19} />
              {favoriteCount ? (
                <span className="absolute -top-[2px] end-[2px] flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-champagne px-[4px] text-[10px] font-medium tabular-nums text-navy-deep">
                  {favoriteCount}
                </span>
              ) : null}
            </Link>
            <button
              type="button"
              onClick={openCart}
              aria-label={`${t('action.bag')} (${cartCount})`}
              title={t('action.bag')}
              className="relative inline-flex h-10 w-10 items-center justify-center transition-colors hover:text-champagne"
            >
              <BagIcon size={19} />
              <span className="absolute -top-[2px] end-[2px] flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-champagne px-[4px] text-[10px] font-medium tabular-nums text-navy-deep">
                {cartCount}
              </span>
            </button>
            <Link
              to="/appointment"
              className={`ms-1 hidden h-10 items-center border px-4 text-[12px] uppercase tracking-label transition-colors lg:inline-flex ${
                overlay
                  ? 'border-ivory/40 text-ivory hover:bg-ivory hover:text-navy'
                  : 'border-navy text-navy hover:bg-navy hover:text-ivory'
              }`}
            >
              {t('nav.appointment')}
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label={t('action.menu')}
              className="inline-flex h-10 w-10 items-center justify-center xl:hidden"
            >
              <MenuIcon size={22} />
            </button>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile navigation */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-[80] bg-navy/40 xl:hidden" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute inset-y-0 end-0 flex w-[86%] max-w-sm flex-col bg-ivory animate-slideIn"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t('action.menu')}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="text-[13px] uppercase tracking-label text-navy">{t('action.menu')}</span>
              <IconButton label={t('action.close')} onClick={() => setMobileOpen(false)}>
                <CloseIcon size={20} />
              </IconButton>
            </div>
            <nav className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <ul className="divide-y divide-line">
                {[...PRIMARY_NAV, ...MORE_NAV, { to: '/contact', key: 'nav.contact' as MessageKey }].map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="flex items-center justify-between py-4 text-[15px] text-ink transition-colors hover:text-champagne-dark"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t(item.key)}
                      <ChevronIcon direction="end" size={16} className="flip-rtl text-slate" />
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-6 space-y-3 border-t border-line pt-6 text-[14px]">
                <Link to="/account" className="flex items-center gap-3 text-ink" onClick={() => setMobileOpen(false)}>
                  <UserIcon size={18} /> {t('action.account')}
                </Link>
                <Link to="/favorites" className="flex items-center gap-3 text-ink" onClick={() => setMobileOpen(false)}>
                  <HeartIcon size={18} /> {t('action.favorites')}
                  {favoriteCount ? <span className="text-slate">({favoriteCount})</span> : null}
                </Link>
                <Link to="/track-order" className="flex items-center gap-3 text-ink" onClick={() => setMobileOpen(false)}>
                  <BagIcon size={18} /> {t('action.trackOrder')}
                </Link>
                <button
                  type="button"
                  className="flex items-center gap-3 text-ink"
                  onClick={() => {
                    setMobileOpen(false);
                    setSearchOpen(true);
                  }}
                >
                  <SearchIcon size={18} /> {t('action.search')}
                </button>
                <LanguageButton />
              </div>

              <Link
                to="/appointment"
                onClick={() => setMobileOpen(false)}
                className="mt-8 flex h-12 items-center justify-center bg-navy text-[12px] uppercase tracking-label text-ivory"
              >
                {t('nav.appointment')}
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
};

const LanguageButton = () => {
  const { toggleLocale, t, locale } = useI18n();
  return (
    <button type="button" onClick={toggleLocale} className="flex items-center gap-3 text-ink">
      <GlobeIcon size={18} />
      <span>{t('footer.langSwitch')}</span>
      <span className="text-slate">({locale === 'fa' ? 'FA' : 'EN'})</span>
    </button>
  );
};
