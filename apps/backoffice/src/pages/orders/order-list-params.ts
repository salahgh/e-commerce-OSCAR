// Pure rules behind the back-office orders list. The whole view (tab, search,
// filters, sort, page) lives in the URL so that opening an order and coming back
// restores it; this module converts that URL state to and from the Vendure
// `OrderListOptions`. No React, no I/O: unit-tested in order-list-params.test.ts.

import type {
  DateOperators,
  NumberOperators,
  OrderFilterParameter,
  OrderListOptions,
  OrderSortParameter,
  SortOrder,
} from '../../graphql/generated/graphql';

export type OrderTab = 'all' | 'toShip' | 'shipped' | 'delivered' | 'cancelled' | 'carts';
export type OrderSortKey = 'code' | 'customer' | 'wilaya' | 'total' | 'state' | 'date';
export type SortDir = 'asc' | 'desc';

export interface OrderListState {
  tab: OrderTab;
  /** Free-text search: order code or customer last name. */
  q: string;
  /** Canonical French wilaya name, as stored in Order.customFields.wilaya. */
  wilaya: string;
  /** ISO dates (YYYY-MM-DD), inclusive, in the browser's local time. */
  from: string;
  to: string;
  /** Amounts in DZD (not minor units) as typed by the user. */
  min: string;
  max: string;
  sort: OrderSortKey;
  dir: SortDir;
  /** 1-based page number. */
  page: number;
  size: number;
}

export const PAGE_SIZES = [15, 25, 50] as const;

export const DEFAULT_ORDER_LIST_STATE: OrderListState = {
  tab: 'all',
  q: '',
  wilaya: '',
  from: '',
  to: '',
  min: '',
  max: '',
  sort: 'date',
  dir: 'desc',
  page: 1,
  size: 15,
};

export const ORDER_TABS: ReadonlyArray<{ key: OrderTab; label: string }> = [
  { key: 'all', label: 'Toutes' },
  { key: 'toShip', label: 'À expédier' },
  { key: 'shipped', label: 'Expédiées' },
  { key: 'delivered', label: 'Livrées' },
  { key: 'cancelled', label: 'Annulées' },
  { key: 'carts', label: 'Paniers' },
];

/** Vendure order states behind each tab ("all" = every placed order, "carts" = not yet placed). */
export const TAB_STATES: Record<Exclude<OrderTab, 'all' | 'carts'>, string[]> = {
  toShip: ['PaymentAuthorized', 'PaymentSettled'],
  shipped: ['Shipped', 'PartiallyShipped'],
  delivered: ['Delivered', 'PartiallyDelivered'],
  cancelled: ['Cancelled'],
};

export type StateTone = 'neutral' | 'info' | 'success' | 'warning' | 'shipped' | 'danger';

/**
 * French labels for the owner. Cash on delivery lands orders in
 * PaymentAuthorized, so that state reads as "new order" rather than the
 * generic Vendure wording.
 */
export const ORDER_STATE_META: Record<string, { label: string; tone: StateTone }> = {
  AddingItems: { label: 'Panier', tone: 'neutral' },
  ArrangingPayment: { label: 'Paiement en cours', tone: 'neutral' },
  PaymentAuthorized: { label: 'Nouvelle', tone: 'info' },
  PaymentSettled: { label: 'Payée', tone: 'success' },
  PartiallyShipped: { label: 'Part. expédiée', tone: 'warning' },
  Shipped: { label: 'Expédiée', tone: 'shipped' },
  PartiallyDelivered: { label: 'Part. livrée', tone: 'warning' },
  Delivered: { label: 'Livrée', tone: 'success' },
  Modifying: { label: 'Modification', tone: 'warning' },
  ArrangingAdditionalPayment: { label: 'Paiement add.', tone: 'warning' },
  Cancelled: { label: 'Annulée', tone: 'danger' },
};

export function orderStateMeta(state: string): { label: string; tone: StateTone } {
  return ORDER_STATE_META[state] ?? { label: state, tone: 'neutral' };
}

const TAB_KEYS = ORDER_TABS.map((t) => t.key);
const SORT_KEYS: OrderSortKey[] = ['code', 'customer', 'wilaya', 'total', 'state', 'date'];

/** Direction a column starts in when first clicked. */
const NATURAL_DIR: Record<OrderSortKey, SortDir> = {
  code: 'asc',
  customer: 'asc',
  wilaya: 'asc',
  total: 'desc',
  state: 'asc',
  date: 'desc',
};

// ---------------------------------------------------------------------------
// URL <-> state

function oneOf<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(value ?? '') ? (value as T) : fallback;
}

function isoDate(value: string | null): string {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '';
}

function amount(value: string | null): string {
  return value && /^\d+(\.\d+)?$/.test(value) ? value : '';
}

export function parseOrderListParams(params: URLSearchParams): OrderListState {
  const page = Number.parseInt(params.get('page') ?? '', 10);
  const size = Number.parseInt(params.get('size') ?? '', 10);
  return {
    tab: oneOf(params.get('tab'), TAB_KEYS, DEFAULT_ORDER_LIST_STATE.tab),
    q: (params.get('q') ?? '').trim(),
    wilaya: params.get('wilaya') ?? '',
    from: isoDate(params.get('from')),
    to: isoDate(params.get('to')),
    min: amount(params.get('min')),
    max: amount(params.get('max')),
    sort: oneOf(params.get('sort'), SORT_KEYS, DEFAULT_ORDER_LIST_STATE.sort),
    dir: oneOf(params.get('dir'), ['asc', 'desc'] as const, DEFAULT_ORDER_LIST_STATE.dir),
    page: Number.isInteger(page) && page >= 1 ? page : DEFAULT_ORDER_LIST_STATE.page,
    size: (PAGE_SIZES as readonly number[]).includes(size) ? size : DEFAULT_ORDER_LIST_STATE.size,
  };
}

/** Only values that differ from the defaults, so the plain /orders URL stays clean. */
export function serializeOrderListParams(state: OrderListState): URLSearchParams {
  const params = new URLSearchParams();
  (Object.keys(DEFAULT_ORDER_LIST_STATE) as Array<keyof OrderListState>).forEach((key) => {
    const value = state[key];
    if (value !== DEFAULT_ORDER_LIST_STATE[key] && value !== '') params.set(key, String(value));
  });
  return params;
}

// ---------------------------------------------------------------------------
// State -> Vendure list options

type Filter = OrderFilterParameter;

function tabFilter(tab: OrderTab): Filter {
  if (tab === 'all') return { active: { eq: false } };
  if (tab === 'carts') return { active: { eq: true } };
  return { state: { in: TAB_STATES[tab] } };
}

/** Carts have no orderPlacedAt yet, so their date column is the creation date. */
function dateField(tab: OrderTab): 'orderPlacedAt' | 'createdAt' {
  return tab === 'carts' ? 'createdAt' : 'orderPlacedAt';
}

function localDate(iso: string, endOfDay: boolean): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = endOfDay ? new Date(y, m - 1, d, 23, 59, 59, 999) : new Date(y, m - 1, d, 0, 0, 0, 0);
  return date.toISOString();
}

/** Filters shared by the list and by every tab count: everything except the tab itself. */
function commonFilter(state: OrderListState, tab: OrderTab): Filter {
  const filter: Filter = {};
  if (state.wilaya) filter.wilaya = { eq: state.wilaya };
  if (state.from || state.to) {
    const range: DateOperators = {};
    if (state.from) range.after = localDate(state.from, false);
    if (state.to) range.before = localDate(state.to, true);
    filter[dateField(tab)] = range;
  }
  if (state.min || state.max) {
    const range: NumberOperators = {};
    if (state.min) range.gte = Math.round(Number.parseFloat(state.min) * 100);
    if (state.max) range.lte = Math.round(Number.parseFloat(state.max) * 100);
    filter.totalWithTax = range;
  }
  const q = state.q.trim();
  if (q) {
    // Vendure applies one operator to the whole filter object; the nested `_or`
    // keeps the search alternatives together while the rest stays ANDed.
    filter._or = [{ code: { contains: q } }, { customerLastName: { contains: q } }];
  }
  return filter;
}

function sortField(sort: OrderSortKey, tab: OrderTab): keyof OrderSortParameter {
  switch (sort) {
    case 'code':
      return 'code';
    case 'customer':
      return 'customerLastName';
    case 'wilaya':
      return 'wilaya';
    case 'total':
      return 'totalWithTax';
    case 'state':
      return 'state';
    case 'date':
      return dateField(tab);
  }
}

export function buildOrderListOptions(state: OrderListState): OrderListOptions {
  // The generated SortOrder is a string enum whose values are exactly these strings.
  const dir = (state.dir === 'asc' ? 'ASC' : 'DESC') as SortOrder;
  return {
    skip: (state.page - 1) * state.size,
    take: state.size,
    sort: { [sortField(state.sort, state.tab)]: dir },
    filter: { ...tabFilter(state.tab), ...commonFilter(state, state.tab) },
  };
}

/** One cheap query per tab (take: 1, only totalItems is read) for the tab badges. */
export function buildTabCountOptions(state: OrderListState): Record<OrderTab, OrderListOptions> {
  const out = {} as Record<OrderTab, OrderListOptions>;
  for (const { key } of ORDER_TABS) {
    out[key] = { take: 1, filter: { ...tabFilter(key), ...commonFilter(state, key) } };
  }
  return out;
}

export function toggleSort(state: OrderListState, column: OrderSortKey): { sort: OrderSortKey; dir: SortDir } {
  if (state.sort !== column) return { sort: column, dir: NATURAL_DIR[column] };
  return { sort: column, dir: state.dir === 'asc' ? 'desc' : 'asc' };
}

// ---------------------------------------------------------------------------
// Date presets (local time, YYYY-MM-DD)

function ymd(date: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

function daysAgo(now: Date, days: number): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
}

export const DATE_PRESETS: ReadonlyArray<{
  key: string;
  label: string;
  range: (now: Date) => { from: string; to: string };
}> = [
  { key: 'today', label: "Aujourd'hui", range: (now) => ({ from: ymd(now), to: ymd(now) }) },
  { key: 'yesterday', label: 'Hier', range: (now) => ({ from: ymd(daysAgo(now, 1)), to: ymd(daysAgo(now, 1)) }) },
  { key: '7d', label: '7 derniers jours', range: (now) => ({ from: ymd(daysAgo(now, 6)), to: ymd(now) }) },
  { key: '30d', label: '30 derniers jours', range: (now) => ({ from: ymd(daysAgo(now, 29)), to: ymd(now) }) },
  {
    key: 'month',
    label: 'Ce mois',
    range: (now) => ({ from: ymd(new Date(now.getFullYear(), now.getMonth(), 1)), to: ymd(now) }),
  },
  {
    key: 'lastMonth',
    label: 'Mois dernier',
    range: (now) => ({
      from: ymd(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      to: ymd(new Date(now.getFullYear(), now.getMonth(), 0)),
    }),
  },
];
