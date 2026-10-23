import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useI18n } from '../../lib/i18n';
import { useMediaQuery, usePrefersReducedMotion } from '../../lib/hooks';
import type { PublicSettings } from '../../lib/types';
import { ChevronIcon } from '../ui/Icons';
import { LinkButton } from '../ui/primitives';

gsap.registerPlugin(ScrollTrigger);

const VIDEO_SRC = '/videos/hero-eye.mp4';

/**
 * Scroll-driven cinematic hero.
 *
 * The user's vertical scroll position directly controls the video playback
 * timeline: scrolling down advances the video frame-by-frame, scrolling up
 * rewinds it smoothly. The hero section is pinned to the viewport during the
 * animation (400vh on desktop, 300vh on mobile), creating the illusion of
 * travelling into the eye and through to the optical universe within.
 *
 * The video never autoplays or loops — it is purely scrubbed by scroll progress.
 * Text content fades out within the first 10% of scroll so the cinematic visual
 * becomes the sole focus. Reduced-motion users see a static hero image instead.
 */
export const Hero = ({ settings }: { settings: PublicSettings }) => {
  const { t, pick } = useI18n();
  const reduced = usePrefersReducedMotion();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const scrollDistance = isMobile ? 300 : 400; // vh of pinned scroll

  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (reduced) return;

    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    let rafId: number | null = null;
    let targetTime = 0;

    const updateVideoTime = () => {
      rafId = null;
      if (!video) return;
      // Only seek when the difference is meaningful — avoids micro-stutters
      if (Math.abs(video.currentTime - targetTime) > 0.03) {
        video.currentTime = targetTime;
      }
    };

    const setupScroll = () => {
      if (!video.duration || !isFinite(video.duration)) return;
      setVideoReady(true);

      // Main pinned scroll: maps scroll progress 0→1 to video duration
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: `+=${scrollDistance}vh`,
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => {
          targetTime = self.progress * video.duration;
          if (rafId === null) {
            rafId = requestAnimationFrame(updateVideoTime);
          }
        },
      });

      // Text fades out within the first 10% of the scroll journey
      gsap.to(textRef.current, {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '10% top',
          scrub: true,
        },
      });
    };

    if (video.readyState >= 2) {
      setupScroll();
    } else {
      video.addEventListener('loadedmetadata', setupScroll);
    }

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      video.removeEventListener('loadedmetadata', setupScroll);
      // Kill only the ScrollTriggers pinned to this section
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === section) st.kill();
      });
    };
  }, [reduced, scrollDistance]);

  const trust = settings.trust.slice(0, 3);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-navy-deep text-ivory"
    >
      {/* Cinematic video background — paused, muted, no loop, scrubbed by scroll */}
      {!reduced && (
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          muted
          playsInline
          preload="metadata"
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: 'center' }}
        />
      )}

      {/* Dark placeholder while video metadata loads */}
      {!videoReady && !reduced && <div className="absolute inset-0 bg-navy-deep" />}

      {/* Gradient overlays for text legibility — no baked-in video text */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-navy-deep/85 via-navy-deep/20 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-deep/70 via-transparent to-transparent" />

      {/* Text content — fades out as the user scrolls into the cinematic journey */}
      <div ref={textRef} className="relative z-10 flex h-full items-center">
        <div className="mx-auto w-full max-w-[1600px] px-5 md:px-8">
          <div className="max-w-2xl">
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
              <LinkButton
                to="/sunglasses"
                size="lg"
                variant="ghost"
                className="border-ivory/35 text-ivory hover:bg-ivory/10"
              >
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
        </div>
      </div>

      {/* Bottom editorial text — stays visible during the opening frames */}
      <div className="absolute inset-x-5 bottom-8 z-10 flex items-end justify-between gap-4 md:inset-x-8">
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

      {/* Reduced-motion fallback: static hero image */}
      {reduced && settings.hero.imageUrl && (
        <img
          src={settings.hero.imageUrl}
          alt={pick('نمای فروشگاه نور اپتیک', 'Noor Optical eyewear')}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </section>
  );
};
