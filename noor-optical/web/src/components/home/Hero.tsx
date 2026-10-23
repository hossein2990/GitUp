import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../lib/i18n';
import { usePrefersReducedMotion } from '../../lib/hooks';
import type { PublicSettings } from '../../lib/types';
import { ChevronIcon } from '../ui/Icons';
import { LinkButton } from '../ui/primitives';
import { HeroScene } from '../three/HeroScene';

/**
 * Homepage hero: a split composition — architectural navy panel with brand copy
 * beside a live 3D scene of a pair of eyeglasses entering an "optical universe."
 *
 * The 3D scene recreates the behaviour from the reference video: the glasses
 * scale in on mount, idle-rotate gently, then respond to scroll progress with
 * orbiting camera movement, rotation, and a dispersing universe of floating lens
 * rings. Motion is skipped entirely for reduced-motion users (static image fallback).
 */
export const Hero = ({ settings }: { settings: PublicSettings }) => {
  const { t, pick } = useI18n();
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track scroll progress through the hero (0 = top, 1 = hero fully scrolled past)
  useEffect(() => {
    if (reduced) return;
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrolled = -rect.top;
      const max = rect.height || 1;
      setScrollProgress(Math.max(0, Math.min(1, scrolled / max)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [reduced]);

  const trust = settings.trust.slice(0, 3);

  return (
    <section ref={sectionRef} className="relative bg-navy text-ivory">
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

        <div className="relative min-h-[320px] overflow-hidden lg:min-h-[640px]">
          {reduced ? (
            // Reduced-motion fallback: static hero image
            settings.hero.imageUrl ? (
              <img
                src={settings.hero.imageUrl}
                alt={pick('نمای فروشگاه نور اپتیک', 'Noor Optical eyewear')}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-navy-soft" />
            )
          ) : (
            <HeroScene scrollProgress={scrollProgress} />
          )}

          {/* Gradient overlay for text legibility at the bottom of the panel */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-transparent to-transparent" />

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
