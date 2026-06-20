import {
  resolveWilayaCode,
  resolveCommuneCode,
  buildCreateAddressInput,
  buildUpdateAddressInput,
  addressToFormValues,
  addressToCheckoutValues,
} from '../address';
import type { Wilaya } from '../../data/wilayas';

const WILAYAS = [
  {
    code: '16',
    name: 'Alger',
    nameAr: 'الجزائر',
    shippingZone: 1,
    communes: [
      { code: '1601', name: 'Alger Centre', nameAr: 'الجزائر الوسطى', postalCode: '16000' },
      { code: '1602', name: 'Bab El Oued', nameAr: 'باب الوادي', postalCode: '16002' },
    ],
  },
  { code: '31', name: 'Oran', nameAr: 'وهران', shippingZone: 2, communes: [] },
] as unknown as Wilaya[];

const FORM = {
  fullName: 'Sara Ben Ali',
  phoneNumber: '0551234567',
  streetLine1: '12 Rue Didouche',
  wilayaCode: '16',
  communeCode: '1601',
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
  it('matches the Arabic wilaya name (non-app-created addresses)', () => {
    expect(resolveWilayaCode('الجزائر', WILAYAS)).toBe('16');
  });
  it('matches case-insensitively and trims surrounding whitespace', () => {
    expect(resolveWilayaCode('  alger ', WILAYAS)).toBe('16');
  });
  it('returns empty string for a blank province', () => {
    expect(resolveWilayaCode('   ', WILAYAS)).toBe('');
  });
});

describe('resolveCommuneCode', () => {
  it('maps a city (commune name) back to its commune code within the wilaya', () => {
    expect(resolveCommuneCode('16', 'Alger Centre', WILAYAS)).toBe('1601');
  });
  it('matches the Arabic commune name', () => {
    expect(resolveCommuneCode('16', 'باب الوادي', WILAYAS)).toBe('1602');
  });
  it('matches case-insensitively and trims surrounding whitespace', () => {
    expect(resolveCommuneCode('16', '  alger centre ', WILAYAS)).toBe('1601');
  });
  it('returns empty string for an unknown commune', () => {
    expect(resolveCommuneCode('16', 'Nowhere', WILAYAS)).toBe('');
  });
  it('returns empty string when the wilaya code is blank', () => {
    expect(resolveCommuneCode('', 'Alger Centre', WILAYAS)).toBe('');
  });
});

describe('buildCreateAddressInput', () => {
  it('derives city + postalCode from the commune; province=name, countryCode DZ, default flag', () => {
    expect(buildCreateAddressInput(FORM, WILAYAS)).toEqual({
      fullName: 'Sara Ben Ali',
      streetLine1: '12 Rue Didouche',
      city: 'Alger Centre',
      province: 'Alger',
      postalCode: '16000',
      countryCode: 'DZ',
      phoneNumber: '0551234567',
      defaultShippingAddress: true,
    });
  });
  it('yields empty city and undefined postalCode for an unknown commune', () => {
    const out = buildCreateAddressInput({ ...FORM, communeCode: 'XXXX' }, WILAYAS);
    expect(out.city).toBe('');
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
  it('round-trips a saved address into form values (province -> code, city -> communeCode)', () => {
    expect(addressToFormValues(SAVED, WILAYAS)).toEqual({
      fullName: 'Sara Ben Ali',
      phoneNumber: '0551234567',
      streetLine1: '12 Rue Didouche',
      wilayaCode: '16',
      communeCode: '1601',
      defaultShippingAddress: true,
    });
  });
  it('yields an empty wilayaCode when the saved province is not a known wilaya', () => {
    expect(addressToFormValues({ ...SAVED, province: 'Unknown Place' }, WILAYAS).wilayaCode).toBe('');
  });
});

describe('addressToCheckoutValues', () => {
  it('maps a saved address to checkout form fields (streetLine1->address, city->communeCode)', () => {
    expect(addressToCheckoutValues(SAVED, WILAYAS)).toEqual({
      fullName: 'Sara Ben Ali',
      phoneNumber: '0551234567',
      address: '12 Rue Didouche',
      notes: 'Apt 4',
      wilayaCode: '16',
      communeCode: '1601',
    });
  });
  it('yields an empty wilayaCode for an unknown province', () => {
    expect(addressToCheckoutValues({ ...SAVED, province: 'Unknown Place' }, WILAYAS).wilayaCode).toBe('');
  });
});
