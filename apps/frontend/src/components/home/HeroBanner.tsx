'use client';

import { useState, useCallback, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';

export interface BannerSlide {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl: string;
}

interface HeroBannerProps {
  slides: BannerSlide[];
}

function BannerSlideItem({ slide }: { slide: BannerSlide }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={`/products?category=${slide.slug}`}
      className="relative w-full shrink-0 aspect-[1392/754] bg-muted rounded-xl"
    >
      {!imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slide.imageUrl}
          alt={slide.name}
          className="w-full h-full object-cover rounded-xl"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <ImageOff className="w-12 h-12" />
          <span className="text-lg font-medium">{slide.name}</span>
        </div>
      )}
    </Link>
  );
}

export function HeroBanner({ slides }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex((index + slides.length) % slides.length);
    },
    [slides.length]
  );

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => goTo(currentIndex + 1), 5000);
    return () => clearInterval(timer);
  }, [currentIndex, goTo, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide) => (
          <BannerSlideItem key={slide.id} slide={slide} />
        ))}
      </div>

      {/* Arrow Controls */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => goTo(currentIndex - 1)}
            className="absolute start-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full shadow flex items-center justify-center hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <button
            onClick={() => goTo(currentIndex + 1)}
            className="absolute end-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full shadow flex items-center justify-center hover:bg-white transition-colors"
          >
            <ChevronRight className="w-5 h-5 rtl:rotate-180" />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                i === currentIndex
                  ? 'w-6 bg-primary'
                  : 'w-2 bg-white/60 hover:bg-white/80'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
