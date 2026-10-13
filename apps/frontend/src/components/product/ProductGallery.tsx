'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { GallerySlide } from '@/lib/catalog/gallery-slides';
import { ProductLightbox } from './ProductLightbox';

/**
 * Product photos as a swipeable slider (Figma frame sizes kept on desktop):
 * - desktop: thumbnail column + slider with hover arrows, thumbnails follow the slide;
 * - phone/tablet: full-width slider with dots, thumbnails hidden;
 * - tap/click a slide: fullscreen lightbox with zoom, kept on the same photo.
 */
export function ProductGallery({ slides }: { slides: GallerySlide[] }) {
  const t = useTranslations('ProductPage');
  const locale = useLocale();
  const many = slides.length > 1;

  const [viewportRef, embla] = useEmblaCarousel({
    loop: false,
    direction: locale === 'ar' ? 'rtl' : 'ltr',
    watchDrag: many,
  });
  const [active, setActive] = React.useState(0);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

  React.useEffect(() => {
    if (!embla) return;
    const sync = () => setActive(embla.selectedScrollSnap());
    sync();
    embla.on('select', sync);
    embla.on('reInit', sync);
    return () => {
      embla.off('select', sync);
      embla.off('reInit', sync);
    };
  }, [embla]);

  const goTo = (i: number, instant = false) => embla?.scrollTo(i, instant);

  if (slides.length === 0) {
    return <div className="aspect-[606/714] w-full rounded-[2px] bg-bg-muted lg:h-[714px] lg:w-[755px] lg:aspect-auto" />;
  }

  return (
    <div className="relative w-full lg:w-[755px]">
      {/* Thumbnails: desktop only. Absolutely positioned so the slider alone sets the row height. */}
      {many && (
        <div className="absolute inset-y-0 start-0 hidden w-[126px] flex-col gap-8 overflow-y-auto lg:flex">
          {slides.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => goTo(i)}
              aria-label={t('viewLabel', { n: i + 1 })}
              aria-current={i === active}
              className={cn(
                'relative aspect-[126/140] shrink-0 overflow-hidden rounded-[2px] border bg-bg-muted',
                i === active ? 'border-accent' : 'border-transparent',
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className={cn('group relative', many && 'lg:ms-[149px]')}>
        {/* Slider viewport */}
        <div ref={viewportRef} className="overflow-hidden rounded-[2px] bg-bg-muted">
          <div className="flex touch-pan-y">
            {slides.map((s, i) => (
              <div key={s.key} className="relative min-w-0 flex-[0_0_100%]">
                <button
                  type="button"
                  onClick={() => {
                    goTo(i, true);
                    setLightboxOpen(true);
                  }}
                  aria-label={t('zoomAria')}
                  className="relative block aspect-[606/714] w-full cursor-zoom-in overflow-hidden lg:h-[714px] lg:aspect-auto"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.src}
                    alt={s.alt}
                    draggable={false}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    className="absolute inset-0 h-full w-full select-none object-cover"
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Magnifier hint */}
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-3 end-3 inline-flex size-9 items-center justify-center rounded-full bg-white/90 text-content-strong shadow-sm"
        >
          <ZoomIn className="size-5" strokeWidth={1.75} />
        </span>

        {/* Arrows: desktop, on hover */}
        {many && (
          <>
            <button
              type="button"
              onClick={() => embla?.scrollPrev()}
              disabled={active === 0}
              aria-label={t('galleryPrev')}
              className="absolute start-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-content-strong opacity-0 shadow-sm transition-opacity hover:bg-white disabled:opacity-0 group-hover:opacity-100 group-hover:disabled:opacity-40 lg:flex"
            >
              <ChevronLeft className="size-6 rtl:-scale-x-100" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => embla?.scrollNext()}
              disabled={active === slides.length - 1}
              aria-label={t('galleryNext')}
              className="absolute end-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-content-strong opacity-0 shadow-sm transition-opacity hover:bg-white disabled:opacity-0 group-hover:opacity-100 group-hover:disabled:opacity-40 lg:flex"
            >
              <ChevronRight className="size-6 rtl:-scale-x-100" strokeWidth={1.75} />
            </button>
          </>
        )}
      </div>

      {/* Dots: phone / tablet */}
      {many && (
        <div className="mt-3 flex items-center justify-center gap-2 lg:hidden" role="tablist">
          {slides.map((s, i) => (
            <button
              key={s.key}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={t('viewLabel', { n: i + 1 })}
              onClick={() => goTo(i)}
              className={cn(
                'size-2 rounded-full transition-colors',
                i === active ? 'bg-accent' : 'bg-border-strong',
              )}
            />
          ))}
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {t('galleryPhotoOf', { n: active + 1, total: slides.length })}
      </p>

      <ProductLightbox
        slides={slides}
        open={lightboxOpen}
        index={active}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={(i) => {
          setActive(i);
          goTo(i, true);
        }}
      />
    </div>
  );
}
