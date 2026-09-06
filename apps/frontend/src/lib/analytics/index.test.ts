// Unit tests for the analytics fan-out: every funnel event reaches both pixels.
// Run: pnpm --filter @oscar/frontend test:unit   (node --test, no extra deps)
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.NEXT_PUBLIC_META_PIXEL_ID = '1795558734909993';
process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID = 'DAA2TURC77UBPDTVK0FG';

const g = globalThis as any;

function memoryStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  };
}

/** A browser where both pixels are already loaded; records every call to each. */
function browserWithBothPixels() {
  const fbqCalls: unknown[][] = [];
  const ttqCalls: unknown[][] = [];
  g.window = {
    localStorage: memoryStorage(),
    fbq: (...a: unknown[]) => fbqCalls.push(a),
    ttq: {
      load: (...a: unknown[]) => ttqCalls.push(['load', ...a]),
      page: (...a: unknown[]) => ttqCalls.push(['page', ...a]),
      track: (...a: unknown[]) => ttqCalls.push(['track', ...a]),
    },
  };
  g.document = { head: { appendChild: () => {} }, createElement: () => ({}) };
  return { fbqCalls, ttqCalls };
}

const tracked = (calls: unknown[][], event: string) =>
  calls.filter((c) => c[0] === 'track' && c[1] === event);

beforeEach(() => {
  delete g.window;
  delete g.document;
});

test('forwards a page view to both pixels', async () => {
  const { fbqCalls, ttqCalls } = browserWithBothPixels();
  const { trackPageView } = await import('./index');

  trackPageView();

  assert.equal(tracked(fbqCalls, 'PageView').length, 1);
  assert.equal(ttqCalls.filter((c) => c[0] === 'page').length, 1);
});

test('forwards AddToCart to both pixels with the same item', async () => {
  const { fbqCalls, ttqCalls } = browserWithBothPixels();
  const { trackAddToCart } = await import('./index');

  trackAddToCart({ sku: 'SKU-1', name: 'Robe', quantity: 1, value: 4500 });

  const [meta] = tracked(fbqCalls, 'AddToCart');
  const [tiktok] = tracked(ttqCalls, 'AddToCart');
  assert.ok(meta, 'Meta did not receive AddToCart');
  assert.ok(tiktok, 'TikTok did not receive AddToCart');
  assert.equal((meta[2] as any).content_ids[0], 'SKU-1');
  assert.equal((tiktok[2] as any).contents[0].content_id, 'SKU-1');
});

test('reports a purchase to both pixels, each exactly once', async () => {
  const { fbqCalls, ttqCalls } = browserWithBothPixels();
  const { trackPurchase } = await import('./index');
  const order = { code: 'ORD-9', value: 9000, items: [{ sku: 'SKU-1', quantity: 2 }] };

  trackPurchase(order);
  trackPurchase(order);

  assert.equal(tracked(fbqCalls, 'Purchase').length, 1);
  assert.equal(tracked(ttqCalls, 'CompletePayment').length, 1);
});
