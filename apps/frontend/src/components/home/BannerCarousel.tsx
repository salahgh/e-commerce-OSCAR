'use client';

import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SliderDots } from './SliderDots';
import { useCarousel } from './useCarousel';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

interface BannerCarouselProps {
  /** Which configurable image set to render. */
  settingKey: 'hero' | 'banner';
  /** Static images used until/if the channel has none configured. */
  fallbackSrcs: string[];
  alt: string;
  priority?: boolean;
}

/**
 * Full-width marketing carousel — rounded hero/promo images with prev/next
 * arrows and pagination dots. Images come from the channel site settings
 * (hero/banner), falling back to `fallbackSrcs`. Controls hide for a single image.
 */
export function BannerCarousel({ settingKey, fallbackSrcs, alt, priority }: BannerCarouselProps) {
  const s = useSiteSettings();
  const configured = settingKey === 'hero' ? s?.heroImages : s?.bannerImages;
  const images = configured && configured.length ? configured : fallbackSrcs;
  const { index, next, prev, goTo } = useCarousel(images.length);
  const multiple = images.length > 1;
  const arrowCls =
    'absolute top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-bg-elevated/80 text-content-strong shadow-card transition-colors hover:bg-bg-elevated';

  return (
    <section className="flex flex-col items-center gap-7">
      <div className="relative w-full overflow-hidden rounded-[12px]">
        <Image
          key={images[index]}
          src={images[index]}
          alt={alt}
          width={1392}
          height={733}
          priority={priority}
          className="h-auto w-full object-cover"
        />
        {multiple && (
          <>
            <button type="button" aria-label="Précédent" onClick={prev} className={`${arrowCls} left-4`}>
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button type="button" aria-label="Suivant" onClick={next} className={`${arrowCls} right-4`}>
              <ArrowRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      {multiple && <SliderDots count={images.length} active={index} onDotClick={goTo} />}
    </section>
  );
}
