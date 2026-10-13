// Unit tests for the pure per-wilaya delivery pricing helpers.
// Run: pnpm --filter @oscar/backend test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  findWilayaRow,
  quoteDelivery,
  normalizePlace,
  nextCommuneCode,
  FALLBACK_HOME_PRICE,
} from './wilaya-pricing';

const rows = [
  { code: '06', name: 'Béjaïa', nameAr: 'بجاية', active: true, homePrice: 40000, officePrice: 30000 },
  { code: '16', name: 'Alger', nameAr: 'الجزائر', active: true, homePrice: 30000, officePrice: 20000 },
  { code: '28', name: "M'Sila", nameAr: 'المسيلة', active: true, homePrice: 50000, officePrice: null },
  { code: '33', name: 'Illizi', nameAr: 'إليزي', active: false, homePrice: 80000, officePrice: 70000 },
];

test('normalizePlace strips accents, case and punctuation', () => {
  assert.equal(normalizePlace(' Béjaïa '), 'bejaia');
  assert.equal(normalizePlace("M'SILA"), 'm sila');
});

test('findWilayaRow resolves a two-digit code, padding a single digit', () => {
  assert.equal(findWilayaRow(rows, { province: '16' })?.name, 'Alger');
  assert.equal(findWilayaRow(rows, { province: '6' })?.name, 'Béjaïa');
});

test('findWilayaRow matches the French name regardless of case and accents', () => {
  assert.equal(findWilayaRow(rows, { province: 'Alger' })?.code, '16');
  assert.equal(findWilayaRow(rows, { province: 'ALGER' })?.code, '16');
  assert.equal(findWilayaRow(rows, { province: 'Bejaia' })?.code, '06');
  assert.equal(findWilayaRow(rows, { province: "m'sila" })?.code, '28');
});

test('findWilayaRow matches the Arabic name', () => {
  assert.equal(findWilayaRow(rows, { province: 'الجزائر' })?.code, '16');
});

test('findWilayaRow falls back to the wilayaCode custom field when the name no longer matches', () => {
  // A renamed wilaya: the saved address still carries the old name but the code is stable.
  assert.equal(findWilayaRow(rows, { province: 'Ancien nom', customFields: { wilayaCode: '16' } })?.code, '16');
  assert.equal(findWilayaRow(rows, { province: '', customFields: { wilayaCode: '06' } })?.code, '06');
  // An unknown code resolves nothing.
  assert.equal(findWilayaRow(rows, { province: 'Nulle part', customFields: { wilayaCode: '99' } }), undefined);
});

test('findWilayaRow never lets the client-supplied code override a recognised shipped-to name', () => {
  // Cheap code + expensive destination text: the text the courier reads wins.
  assert.equal(findWilayaRow(rows, { province: 'Béjaïa', customFields: { wilayaCode: '16' } })?.code, '06');
  assert.equal(findWilayaRow(rows, { province: 'بجاية', customFields: { wilayaCode: '16' } })?.code, '06');
  assert.equal(findWilayaRow(rows, { province: '6', customFields: { wilayaCode: '16' } })?.code, '06');
});

test('findWilayaRow returns undefined for empty or unknown provinces', () => {
  assert.equal(findWilayaRow(rows, { province: '' }), undefined);
  assert.equal(findWilayaRow(rows, { province: null }), undefined);
  assert.equal(findWilayaRow(rows, undefined), undefined);
  assert.equal(findWilayaRow(rows, { province: 'Atlantis' }), undefined);
});

test('quoteDelivery returns the price of the requested mode', () => {
  assert.equal(quoteDelivery(rows[1], 'home', 500000, null), 30000);
  assert.equal(quoteDelivery(rows[1], 'office', 500000, null), 20000);
});

test('quoteDelivery offers nothing when the mode has no price in that wilaya', () => {
  assert.equal(quoteDelivery(rows[2], 'office', 500000, null), undefined);
  assert.equal(quoteDelivery({ active: true, homePrice: null, officePrice: 20000 }, 'home', 500000, null), undefined);
});

test('quoteDelivery offers nothing in an inactive wilaya, even above the free-shipping threshold', () => {
  assert.equal(quoteDelivery(rows[3], 'home', 500000, null), undefined);
  assert.equal(quoteDelivery(rows[3], 'office', 500000, null), undefined);
  assert.equal(quoteDelivery(rows[3], 'home', 1500000, 1200000), undefined);
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

test('nextCommuneCode takes the first free two-digit suffix of the wilaya', () => {
  assert.equal(nextCommuneCode('16', []), '1601');
  assert.equal(nextCommuneCode('16', ['1601', '1602']), '1603');
  assert.equal(nextCommuneCode('16', ['1601', '1603']), '1602');
  // Codes of other wilayas are ignored.
  assert.equal(nextCommuneCode('05', ['1601']), '0501');
});

test('nextCommuneCode refuses a full wilaya', () => {
  const full = Array.from({ length: 99 }, (_, i) => `16${String(i + 1).padStart(2, '0')}`);
  assert.throws(() => nextCommuneCode('16', full), /no free commune code/i);
});
