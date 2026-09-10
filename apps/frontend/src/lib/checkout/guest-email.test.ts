// Checkout has no email field, but Vendure still needs one on the guest
// customer: these helpers build (and recognise) the placeholder derived from
// the phone number. Run: pnpm --filter @oscar/frontend test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { placeholderEmailForPhone, isPlaceholderEmail, PLACEHOLDER_EMAIL_DOMAIN } from '@oscar/shared/guest-email';

test('builds a deterministic address from the phone digits only', () => {
  assert.equal(placeholderEmailForPhone('0555 12-34 56'), `0555123456@${PLACEHOLDER_EMAIL_DOMAIN}`);
  assert.equal(placeholderEmailForPhone('+213 555 123 456'), `213555123456@${PLACEHOLDER_EMAIL_DOMAIN}`);
  assert.equal(placeholderEmailForPhone('0555123456'), placeholderEmailForPhone('05 55 12 34 56'));
});

test('falls back to a fixed local part when the phone has no digits', () => {
  assert.equal(placeholderEmailForPhone(''), `inconnu@${PLACEHOLDER_EMAIL_DOMAIN}`);
});

test('recognises placeholder addresses and nothing else', () => {
  assert.equal(isPlaceholderEmail(placeholderEmailForPhone('0555123456')), true);
  assert.equal(isPlaceholderEmail(`0555123456@${PLACEHOLDER_EMAIL_DOMAIN.toUpperCase()}`), true);
  assert.equal(isPlaceholderEmail('client@gmail.com'), false);
  assert.equal(isPlaceholderEmail(''), false);
  assert.equal(isPlaceholderEmail(null), false);
  assert.equal(isPlaceholderEmail(undefined), false);
});
