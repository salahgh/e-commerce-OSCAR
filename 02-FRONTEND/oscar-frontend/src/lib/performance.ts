'use client';

import { useEffect, useCallback, useRef } from 'react';

// ============================================
// Web Vitals Tracking
// ============================================

interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

type WebVitalsCallback = (metric: WebVitalsMetric) => void;

export function reportWebVitals(callback: WebVitalsCallback) {
  if (typeof window === 'undefined') return;

  // Dynamic import to avoid bundle bloat
  import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
    onCLS(callback as any);
    onFID(callback as any);
    onFCP(callback as any);
    onLCP(callback as any);
    onTTFB(callback as any);
    onINP(callback as any);
  }).catch(() => {
    console.warn('[Performance] web-vitals not available');
  });
}

// Send vitals to analytics
export function sendToAnalytics(metric: WebVitalsMetric) {
  const body = JSON.stringify({
    id: metric.id,
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    page: window.location.pathname,
    timestamp: Date.now(),
  });

  // Use sendBeacon for reliable delivery
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/vitals', body);
  } else {
    fetch('/api/analytics/vitals', {
      body,
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// ============================================
// Performance Monitoring Hooks
// ============================================

// Track component render time
export function useRenderTime(componentName: string) {
  const startTime = useRef(performance.now());

  useEffect(() => {
    const renderTime = performance.now() - startTime.current;
    if (renderTime > 50) {
      console.warn(`[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render`);
    }
  }, [componentName]);
}

// Track interaction to next paint
export function useInteractionTracking() {
  const trackInteraction = useCallback((interactionName: string) => {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      if (duration > 100) {
        console.warn(`[Performance] ${interactionName} took ${duration.toFixed(2)}ms`);
      }
    };
  }, []);

  return trackInteraction;
}

// ============================================
// Resource Loading Optimization
// ============================================

// Preload critical resources
export function preloadResource(href: string, as: string, type?: string) {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) link.type = type;

  document.head.appendChild(link);
}

// Prefetch pages for navigation
export function prefetchPage(href: string) {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;

  document.head.appendChild(link);
}

// DNS prefetch for external domains
export function dnsPrefetch(domain: string) {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = domain;

  document.head.appendChild(link);
}

// ============================================
// Lazy Loading Utilities
// ============================================

// Hook for lazy loading when element is in view
export function useIntersectionObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) {
  const targetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback(entry);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [callback, options]);

  return targetRef;
}

// ============================================
// Memory Management
// ============================================

// Debounce function for expensive operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for frequent events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Request idle callback wrapper
export function runWhenIdle(callback: () => void, timeout = 2000) {
  if (typeof window === 'undefined') return;

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 1);
  }
}

// ============================================
// Image Optimization Helpers
// ============================================

// Get optimal image size based on viewport
export function getOptimalImageSize(
  containerWidth: number,
  devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio : 1
): number {
  const sizes = [16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048];
  const targetSize = containerWidth * devicePixelRatio;

  return sizes.find((size) => size >= targetSize) || sizes[sizes.length - 1];
}

// Generate srcset for responsive images
export function generateSrcSet(
  baseUrl: string,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920]
): string {
  return widths.map((w) => `${baseUrl}?w=${w} ${w}w`).join(', ');
}

// ============================================
// Bundle Size Monitoring (Dev only)
// ============================================

export function logBundleSize() {
  if (process.env.NODE_ENV !== 'development') return;

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  const jsResources = resources.filter((r) => r.name.includes('.js'));
  const cssResources = resources.filter((r) => r.name.includes('.css'));

  const totalJsSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
  const totalCssSize = cssResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);

  console.group('[Performance] Bundle Analysis');
  console.log(`JS Bundle: ${(totalJsSize / 1024).toFixed(2)} KB`);
  console.log(`CSS Bundle: ${(totalCssSize / 1024).toFixed(2)} KB`);
  console.log(`Total: ${((totalJsSize + totalCssSize) / 1024).toFixed(2)} KB`);
  console.groupEnd();
}
