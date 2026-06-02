import { formatPrice, mapVendureOrderState } from '../vendureAdapters';

describe('formatPrice', () => {
  it('converts Vendure cents to whole DZD', () => {
    expect(formatPrice(150000)).toBe(1500);
  });

  it('rounds to the nearest dinar', () => {
    expect(formatPrice(150050)).toBe(1501); // 1500.5 -> 1501
    expect(formatPrice(150040)).toBe(1500); // 1500.4 -> 1500
  });

  it('handles zero', () => {
    expect(formatPrice(0)).toBe(0);
  });
});

describe('mapVendureOrderState', () => {
  it('maps known Vendure states to app states', () => {
    expect(mapVendureOrderState('PaymentSettled')).toBe('PAID');
    expect(mapVendureOrderState('Shipped')).toBe('SHIPPED');
    expect(mapVendureOrderState('Delivered')).toBe('DELIVERED');
    expect(mapVendureOrderState('Cancelled')).toBe('CANCELLED');
  });

  it('passes through unknown states unchanged', () => {
    expect(mapVendureOrderState('SomethingNew')).toBe('SomethingNew');
  });
});
