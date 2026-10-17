import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localizedText, phoneNumbers } from './localized';

const cf = {
  footerAddressFr: '30 Lot dauphin, Draria, Alger',
  footerAddressAr: null,
  footerAddressEn: '  ',
  promoTextAr: 'توصيل مجاني',
  promoTextFr: null,
  promoTextEn: null,
};

test('uses the value of the current language when there is one', () => {
  assert.equal(localizedText(cf, 'promoText', 'ar'), 'توصيل مجاني');
  assert.equal(localizedText(cf, 'footerAddress', 'fr'), '30 Lot dauphin, Draria, Alger');
});

test('falls back to French, then Arabic, then English when the language is empty', () => {
  // Arabic and English were never filled in the back-office: show the French address, not a built-in one
  assert.equal(localizedText(cf, 'footerAddress', 'ar'), '30 Lot dauphin, Draria, Alger');
  assert.equal(localizedText(cf, 'footerAddress', 'en'), '30 Lot dauphin, Draria, Alger');
  assert.equal(localizedText(cf, 'promoText', 'fr'), 'توصيل مجاني');
});

test('returns null when no language has a value', () => {
  assert.equal(localizedText(cf, 'copyrightText', 'fr'), null);
  assert.equal(localizedText(undefined, 'footerAddress', 'fr'), null);
});

test('phoneNumbers splits a field holding several numbers and builds dialable links', () => {
  assert.deepEqual(phoneNumbers('0558500160/0552182635'), [
    { label: '0558500160', href: 'tel:0558500160' },
    { label: '0552182635', href: 'tel:0552182635' },
  ]);
  assert.deepEqual(phoneNumbers('+213 555 12 34 56 , 0661 22 33 44'), [
    { label: '+213 555 12 34 56', href: 'tel:+213555123456' },
    { label: '0661 22 33 44', href: 'tel:0661223344' },
  ]);
  assert.deepEqual(phoneNumbers(null), []);
  assert.deepEqual(phoneNumbers(' / '), []);
});
