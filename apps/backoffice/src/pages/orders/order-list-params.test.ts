// Pure rules behind the back-office orders list: URL <-> filter state and the
// Vendure list options built from it. Run: pnpm --filter @oscar/backoffice test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_ORDER_LIST_STATE,
  parseOrderListParams,
  serializeOrderListParams,
  buildOrderListOptions,
  buildTabCountOptions,
  toggleSort,
} from './order-list-params';

const parse = (qs: string) => parseOrderListParams(new URLSearchParams(qs));

test('an empty URL is the default view: placed orders, newest first, page 1', () => {
  assert.deepEqual(parse(''), DEFAULT_ORDER_LIST_STATE);
  assert.equal(DEFAULT_ORDER_LIST_STATE.sort, 'date');
  assert.equal(DEFAULT_ORDER_LIST_STATE.dir, 'desc');
  assert.equal(DEFAULT_ORDER_LIST_STATE.tab, 'all');
});

test('parses every supported param and ignores garbage', () => {
  const s = parse('tab=shipped&q=ab12&wilaya=Oran&from=2026-09-01&to=2026-09-10&min=1000&max=5000&sort=total&dir=asc&page=3&size=50');
  assert.equal(s.tab, 'shipped');
  assert.equal(s.q, 'ab12');
  assert.equal(s.wilaya, 'Oran');
  assert.equal(s.from, '2026-09-01');
  assert.equal(s.to, '2026-09-10');
  assert.equal(s.min, '1000');
  assert.equal(s.max, '5000');
  assert.equal(s.sort, 'total');
  assert.equal(s.dir, 'asc');
  assert.equal(s.page, 3);
  assert.equal(s.size, 50);

  const bad = parse('tab=nope&sort=nope&dir=sideways&page=-2&size=7&min=abc');
  assert.equal(bad.tab, 'all');
  assert.equal(bad.sort, 'date');
  assert.equal(bad.dir, 'desc');
  assert.equal(bad.page, 1);
  assert.equal(bad.size, 15);
  assert.equal(bad.min, '');
});

test('serialises only what differs from the defaults, and round-trips', () => {
  assert.equal(serializeOrderListParams(DEFAULT_ORDER_LIST_STATE).toString(), '');
  const s = { ...DEFAULT_ORDER_LIST_STATE, tab: 'toShip' as const, q: 'ali', page: 2 };
  const qs = serializeOrderListParams(s).toString();
  assert.equal(qs, 'tab=toShip&q=ali&page=2');
  assert.deepEqual(parse(qs), s);
});

test('default options: placed orders only, newest first, first page of 15', () => {
  const o = buildOrderListOptions(DEFAULT_ORDER_LIST_STATE);
  assert.equal(o.skip, 0);
  assert.equal(o.take, 15);
  assert.deepEqual(o.sort, { orderPlacedAt: 'DESC' });
  assert.deepEqual(o.filter, { active: { eq: false } });
});

test('tabs map to order states; carts are the active orders sorted by creation', () => {
  assert.deepEqual(buildOrderListOptions({ ...DEFAULT_ORDER_LIST_STATE, tab: 'toShip' }).filter, {
    state: { in: ['PaymentAuthorized', 'PaymentSettled'] },
  });
  assert.deepEqual(buildOrderListOptions({ ...DEFAULT_ORDER_LIST_STATE, tab: 'cancelled' }).filter, {
    state: { in: ['Cancelled'] },
  });
  const carts = buildOrderListOptions({ ...DEFAULT_ORDER_LIST_STATE, tab: 'carts' });
  assert.deepEqual(carts.filter, { active: { eq: true } });
  assert.deepEqual(carts.sort, { createdAt: 'DESC' });
});

test('search matches code OR customer last name while other filters stay ANDed', () => {
  const o = buildOrderListOptions({ ...DEFAULT_ORDER_LIST_STATE, q: ' ali ', wilaya: 'Oran' });
  assert.deepEqual(o.filter, {
    active: { eq: false },
    wilaya: { eq: 'Oran' },
    _or: [{ code: { contains: 'ali' } }, { customerLastName: { contains: 'ali' } }],
  });
});

test('date range covers whole local days; amounts are sent in minor units', () => {
  const o = buildOrderListOptions({ ...DEFAULT_ORDER_LIST_STATE, from: '2026-09-01', to: '2026-09-10', min: '1500', max: '' });
  const f = o.filter;
  assert.equal(f.orderPlacedAt.after, new Date(2026, 8, 1, 0, 0, 0, 0).toISOString());
  assert.equal(f.orderPlacedAt.before, new Date(2026, 8, 10, 23, 59, 59, 999).toISOString());
  assert.deepEqual(f.totalWithTax, { gte: 150000 });
});

test('pagination and column sorts', () => {
  const o = buildOrderListOptions({ ...DEFAULT_ORDER_LIST_STATE, page: 3, size: 25, sort: 'customer', dir: 'asc' });
  assert.equal(o.skip, 50);
  assert.equal(o.take, 25);
  assert.deepEqual(o.sort, { customerLastName: 'ASC' });
});

test('tab counts share the search/wilaya/date filters but not the current tab', () => {
  const counts = buildTabCountOptions({ ...DEFAULT_ORDER_LIST_STATE, tab: 'shipped', wilaya: 'Alger', page: 4 });
  assert.deepEqual(Object.keys(counts), ['all', 'toShip', 'shipped', 'delivered', 'cancelled', 'carts']);
  assert.deepEqual(counts.all, { take: 1, filter: { active: { eq: false }, wilaya: { eq: 'Alger' } } });
  assert.deepEqual(counts.delivered.filter, { state: { in: ['Delivered', 'PartiallyDelivered'] }, wilaya: { eq: 'Alger' } });
  assert.deepEqual(counts.carts.filter, { active: { eq: true }, wilaya: { eq: 'Alger' } });
});

test('clicking a column header: new column gets its natural direction, same column flips', () => {
  assert.deepEqual(toggleSort(DEFAULT_ORDER_LIST_STATE, 'total'), { sort: 'total', dir: 'desc' });
  assert.deepEqual(toggleSort(DEFAULT_ORDER_LIST_STATE, 'customer'), { sort: 'customer', dir: 'asc' });
  assert.deepEqual(toggleSort(DEFAULT_ORDER_LIST_STATE, 'date'), { sort: 'date', dir: 'asc' });
  assert.deepEqual(toggleSort({ ...DEFAULT_ORDER_LIST_STATE, sort: 'date', dir: 'asc' }, 'date'), { sort: 'date', dir: 'desc' });
});
