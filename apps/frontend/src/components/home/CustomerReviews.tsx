'use client';

import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SliderDots } from './SliderDots';
import { useCarousel } from './useCarousel';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

/** Phone-mockup positions for the review coverflow (center largest). */
const FALLBACK_REVIEWS = [
  '/images/home/review-3.png',
  '/images/home/review-2.png',
  '/images/home/review-1.png',
  '/images/home/review-4.png',
  '/images/home/review-5.png',
];
const SIZE_CLS = [
  'hidden h-[392px] w-[234px] lg:block',
  'hidden h-[504px] w-[312px] md:block',
  'h-[440px] w-[268px] sm:h-[560px] sm:w-[340px] lg:h-[615px] lg:w-[390px]',
  'hidden h-[504px] w-[312px] md:block',
  'hidden h-[392px] w-[234px] lg:block',
];

export function CustomerReviews() {
  const t = useTranslations('HomePage.reviews');
  const s = useSiteSettings();
  const images = s?.reviewImages.length ? s.reviewImages : FALLBACK_REVIEWS;
  const title = s?.reviewsTitle || t('title');
  const subtitle = s?.reviewsSubtitle || t('subtitle');
  const { index, next, prev, goTo } = useCarousel(images.length);

  // Coverflow window of 5, centered on the active index (wraps around).
  const view = Array.from(
    { length: 5 },
    (_, p) => images[(((index - 2 + p) % images.length) + images.length) % images.length],
  );

  return (
    <section className="flex flex-col items-center gap-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="text-[40px] font-medium leading-tight text-accent">{title}</h2>
        <p className="max-w-3xl text-24 text-accent">{subtitle}</p>
      </div>

      <div className="flex w-full items-center justify-center gap-4 overflow-hidden">
        {view.map((src, i) => (
          <div
            key={i}
            className={`relative shrink-0 overflow-hidden rounded-[39px] border border-border bg-bg-elevated shadow-card ${SIZE_CLS[i]}`}
          >
            <Image key={src} src={src} alt="" fill sizes="390px" className="object-cover animate-fade-in" />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={t('prev')}
          onClick={prev}
          className="inline-flex h-9 w-9 items-center justify-center text-content-muted transition-colors hover:text-content-strong"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <SliderDots count={images.length} active={index} onDotClick={goTo} />
        <button
          type="button"
          aria-label={t('next')}
          onClick={next}
          className="inline-flex h-9 w-9 items-center justify-center text-content-muted transition-colors hover:text-content-strong"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
