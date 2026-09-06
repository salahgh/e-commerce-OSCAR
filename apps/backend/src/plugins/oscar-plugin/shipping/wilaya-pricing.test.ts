// Unit tests for the pure per-wilaya delivery pricing helpers.
// Run: pnpm --filter @oscar/backend test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findWilayaRow, quoteDelivery, normalizePlace, FALLBACK_HOME_PRICE } from './wilaya-pricing';

const rows = [
  { code: '06', name: 'Béjaïa', nameAr: 'بجاية', homePrice: 40000, officePrice: 30000 },
  { code: '16', name: 'Alger', nameAr: 'الجزائر', homePrice: 30000, officePrice: 20000 },
  { code: '28', name: "M'Sila", nameAr: 'المسيلة', homePrice: 50000, officePrice: null },
];

test('normalizePlace strips accents, case and punctuation', () => {
  assert.equal(normalizePlace(' Béjaïa '), 'bejaia');
  assert.equal(normalizePlace("M'SILA"), 'm sila');
});

test('findWilayaRow resolves a two-digit code, padding a single digit', () => {
  assert.equal(findWilayaRow(rows, '16')?.name, 'Alger');
  assert.equal(findWilayaRow(rows, '6')?.name, 'Béjaïa');
});

test('findWilayaRow matches the French name regardless of case and accents', () => {
  assert.equal(findWilayaRow(rows, 'Alger')?.code, '16');
  assert.equal(findWilayaRow(rows, 'ALGER')?.code, '16');
  assert.equal(findWilayaRow(rows, 'Bejaia')?.code, '06');
  assert.equal(findWilayaRow(rows, "m'sila")?.code, '28');
});

test('findWilayaRow matches the Arabic name', () => {
  assert.equal(findWilayaRow(rows, 'الجزائر')?.code, '16');
});

test('findWilayaRow returns undefined for empty or unknown provinces', () => {
  assert.equal(findWilayaRow(rows, ''), undefined);
  assert.equal(findWilayaRow(rows, null), undefined);
  assert.equal(findWilayaRow(rows, undefined), undefined);
  assert.equal(findWilayaRow(rows, 'Atlantis'), undefined);
});

test('quoteDelivery returns the price of the requested mode', () => {
  assert.equal(quoteDelivery(rows[1], 'home', 500000, null), 30000);
  assert.equal(quoteDelivery(rows[1], 'office', 500000, null), 20000);
});

test('quoteDelivery offers nothing when the mode has no price in that wilaya', () => {
  assert.equal(quoteDelivery(rows[2], 'office', 500000, null), undefined);
  assert.equal(quoteDelivery({ homePrice: null, officePrice: 20000 }, 'home', 500000, null), undefined);
});

test('quoteDelivery falls back to 500 DZD home delivery for an unknown wilaya, and no office option', () => {
  assert.equal(quoteDelivery(undefined, 'home', 500000, null), FALLBACK_HOME_PRICE);
  assert.equal(FALLBACK_HOME_PRICE, 50000);
  assert.equal(quoteDelivery(undefined, 'office', 500000, null), undefined);
});

test('quoteDelivery is free above the channel threshold for both modes', () => {
  assert.equal(quoteDelivery(rows[1], 'home', 1200000, 1200000), 0);
  assert.equal(quoteDelivery(rows[1], 'office', 1500000, 1200000), 0);
  assert.equal(quoteDelivery(undefined, 'home', 1500000, 1200000), 0);
});

test('quoteDelivery charges normally below the threshold or when there is none', () => {
  assert.equal(quoteDelivery(rows[1], 'home', 1199900, 1200000), 30000);
  assert.equal(quoteDelivery(rows[1], 'home', 99999999, null), 30000);
});

test('a mode that is not offered stays hidden even above the free-shipping threshold', () => {
  assert.equal(quoteDelivery(rows[2], 'office', 1500000, 1200000), undefined);
});
