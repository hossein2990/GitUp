import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../lib/i18n';
import { usePrefersReducedMotion } from '../../lib/hooks';
import type { PublicSettings } from '../../lib/types';
import { ChevronIcon } from '../ui/Icons';
import { LinkButton } from '../ui/primitives';

/**
 * Homepage hero: a split composition — architectural navy panel beside a
 * full-bleed photograph — with a restrained cursor "lens flare" that follows the
 * pointer. Motion is skipped entirely for reduced-motion users.
 */
export const Hero = ({ settings }: { settings: PublicSettings }) => {
  const { t, pick } = useI18n();
  const reduced = usePrefersReducedMotion();
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [flare, setFlare] = useState({ x: 62, y: 42, active: false });

  const trust = settings.trust.slice(0, 3);

  return (
    <section className="relative bg-navy text-ivory">
      <div className="mx-auto grid max-w-[1600px] items-stretch gap-0 lg:grid-cols-[1.05fr_1fr]">
        <div className="flex flex-col justify-center px-5 pb-14 pt-16 md:px-8 md:pt-24 lg:pb-24 lg:pt-28">
          <p className="label-eyebrow text-champagne">{t('home.heroEyebrow')}</p>
          <h1 className="mt-6 max-w-[18ch] text-hero text-ivory">
            {pick(settings.hero.headlineFa, settings.hero.headlineEn) || t('brand.name')}
          </h1>
          <p className="mt-6 max-w-[52ch] text-[16px] leading-relaxed text-ivory/75">
            {pick(settings.hero.bodyFa, settings.hero.bodyEn)}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <LinkButton to="/eyeglasses" size="lg" variant="inverse">
              {t('nav.eyeglasses')}
            </LinkButton>
            <LinkButton to="/sunglasses" size="lg" variant="ghost" className="border-ivory/35 text-ivory hover:bg-ivory/10">
              {t('nav.sunglasses')}
            </LinkButton>
          </div>

          {trust.length ? (
            <dl className="mt-14 grid gap-6 border-t border-ivory/15 pt-8 sm:grid-cols-3">
              {trust.map((item, index) => (
                <div key={`${item.titleEn}-${index}`}>
                  <dt className="flex items-center gap-2 text-[13px] text-ivory">
                    <span className="h-[5px] w-[5px] rounded-full bg-champagne" aria-hidden />
                    {pick(item.titleFa, item.titleEn)}
                  </dt>
                  <dd className="mt-2 text-[13px] leading-relaxed text-ivory/60">
                    {pick(item.bodyFa, item.bodyEn)}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        <div
          ref={frameRef}
          onMouseMove={(event) => {
            if (reduced) return;
            const rect = frameRef.current?.getBoundingClientRect();
            if (!rect) return;
            setFlare({
              x: ((event.clientX - rect.left) / rect.width) * 100,
              y: ((event.clientY - rect.top) / rect.height) * 100,
              active: true,
            });
          }}
          onMouseLeave={() => setFlare((current) => ({ ...current, active: false }))}
          className="relative min-h-[320px] overflow-hidden lg:min-h-[640px]"
        >
          {settings.hero.imageUrl ? (
            <img
              src={settings.hero.imageUrl}
              alt={pick('نمای فروشگاه نور اپتیک', 'Noor Optical eyewear')}
              className="h-full w-full object-cover animate-reveal"
            />
          ) : (
            <div className="h-full w-full bg-navy-soft" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/75 via-navy/25 to-transparent" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 transition-opacity duration-500"
            style={{
              opacity: flare.active && !reduced ? 0.85 : 0,
              background: `radial-gradient(420px circle at ${flare.x}% ${flare.y}%, rgb(var(--champagne) / 0.22), transparent 62%)`,
            }}
          />
          <div className="absolute inset-x-5 bottom-8 flex items-end justify-between gap-4 md:inset-x-8">
            <p className="max-w-[26ch] text-[13px] leading-relaxed text-ivory/80">
              {t('home.editorialBody')}
            </p>
            <Link
              to="/about"
              className="flex items-center gap-2 text-[11px] uppercase tracking-label text-ivory transition-colors hover:text-champagne"
            >
              {t('nav.about')}
              <ChevronIcon direction="end" size={14} className="flip-rtl" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
