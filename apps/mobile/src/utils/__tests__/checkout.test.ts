import { resolveWilayaName, buildShippingAddressInput, buildGuestCustomerInput } from '../checkout';
import type { Wilaya } from '../../data/wilayas';

const WILAYAS = [
  { code: '16', name: 'Alger', nameAr: '', shippingZone: 1, communes: [] },
  { code: '31', name: 'Oran', nameAr: '', shippingZone: 2, communes: [] },
] as unknown as Wilaya[];

const VALUES = {
  fullName: 'Sara Ben Ali',
  phoneNumber: '0551234567',
  address: '12 Rue Didouche',
  city: 'Alger Centre',
  postalCode: '16000',
  notes: 'Ring twice',
  wilayaCode: '16',
  email: 'sara@example.com',
};

describe('resolveWilayaName', () => {
  it('resolves a wilaya code to its name', () => {
    expect(resolveWilayaName('16', WILAYAS)).toBe('Alger');
  });
  it('falls back to the code when not found', () => {
    expect(resolveWilayaName('99', WILAYAS)).toBe('99');
  });
});

describe('buildShippingAddressInput', () => {
  it('maps form values to a Vendure shipping address with province = wilaya name', () => {
    expect(buildShippingAddressInput(VALUES, WILAYAS)).toEqual({
      fullName: 'Sara Ben Ali',
      streetLine1: '12 Rue Didouche',
      streetLine2: 'Ring twice',
      city: 'Alger Centre',
      province: 'Alger',
      postalCode: '16000',
      countryCode: 'DZ',
      phoneNumber: '0551234567',
    });
  });
  it('never emits an empty province for a known wilaya', () => {
    expect(buildShippingAddressInput(VALUES, WILAYAS).province).not.toBe('');
  });
  it('defaults optional streetLine2/postalCode to empty strings', () => {
    const v = { ...VALUES, notes: undefined, postalCode: undefined };
    const out = buildShippingAddressInput(v, WILAYAS);
    expect(out.streetLine2).toBe('');
    expect(out.postalCode).toBe('');
  });
});

describe('buildGuestCustomerInput', () => {
  it('splits the name on the first space', () => {
    const out = buildGuestCustomerInput(VALUES);
    expect(out.firstName).toBe('Sara');
    expect(out.lastName).toBe('Ben Ali');
  });
  it('uses the whole name for both parts when there is no space', () => {
    const out = buildGuestCustomerInput({ ...VALUES, fullName: 'Sara' });
    expect(out.firstName).toBe('Sara');
    expect(out.lastName).toBe('Sara');
  });
  it('uses the real email verbatim and never fabricates a guest address', () => {
    const out = buildGuestCustomerInput(VALUES);
    expect(out.emailAddress).toBe('sara@example.com');
    expect(out.emailAddress).not.toMatch(/guest_/);
  });
});
