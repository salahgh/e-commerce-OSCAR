import type { Wilaya } from '../types/delivery';
import { resolveWilayaName } from './checkout';

export interface AddressFormValues {
  fullName: string;
  phoneNumber: string;
  streetLine1: string;
  wilayaCode: string;
  communeCode: string;
  defaultShippingAddress: boolean;
}

export interface CreateAddressInputShape {
  fullName: string;
  streetLine1: string;
  city: string;
  province: string;
  postalCode?: string;
  countryCode: string;
  phoneNumber: string;
  defaultShippingAddress: boolean;
  /** Destination codes; they survive a rename of the wilaya in the back-office. */
  customFields: { wilayaCode: string; communeCode: string | null };
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
  customFields?: { wilayaCode?: string | null; communeCode?: string | null } | null;
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

/**
 * Reverse-resolve a saved `city` to a commune code within the already-resolved wilaya.
 * Matches the commune's French `name` OR Arabic `nameAr`, case-insensitively and trimmed,
 * so addresses saved with either language (or casing variance) still re-select the commune.
 */
export function resolveCommuneCode(
  wilayaCode: string,
  city: string,
  wilayas: Wilaya[]
): string {
  const needle = city.trim().toLowerCase();
  if (!wilayaCode || !needle) return '';
  const wilaya = wilayas.find((w) => w.code === wilayaCode);
  if (!wilaya) return '';
  return (
    wilaya.communes.find((c) => {
      const name = c.name.trim().toLowerCase();
      const nameAr = (c.nameAr ?? '').trim().toLowerCase();
      return name === needle || (nameAr !== '' && nameAr === needle);
    })?.code ?? ''
  );
}

export function buildCreateAddressInput(values: AddressFormValues, wilayas: Wilaya[]): CreateAddressInputShape {
  const wilaya = wilayas.find((w) => w.code === values.wilayaCode);
  const commune = wilaya?.communes.find((c) => c.code === values.communeCode);
  return {
    fullName: values.fullName,
    streetLine1: values.streetLine1,
    city: commune?.name ?? '',
    province: resolveWilayaName(values.wilayaCode, wilayas),
    postalCode: commune?.postalCode || undefined,
    countryCode: 'DZ',
    phoneNumber: values.phoneNumber,
    defaultShippingAddress: values.defaultShippingAddress,
    customFields: { wilayaCode: values.wilayaCode, communeCode: values.communeCode || null },
  };
}

export function buildUpdateAddressInput(id: string, values: AddressFormValues, wilayas: Wilaya[]) {
  return { id, ...buildCreateAddressInput(values, wilayas) };
}

/**
 * Codes of a saved address: the stored custom-field codes when they still match
 * an offered destination, else the names resolved against the current list.
 */
export function resolveSavedCodes(a: SavedAddress, wilayas: Wilaya[]): { wilayaCode: string; communeCode: string } {
  const storedWilaya = a.customFields?.wilayaCode ?? '';
  const wilaya = wilayas.find((w) => w.code === storedWilaya);
  if (wilaya) {
    const storedCommune = a.customFields?.communeCode ?? '';
    const commune = wilaya.communes.find((c) => c.code === storedCommune);
    return {
      wilayaCode: wilaya.code,
      communeCode: commune ? commune.code : resolveCommuneCode(wilaya.code, a.city ?? '', wilayas),
    };
  }
  const wilayaCode = resolveWilayaCode(a.province ?? '', wilayas);
  return { wilayaCode, communeCode: resolveCommuneCode(wilayaCode, a.city ?? '', wilayas) };
}

export function addressToFormValues(a: SavedAddress, wilayas: Wilaya[]): AddressFormValues {
  const { wilayaCode, communeCode } = resolveSavedCodes(a, wilayas);
  return {
    fullName: a.fullName ?? '',
    phoneNumber: a.phoneNumber ?? '',
    streetLine1: a.streetLine1 ?? '',
    wilayaCode,
    communeCode,
    defaultShippingAddress: !!a.defaultShippingAddress,
  };
}

/** Map a saved address to the checkout ShippingAddressForm field names (no email). */
export function addressToCheckoutValues(a: SavedAddress, wilayas: Wilaya[]) {
  const { wilayaCode, communeCode } = resolveSavedCodes(a, wilayas);
  return {
    fullName: a.fullName ?? '',
    phoneNumber: a.phoneNumber ?? '',
    address: a.streetLine1 ?? '',
    notes: a.streetLine2 ?? '',
    wilayaCode,
    communeCode,
  };
}
