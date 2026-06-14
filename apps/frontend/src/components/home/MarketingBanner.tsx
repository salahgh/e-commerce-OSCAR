'use client';

import Image from 'next/image';
import { SliderDots } from './SliderDots';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

interface MarketingBannerProps {
  src: string;
  alt: string;
  /** Number of pagination dots to show (Figma shows 5). */
  dots?: number;
  priority?: boolean;
  /** Which configurable image to prefer; falls back to `src`. */
  settingKey?: 'hero' | 'banner';
}

/**
 * Full-width marketing banner — a rounded hero/promo image with pagination dots.
 * The headline, logos and copy are baked into the artwork (as in the Figma design).
 * Image is sourced from the channel site settings when configured, else `src`.
 */
export function MarketingBanner({ src, alt, dots = 5, priority, settingKey }: MarketingBannerProps) {
  const s = useSiteSettings();
  const resolved =
    settingKey === 'hero'
      ? s?.heroImage || src
      : settingKey === 'banner'
        ? s?.bannerImages[0] || src
        : src;
  return (
    <section className="flex flex-col items-center gap-7">
      <div className="w-full overflow-hidden rounded-[12px]">
        <Image
          src={resolved}
          alt={alt}
          width={1392}
          height={733}
          priority={priority}
          className="h-auto w-full object-cover"
        />
      </div>
      <SliderDots count={dots} active={0} />
    </section>
  );
}
