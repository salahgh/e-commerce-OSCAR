// Unit tests for the TikTok Pixel helpers.
// Run: pnpm --filter @oscar/frontend test:unit   (node --test, no extra deps)
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const PIXEL_ID = 'DAA2TURC77UBPDTVK0FG';
const g = globalThis as any;

let importCount = 0;
/** Import a fresh module instance so the per-page `initialized` state resets. */
async function freshModule(pixelId: string | undefined) {
  if (pixelId === undefined) delete process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
  else process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID = pixelId;
  return import(`./tiktok-pixel?case=${++importCount}`);
}

function memoryStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  };
}

/** A browser with no TikTok pixel installed yet. */
function bareBrowser() {
  const appended: any[] = [];
  g.window = { localStorage: memoryStorage() };
  g.document = {
    head: { appendChild: (el: unknown) => appended.push(el) },
    createElement: (tagName: string) => ({ tagName }),
  };
  return { appended };
}

/** A browser where the TikTok pixel is already loaded (records every call). */
function browserWithTtq() {
  const calls: unknown[][] = [];
  g.window = {
    localStorage: memoryStorage(),
    ttq: {
      load: (...a: unknown[]) => calls.push(['load', ...a]),
      page: (...a: unknown[]) => calls.push(['page', ...a]),
      track: (...a: unknown[]) => calls.push(['track', ...a]),
    },
  };
  g.document = { head: { appendChild: () => {} }, createElement: () => ({}) };
  return { calls };
}

beforeEach(() => {
  delete g.window;
  delete g.document;
});

test('installs the TikTok base script for the configured pixel on the first event', async () => {
  const { appended } = bareBrowser();
  const { trackPageView } = await freshModule(PIXEL_ID);

  trackPageView();

  assert.equal(appended.length, 1);
  assert.equal(appended[0].src, `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${PIXEL_ID}&lib=ttq`);
  assert.equal(appended[0].async, true);
  // The stub queue is what events.js replays once it loads.
  assert.deepEqual(JSON.parse(JSON.stringify(g.window.ttq)), [['page']]);
});

test('installs the base script only once across many events', async () => {
  const { appended } = bareBrowser();
  const { trackPageView, trackViewContent } = await freshModule(PIXEL_ID);

  trackPageView();
  trackPageView();
  trackViewContent({ sku: 'SKU-1', name: 'Robe', value: 4500 });

  assert.equal(appended.length, 1);
});

test('does nothing when NEXT_PUBLIC_TIKTOK_PIXEL_ID is unset', async () => {
  const { appended } = bareBrowser();
  const mod = await freshModule(undefined);

  mod.trackPageView();
  mod.trackViewContent({ sku: 'SKU-1', name: 'Robe', value: 4500 });
  mod.trackPurchase({ code: 'ABC', value: 4500, items: [{ sku: 'SKU-1', quantity: 1 }] });

  assert.equal(appended.length, 0);
  assert.equal(g.window.ttq, undefined);
});

test('is a silent no-op during server rendering', async () => {
  const mod = await freshModule(PIXEL_ID);

  assert.doesNotThrow(() => {
    mod.trackPageView();
    mod.trackViewContent({ sku: 'SKU-1', name: 'Robe', value: 4500 });
    mod.trackAddToCart({ sku: 'SKU-1', name: 'Robe', quantity: 1, value: 4500 });
    mod.trackInitiateCheckout({ value: 4500, items: [{ sku: 'SKU-1', quantity: 1 }] });
    mod.trackPurchase({ code: 'ABC', value: 4500, items: [{ sku: 'SKU-1', quantity: 1 }] });
  });
});

test('reports ViewContent with the product sku, name and DZD price', async () => {
  const { calls } = browserWithTtq();
  const { trackViewContent } = await freshModule(PIXEL_ID);

  trackViewContent({ sku: 'SKU-1', name: 'Robe', value: 4500 });

  assert.deepEqual(calls, [
    ['load', PIXEL_ID],
    [
      'track',
      'ViewContent',
      {
        contents: [{ content_id: 'SKU-1', content_type: 'product', content_name: 'Robe', quantity: 1, price: 4500 }],
        value: 4500,
        currency: 'DZD',
      },
    ],
  ]);
});

test('reports AddToCart with the quantity added and the unit price', async () => {
  const { calls } = browserWithTtq();
  const { trackAddToCart } = await freshModule(PIXEL_ID);

  trackAddToCart({ sku: 'SKU-1', name: 'Robe', quantity: 2, value: 9000 });

  assert.deepEqual(calls[1], [
    'track',
    'AddToCart',
    {
      contents: [{ content_id: 'SKU-1', content_type: 'product', content_name: 'Robe', quantity: 2, price: 4500 }],
      value: 9000,
      currency: 'DZD',
    },
  ]);
});

test('reports InitiateCheckout with every cart line', async () => {
  const { calls } = browserWithTtq();
  const { trackInitiateCheckout } = await freshModule(PIXEL_ID);

  trackInitiateCheckout({
    value: 12000,
    items: [
      { sku: 'SKU-1', quantity: 2 },
      { sku: 'SKU-2', quantity: 1 },
    ],
  });

  assert.deepEqual(calls[1], [
    'track',
    'InitiateCheckout',
    {
      contents: [
        { content_id: 'SKU-1', content_type: 'product', quantity: 2 },
        { content_id: 'SKU-2', content_type: 'product', quantity: 1 },
      ],
      value: 12000,
      currency: 'DZD',
    },
  ]);
});

test('reports CompletePayment once per order code even when the confirmation page reloads', async () => {
  const { calls } = browserWithTtq();
  const { trackPurchase } = await freshModule(PIXEL_ID);
  const order = { code: 'ORD-1', value: 12000, items: [{ sku: 'SKU-1', quantity: 2 }] };

  trackPurchase(order);
  trackPurchase(order);
  trackPurchase({ ...order, code: 'ORD-2' });

  const payments = calls.filter((c) => c[0] === 'track' && c[1] === 'CompletePayment');
  assert.equal(payments.length, 2);
  assert.deepEqual(payments[0], [
    'track',
    'CompletePayment',
    {
      contents: [{ content_id: 'SKU-1', content_type: 'product', quantity: 2 }],
      value: 12000,
      currency: 'DZD',
    },
  ]);
});
