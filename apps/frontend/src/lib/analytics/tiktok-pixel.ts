/**
 * TikTok Pixel — browser-side event tracking.
 *
 * Mirrors meta-pixel.ts: every helper is a no-op unless
 * NEXT_PUBLIC_TIKTOK_PIXEL_ID is set, so dev environments never send events,
 * and the pixel script is bootstrapped lazily on the first tracked event. The
 * bootstrap installs the same queue stub the official base code does, so calls
 * made before events.js loads are buffered and replayed by the script.
 *
 * Event names are TikTok's standard e-commerce events, usable as ad
 * optimisation goals. CompletePayment is TikTok's counterpart of Meta's
 * Purchase: the storefront takes cash on delivery, so the order confirmation
 * page is the closest thing to a completed payment.
 */

type Ttq = {
  load: (pixelId: string, options?: Record<string, unknown>) => void;
  page: () => void;
  track: (event: string, params?: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    ttq?: Ttq;
    TiktokAnalyticsObject?: string;
  }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
const SCRIPT_URL = 'https://analytics.tiktok.com/i18n/pixel/events.js';

// Same reasoning as meta-pixel.ts: customers pay in DZD whatever the channel
// currency says.
const CURRENCY = 'DZD';

type TikTokContent = {
  content_id: string;
  content_type: 'product';
  content_name?: string;
  quantity: number;
  price?: number;
};

let initialized = false;

/** De-minified TikTok base code: an array that records [method, ...args] until events.js replaces it. */
function installStub(): Ttq {
  const methods = [
    'page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready',
    'alias', 'group', 'enableCookie', 'disableCookie', 'holdConsent', 'revokeConsent', 'grantConsent',
  ];
  const ttq: any = [];
  ttq.methods = methods;
  ttq.setAndDefer = (target: any, method: string) => {
    target[method] = (...args: unknown[]) => {
      target.push([method, ...args]);
    };
  };
  for (const method of methods) ttq.setAndDefer(ttq, method);
  ttq.instance = (id: string) => {
    const instance = ttq._i?.[id] ?? [];
    for (const method of methods) ttq.setAndDefer(instance, method);
    return instance;
  };
  ttq.load = (id: string, options?: Record<string, unknown>) => {
    ttq._i = ttq._i ?? {};
    ttq._i[id] = [];
    ttq._i[id]._u = SCRIPT_URL;
    ttq._t = ttq._t ?? {};
    ttq._t[id] = Date.now();
    ttq._o = ttq._o ?? {};
    ttq._o[id] = options ?? {};

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = `${SCRIPT_URL}?sdkid=${id}&lib=ttq`;
    document.head.appendChild(script);
  };

  window.TiktokAnalyticsObject = 'ttq';
  window.ttq = ttq as Ttq;
  return ttq as Ttq;
}

function ttq(): Ttq | undefined {
  if (!PIXEL_ID || typeof window === 'undefined') return undefined;

  if (!initialized) {
    const pixel = window.ttq ?? installStub();
    pixel.load(PIXEL_ID);
    initialized = true;
  }

  return window.ttq;
}

export function trackPageView(): void {
  ttq()?.page();
}

export function trackViewContent(item: {
  sku: string;
  name: string;
  /** Price in DZD units (not cents). */
  value: number;
}): void {
  const contents: TikTokContent[] = [
    { content_id: item.sku, content_type: 'product', content_name: item.name, quantity: 1, price: item.value },
  ];
  ttq()?.track('ViewContent', { contents, value: item.value, currency: CURRENCY });
}

export function trackAddToCart(item: {
  sku: string;
  name: string;
  quantity: number;
  /** Price of the added quantity, in DZD units (not cents). */
  value: number;
}): void {
  const contents: TikTokContent[] = [
    {
      content_id: item.sku,
      content_type: 'product',
      content_name: item.name,
      quantity: item.quantity,
      price: item.quantity > 0 ? item.value / item.quantity : item.value,
    },
  ];
  ttq()?.track('AddToCart', { contents, value: item.value, currency: CURRENCY });
}

export function trackInitiateCheckout(cart: {
  /** Cart total in DZD units (not cents). */
  value: number;
  items: Array<{ sku: string; quantity: number }>;
}): void {
  const contents: TikTokContent[] = cart.items.map((i) => ({
    content_id: i.sku,
    content_type: 'product',
    quantity: i.quantity,
  }));
  ttq()?.track('InitiateCheckout', { contents, value: cart.value, currency: CURRENCY });
}

export function trackPurchase(order: {
  code: string;
  /** Order total in DZD units (not cents). */
  value: number;
  items: Array<{ sku: string; quantity: number }>;
}): void {
  const pixel = ttq();
  if (!pixel) return;

  // The confirmation page can be reloaded or revisited from history —
  // remember tracked order codes so each purchase fires exactly once.
  const dedupKey = `tiktok-pixel:purchase:${order.code}`;
  try {
    if (window.localStorage.getItem(dedupKey)) return;
    window.localStorage.setItem(dedupKey, '1');
  } catch {
    // Storage unavailable (private mode) — track anyway.
  }

  const contents: TikTokContent[] = order.items.map((i) => ({
    content_id: i.sku,
    content_type: 'product',
    quantity: i.quantity,
  }));
  pixel.track('CompletePayment', { contents, value: order.value, currency: CURRENCY });
}
