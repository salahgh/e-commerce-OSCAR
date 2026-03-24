'use client';

import dynamic from 'next/dynamic';
import { ComponentType, ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Loading placeholder components
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const LoadingSkeleton = ({ height = 200 }: { height?: number }) => (
  <Skeleton className="w-full" style={{ height }} />
);

const CardSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="aspect-square w-full rounded-lg" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

// Dynamic import wrapper with loading state
export function createDynamicComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    loading?: ReactNode;
    ssr?: boolean;
  }
) {
  return dynamic(importFn, {
    loading: () => <>{options?.loading || <LoadingSpinner />}</>,
    ssr: options?.ssr ?? true,
  });
}

// ============================================
// Heavy Components - Dynamically Imported
// ============================================

// Image Lightbox - Only load when user clicks to view
export const DynamicImageLightbox = dynamic(
  () => import('@/components/product/ImageZoom').then((mod) => ({ default: mod.ImageLightbox })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

// Product Reviews - Load after main content
export const DynamicProductReviews = dynamic(
  () => import('@/components/product/ProductTabs').then((mod) => ({ default: mod.ProductReviewsTab })),
  {
    loading: () => <LoadingSkeleton height={300} />,
    ssr: true,
  }
);

// Social Share - Not critical for initial render
export const DynamicSocialShare = dynamic(
  () => import('@/components/product/SocialShare').then((mod) => ({ default: mod.SocialShare })),
  {
    loading: () => <Skeleton className="h-10 w-24" />,
    ssr: false,
  }
);

// Recently Viewed - Client-side only (uses localStorage)
export const DynamicRecentlyViewed = dynamic(
  () => import('@/components/product/RecentlyViewed').then((mod) => ({ default: mod.RecentlyViewed })),
  {
    loading: () => <LoadingSkeleton height={180} />,
    ssr: false,
  }
);

// Related Products - Below the fold
export const DynamicRelatedProducts = dynamic(
  () => import('@/components/product/RelatedProducts').then((mod) => ({ default: mod.RelatedProducts })),
  {
    loading: () => (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    ),
    ssr: true,
  }
);

// Cart Drawer - Only load on interaction
export const DynamicCartDrawer = dynamic(
  () => import('@/components/cart/CartDrawer').then((mod) => ({ default: mod.CartDrawer })),
  {
    loading: () => null,
    ssr: false,
  }
);

// Checkout Forms - Load progressively
export const DynamicShippingAddressForm = dynamic(
  () => import('@/components/checkout/ShippingAddressForm').then((mod) => ({ default: mod.ShippingAddressForm })),
  {
    loading: () => <LoadingSkeleton height={400} />,
    ssr: false,
  }
);

export const DynamicPaymentMethodForm = dynamic(
  () => import('@/components/checkout/PaymentMethodForm').then((mod) => ({ default: mod.PaymentMethodForm })),
  {
    loading: () => <LoadingSkeleton height={300} />,
    ssr: false,
  }
);

// ============================================
// Third-party Libraries - Lazy Load
// ============================================

// Framer Motion animations - Only when needed
export const DynamicMotionDiv = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.div) as any,
  { ssr: false }
);

// Date picker (if used)
export const DynamicDatePicker = dynamic(
  () => import('@/components/ui/date-picker').then((mod) => ({ default: mod.DatePicker })).catch(() => ({ default: () => null })),
  {
    loading: () => <Skeleton className="h-10 w-full" />,
    ssr: false,
  }
);

// ============================================
// Utility: Prefetch component on hover
// ============================================

export function usePrefetch(importFn: () => Promise<any>) {
  const prefetch = () => {
    importFn();
  };

  return {
    onMouseEnter: prefetch,
    onFocus: prefetch,
  };
}

// ============================================
// Utility: Load component after idle
// ============================================

export function loadAfterIdle(importFn: () => Promise<any>, timeout = 2000) {
  if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => importFn(), { timeout });
    } else {
      setTimeout(importFn, timeout);
    }
  }
}

// Preload commonly used dynamic components after page loads
export function preloadComponents() {
  if (typeof window !== 'undefined') {
    loadAfterIdle(() => import('@/components/cart/CartDrawer'));
    loadAfterIdle(() => import('@/components/product/ImageZoom'));
  }
}
