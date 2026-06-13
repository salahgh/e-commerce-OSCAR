import Image from 'next/image';
import { SliderDots } from './SliderDots';

interface MarketingBannerProps {
  src: string;
  alt: string;
  /** Number of pagination dots to show (Figma shows 5). */
  dots?: number;
  priority?: boolean;
}

/**
 * Full-width marketing banner — a rounded hero/promo image with pagination dots.
 * The headline, logos and copy are baked into the artwork (as in the Figma design).
 */
export function MarketingBanner({ src, alt, dots = 5, priority }: MarketingBannerProps) {
  return (
    <section className="flex flex-col items-center gap-7">
      <div className="w-full overflow-hidden rounded-[12px]">
        <Image
          src={src}
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
