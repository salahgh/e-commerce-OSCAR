import {
  getPaymentAvailability,
  isSelectableMethod,
  partitionPaymentMethods,
  COMING_SOON_PAYMENTS,
} from '../payment';

describe('getPaymentAvailability', () => {
  it('marks cash-on-delivery and unknown codes as available', () => {
    expect(getPaymentAvailability('cash-on-delivery')).toBe('available');
    expect(getPaymentAvailability('stripe')).toBe('available');
  });

  it('marks cib and baridimob as coming-soon (case-insensitive)', () => {
    expect(getPaymentAvailability('cib')).toBe('coming-soon');
    expect(getPaymentAvailability('CIB')).toBe('coming-soon');
    expect(getPaymentAvailability('baridimob')).toBe('coming-soon');
  });
});

describe('isSelectableMethod', () => {
  it('is true only for an eligible, available method', () => {
    expect(isSelectableMethod({ code: 'cash-on-delivery', isEligible: true })).toBe(true);
    expect(isSelectableMethod({ code: 'cash-on-delivery', isEligible: false })).toBe(false);
    expect(isSelectableMethod({ code: 'cib', isEligible: true })).toBe(false);
  });
});

describe('partitionPaymentMethods', () => {
  const cod = { code: 'cash-on-delivery', isEligible: true };
  const cib = { code: 'cib', isEligible: true };
  const baridimob = { code: 'baridimob', isEligible: true };

  it('keeps available methods and always lists the 2-entry coming-soon catalog', () => {
    const { available, comingSoon } = partitionPaymentMethods([cod, cib, baridimob]);
    expect(available).toEqual([cod]);
    expect(comingSoon).toBe(COMING_SOON_PAYMENTS);
    expect(comingSoon.map((c) => c.code)).toEqual(['cib', 'baridimob']);
  });

  it('still shows the coming-soon catalog when the backend returns only COD', () => {
    const { available, comingSoon } = partitionPaymentMethods([cod]);
    expect(available).toEqual([cod]);
    expect(comingSoon.map((c) => c.code)).toEqual(['cib', 'baridimob']);
  });

  it('returns no available methods (but still the catalog) for an empty list', () => {
    const { available, comingSoon } = partitionPaymentMethods([]);
    expect(available).toEqual([]);
    expect(comingSoon).toHaveLength(2);
  });
});
