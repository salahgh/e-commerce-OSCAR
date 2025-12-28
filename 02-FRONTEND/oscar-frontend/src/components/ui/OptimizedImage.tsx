'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad'> {
  fallbackSrc?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | 'auto';
  showSkeleton?: boolean;
  blurAmount?: number;
  onLoad?: () => void;
}

const aspectRatioClasses = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  auto: '',
};

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder.png',
  aspectRatio = 'auto',
  showSkeleton = true,
  blurAmount = 20,
  className,
  onLoad,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before entering viewport
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  const imageSrc = error ? fallbackSrc : src;

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden bg-muted',
        aspectRatioClasses[aspectRatio],
        className
      )}
    >
      {/* Skeleton loader */}
      {showSkeleton && isLoading && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-muted via-muted-foreground/10 to-muted" />
      )}

      {/* Only render image when in view */}
      {isInView && (
        <Image
          src={imageSrc}
          alt={alt}
          className={cn(
            'transition-all duration-300',
            isLoading ? 'scale-105 blur-sm opacity-0' : 'scale-100 blur-0 opacity-100'
          )}
          onLoad={handleLoad}
          onError={handleError}
          priority={priority}
          {...props}
        />
      )}
    </div>
  );
}

// Responsive product image with optimized sizes
interface ProductImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}

export function ProductImage({ src, alt, priority = false, className }: ProductImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      priority={priority}
      aspectRatio="square"
      className={className}
      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
    />
  );
}

// Hero/Banner image with high priority
interface HeroImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function HeroImage({ src, alt, className }: HeroImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      priority
      aspectRatio="video"
      className={className}
      sizes="100vw"
    />
  );
}

// Thumbnail image with small sizes
interface ThumbnailImageProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const thumbnailSizes = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
};

export function ThumbnailImage({ src, alt, size = 'md', className }: ThumbnailImageProps) {
  return (
    <div className={cn('relative', thumbnailSizes[size], className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        aspectRatio="square"
        sizes={size === 'sm' ? '40px' : size === 'md' ? '64px' : '96px'}
      />
    </div>
  );
}

// Avatar image with circular crop
interface AvatarImageProps {
  src?: string;
  alt: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const avatarSizes = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

export function AvatarImage({ src, alt, fallback, size = 'md', className }: AvatarImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className={cn(
          'rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium',
          avatarSizes[size],
          className
        )}
      >
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={cn('relative rounded-full overflow-hidden', avatarSizes[size], className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={size === 'sm' ? '32px' : size === 'md' ? '40px' : size === 'lg' ? '48px' : '64px'}
        onError={() => setError(true)}
      />
    </div>
  );
}
