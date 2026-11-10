// Run: pnpm --filter @oscar/frontend test:unit
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { clearRecentOrder, getRecentOrder, isFinalExtendError, minutesLeft, saveRecentOrder } from './recent-order';

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

beforeEach(() => {
  (globalThis as any).window = { localStorage: memoryStorage() };
});

const t0 = 1_700_000_000_000;

test('remembers the order for 30 minutes, then forgets it', () => {
  saveRecentOrder('ABC', t0);
  assert.deepEqual(getRecentOrder(t0 + 29 * 60_000), { code: 'ABC', placedAt: t0 });
  assert.equal(getRecentOrder(t0 + 31 * 60_000), null);
  assert.equal(getRecentOrder(t0 + 1), null, 'expired entry is removed');
});

test('ignores garbage and clears on demand', () => {
  (globalThis as any).window.localStorage.setItem('oscar.recentOrder', '{not json');
  assert.equal(getRecentOrder(t0), null);
  saveRecentOrder('ABC', t0);
  clearRecentOrder();
  assert.equal(getRecentOrder(t0), null);
});

test('minutesLeft rounds up and never shows 0', () => {
  assert.equal(minutesLeft({ code: 'A', placedAt: t0 }, t0 + 60_000), 29);
  assert.equal(minutesLeft({ code: 'A', placedAt: t0 }, t0 + 30 * 60_000), 1);
});

test('final extend errors hide the offer, stock errors do not', () => {
  assert.equal(isFinalExtendError('EXPIRED'), true);
  assert.equal(isFinalExtendError('INSUFFICIENT_STOCK_ERROR'), false);
  assert.equal(isFinalExtendError(null), false);
});
