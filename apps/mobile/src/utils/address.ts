import type { Wilaya } from '../data/wilayas';
import { resolveWilayaName } from './checkout';

export interface AddressFormValues {
  fullName: string;
  phoneNumber: string;
  streetLine1: string;
  streetLine2?: string;
  city: string;
  wilayaCode: string;
  postalCode?: string;
  defaultShippingAddress: boolean;
}

export interface CreateAddressInputShape {
  fullName: string;
  streetLine1: string;
  streetLine2?: string;
  city: string;
  province: string;
  postalCode?: string;
  countryCode: string;
  phoneNumber: string;
  defaultShippingAddress: boolean;
}

/** A saved address (subset of ActiveCustomer.addresses) the helpers consume. */
export interface SavedAddress {
  id: string;
  fullName?: string | null;
  streetLine1: string;
  streetLine2?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  phoneNumber?: string | null;
  defaultShippingAddress?: boolean | null;
}

/**
 * Reverse of resolveWilayaName: province display name -> wilaya code ('' if unknown).
 * Matches the French `name` OR Arabic `nameAr`, case-insensitively and trimmed, so a
 * non-app-created address (e.g. saved via the web with the Arabic province, or with
 * casing/whitespace variance) still resolves its wilaya instead of dropping the selection.
 */
export function resolveWilayaCode(provinceName: string, wilayas: Wilaya[]): string {
  const needle = provinceName.trim().toLowerCase();
  if (!needle) return '';
  return (
    wilayas.find((w) => {
      const name = w.name.trim().toLowerCase();
      const nameAr = (w.nameAr ?? '').trim().toLowerCase();
      return name === needle || (nameAr !== '' && nameAr === needle);
    })?.code ?? ''
  );
}

export function buildCreateAddressInput(values: AddressFormValues, wilayas: Wilaya[]): CreateAddressInputShape {
  return {
    fullName: values.fullName,
    streetLine1: values.streetLine1,
    streetLine2: values.streetLine2 || undefined,
    city: values.city,
    province: resolveWilayaName(values.wilayaCode, wilayas),
    postalCode: values.postalCode || undefined,
    countryCode: 'DZ',
    phoneNumber: values.phoneNumber,
    defaultShippingAddress: values.defaultShippingAddress,
  };
}

export function buildUpdateAddressInput(id: string, values: AddressFormValues, wilayas: Wilaya[]) {
  return { id, ...buildCreateAddressInput(values, wilayas) };
}

export function addressToFormValues(a: SavedAddress, wilayas: Wilaya[]): AddressFormValues {
  return {
    fullName: a.fullName ?? '',
    phoneNumber: a.phoneNumber ?? '',
    streetLine1: a.streetLine1 ?? '',
    streetLine2: a.streetLine2 ?? '',
    city: a.city ?? '',
    wilayaCode: resolveWilayaCode(a.province ?? '', wilayas),
    postalCode: a.postalCode ?? '',
    defaultShippingAddress: !!a.defaultShippingAddress,
  };
}

/** Map a saved address to the checkout ShippingAddressForm field names (no email). */
export function addressToCheckoutValues(a: SavedAddress, wilayas: Wilaya[]) {
  return {
    fullName: a.fullName ?? '',
    phoneNumber: a.phoneNumber ?? '',
    address: a.streetLine1 ?? '',
    notes: a.streetLine2 ?? '',
    city: a.city ?? '',
    wilayaCode: resolveWilayaCode(a.province ?? '', wilayas),
    postalCode: a.postalCode ?? '',
  };
}
