'use client';

import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SliderDots } from './SliderDots';

/** Phone-mockup positions for the review coverflow (center largest). */
const phones = [
  { src: '/images/home/review-3.png', cls: 'hidden h-[392px] w-[234px] lg:block' },
  { src: '/images/home/review-2.png', cls: 'hidden h-[504px] w-[312px] md:block' },
  { src: '/images/home/review-1.png', cls: 'h-[440px] w-[268px] sm:h-[560px] sm:w-[340px] lg:h-[615px] lg:w-[390px]' },
  { src: '/images/home/review-4.png', cls: 'hidden h-[504px] w-[312px] md:block' },
  { src: '/images/home/review-5.png', cls: 'hidden h-[392px] w-[234px] lg:block' },
];

export function CustomerReviews() {
  const t = useTranslations('HomePage.reviews');
  return (
    <section className="flex flex-col items-center gap-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="text-[40px] font-medium leading-tight text-accent">{t('title')}</h2>
        <p className="max-w-3xl text-24 text-accent">{t('subtitle')}</p>
      </div>

      <div className="flex w-full items-center justify-center gap-4 overflow-hidden">
        {phones.map((p, i) => (
          <div
            key={i}
            className={`relative shrink-0 overflow-hidden rounded-[39px] border border-border bg-bg-elevated shadow-card ${p.cls}`}
          >
            <Image src={p.src} alt="" fill sizes="390px" className="object-cover" />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={t('prev')}
          className="inline-flex h-9 w-9 items-center justify-center text-content-muted transition-colors hover:text-content-strong"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <SliderDots count={5} active={0} />
        <button
          type="button"
          aria-label={t('next')}
          className="inline-flex h-9 w-9 items-center justify-center text-content-muted transition-colors hover:text-content-strong"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
