import { addRecent, RECENTLY_VIEWED_CAP, type RecentlyViewedEntry } from '../recentlyViewed';

const mk = (productId: string, viewedAt: number): RecentlyViewedEntry => ({
  productId,
  slug: `s-${productId}`,
  name: `P ${productId}`,
  imageUrl: null,
  price: 1000,
  currencyCode: 'DZD',
  viewedAt,
});

describe('addRecent', () => {
  it('adds to an empty list', () => {
    expect(addRecent([], mk('a', 1)).map((e) => e.productId)).toEqual(['a']);
  });

  it('prepends a new product, keeping previous order', () => {
    const list = [mk('a', 2), mk('b', 1)];
    expect(addRecent(list, mk('c', 3)).map((e) => e.productId)).toEqual(['c', 'a', 'b']);
  });

  it('moves a re-viewed product to the front without duplicating', () => {
    const list = [mk('a', 2), mk('b', 1)];
    const out = addRecent(list, mk('b', 3));
    expect(out.map((e) => e.productId)).toEqual(['b', 'a']);
    expect(out).toHaveLength(2);
    expect(out[0].viewedAt).toBe(3);
  });

  it('caps the list to the newest entries', () => {
    let list: RecentlyViewedEntry[] = [];
    for (let i = 0; i < RECENTLY_VIEWED_CAP + 3; i++) list = addRecent(list, mk(`p${i}`, i));
    expect(list).toHaveLength(RECENTLY_VIEWED_CAP);
    expect(list[0].productId).toBe(`p${RECENTLY_VIEWED_CAP + 2}`); // newest first
    expect(list.some((e) => e.productId === 'p0')).toBe(false); // oldest dropped
  });

  it('respects a custom cap', () => {
    const list = [mk('a', 2), mk('b', 1)];
    expect(addRecent(list, mk('c', 3), 2).map((e) => e.productId)).toEqual(['c', 'a']);
  });
});
