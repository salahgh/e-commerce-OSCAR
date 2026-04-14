'use client';

import { Link } from '@/i18n/routing';

interface PromoBannerProps {
  imageUrl: string;
  alt: string;
  href: string;
}

export function PromoBanner({ imageUrl, alt, href }: PromoBannerProps) {
  return (
    <Link href={href} className="block w-full overflow-hidden rounded-xl">
      <div className="relative aspect-[1392/754] w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
          loading="lazy"
        />
      </div>
    </Link>
  );
}
