/**
 * Meta (Facebook) Pixel — browser-side event tracking.
 *
 * Every helper is a no-op unless NEXT_PUBLIC_META_PIXEL_ID is set, so dev
 * environments never send events. The pixel script is bootstrapped lazily on
 * the first tracked event instead of via a <Script> tag, which guarantees the
 * fbq queue stub exists before any call regardless of hydration order.
 */

type Fbq = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: Fbq;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

let initialized = false;

function fbq(...args: unknown[]): void {
  if (!PIXEL_ID || typeof window === 'undefined') return;

  if (!initialized) {
    if (!window.fbq) {
      // Same queue stub the official snippet installs: calls made before
      // fbevents.js loads are buffered and replayed by the script.
      const stub = function (...callArgs: unknown[]) {
        if (stub.callMethod) {
          stub.callMethod(...callArgs);
        } else {
          stub.queue.push(callArgs);
        }
      } as Fbq;
      stub.push = stub;
      stub.loaded = true;
      stub.version = '2.0';
      stub.queue = [];
      window.fbq = stub;
      window._fbq = stub;

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(script);
    }
    window.fbq('init', PIXEL_ID);
    initialized = true;
  }

  window.fbq!(...args);
}

// The storefront trades exclusively in DZD (every price is rendered with the
// shared DZD formatter), but the production channel's currencyCode is
// currently misconfigured as USD. Report the currency customers actually pay
// in rather than passing the channel value through.
const CURRENCY = 'DZD';

export function trackPageView(): void {
  fbq('track', 'PageView');
}

export function trackViewContent(item: {
  sku: string;
  name: string;
  /** Price in DZD units (not cents). */
  value: number;
}): void {
  fbq('track', 'ViewContent', {
    content_ids: [item.sku],
    content_name: item.name,
    content_type: 'product',
    value: item.value,
    currency: CURRENCY,
  });
}

export function trackInitiateCheckout(cart: {
  /** Cart total in DZD units (not cents). */
  value: number;
  items: Array<{ sku: string; quantity: number }>;
}): void {
  fbq('track', 'InitiateCheckout', {
    content_ids: cart.items.map((i) => i.sku),
    content_type: 'product',
    contents: cart.items.map((i) => ({ id: i.sku, quantity: i.quantity })),
    num_items: cart.items.reduce((sum, i) => sum + i.quantity, 0),
    value: cart.value,
    currency: CURRENCY,
  });
}

export function trackAddToCart(item: {
  sku: string;
  name: string;
  quantity: number;
  /** Price of the added quantity, in DZD units (not cents). */
  value: number;
}): void {
  fbq('track', 'AddToCart', {
    content_ids: [item.sku],
    content_name: item.name,
    content_type: 'product',
    contents: [{ id: item.sku, quantity: item.quantity }],
    value: item.value,
    currency: CURRENCY,
  });
}

export function trackPurchase(order: {
  code: string;
  /** Order total in DZD units (not cents). */
  value: number;
  items: Array<{ sku: string; quantity: number }>;
}): void {
  // The confirmation page can be reloaded or revisited from history —
  // remember tracked order codes so each purchase fires exactly once.
  const dedupKey = `meta-pixel:purchase:${order.code}`;
  try {
    if (window.localStorage.getItem(dedupKey)) return;
    window.localStorage.setItem(dedupKey, '1');
  } catch {
    // Storage unavailable (private mode) — track anyway.
  }

  fbq('track', 'Purchase', {
    content_ids: order.items.map((i) => i.sku),
    content_type: 'product',
    contents: order.items.map((i) => ({ id: i.sku, quantity: i.quantity })),
    num_items: order.items.reduce((sum, i) => sum + i.quantity, 0),
    value: order.value,
    currency: CURRENCY,
  });
}
