import {
  resolveWilayaCode,
  buildCreateAddressInput,
  buildUpdateAddressInput,
  addressToFormValues,
  addressToCheckoutValues,
} from '../address';
import type { Wilaya } from '../../data/wilayas';

const WILAYAS = [
  { code: '16', name: 'Alger', nameAr: '', shippingZone: 1, communes: [] },
  { code: '31', name: 'Oran', nameAr: '', shippingZone: 2, communes: [] },
] as unknown as Wilaya[];

const FORM = {
  fullName: 'Sara Ben Ali',
  phoneNumber: '0551234567',
  streetLine1: '12 Rue Didouche',
  streetLine2: 'Apt 4',
  city: 'Alger Centre',
  wilayaCode: '16',
  postalCode: '16000',
  defaultShippingAddress: true,
};

const SAVED = {
  id: 'addr1',
  fullName: 'Sara Ben Ali',
  streetLine1: '12 Rue Didouche',
  streetLine2: 'Apt 4',
  city: 'Alger Centre',
  province: 'Alger',
  postalCode: '16000',
  phoneNumber: '0551234567',
  defaultShippingAddress: true,
};

describe('resolveWilayaCode', () => {
  it('maps a province name back to its wilaya code', () => {
    expect(resolveWilayaCode('Alger', WILAYAS)).toBe('16');
  });
  it('returns empty string for an unknown province', () => {
    expect(resolveWilayaCode('Nowhere', WILAYAS)).toBe('');
  });
});

describe('buildCreateAddressInput', () => {
  it('builds a CreateAddressInput with province=name, countryCode DZ, default flag', () => {
    expect(buildCreateAddressInput(FORM, WILAYAS)).toEqual({
      fullName: 'Sara Ben Ali',
      streetLine1: '12 Rue Didouche',
      streetLine2: 'Apt 4',
      city: 'Alger Centre',
      province: 'Alger',
      postalCode: '16000',
      countryCode: 'DZ',
      phoneNumber: '0551234567',
      defaultShippingAddress: true,
    });
  });
  it('maps empty optional streetLine2/postalCode to undefined', () => {
    const out = buildCreateAddressInput({ ...FORM, streetLine2: '', postalCode: '' }, WILAYAS);
    expect(out.streetLine2).toBeUndefined();
    expect(out.postalCode).toBeUndefined();
  });
});

describe('buildUpdateAddressInput', () => {
  it('includes the id plus the same mapping', () => {
    const out = buildUpdateAddressInput('addr1', FORM, WILAYAS);
    expect(out.id).toBe('addr1');
    expect(out.province).toBe('Alger');
    expect(out.countryCode).toBe('DZ');
  });
});

describe('addressToFormValues', () => {
  it('round-trips a saved address into form values (province name -> code, default flag)', () => {
    expect(addressToFormValues(SAVED, WILAYAS)).toEqual({
      fullName: 'Sara Ben Ali',
      phoneNumber: '0551234567',
      streetLine1: '12 Rue Didouche',
      streetLine2: 'Apt 4',
      city: 'Alger Centre',
      wilayaCode: '16',
      postalCode: '16000',
      defaultShippingAddress: true,
    });
  });
});

describe('addressToCheckoutValues', () => {
  it('maps a saved address to checkout form fields (streetLine1->address, streetLine2->notes)', () => {
    expect(addressToCheckoutValues(SAVED, WILAYAS)).toEqual({
      fullName: 'Sara Ben Ali',
      phoneNumber: '0551234567',
      address: '12 Rue Didouche',
      notes: 'Apt 4',
      city: 'Alger Centre',
      wilayaCode: '16',
      postalCode: '16000',
    });
  });
});
