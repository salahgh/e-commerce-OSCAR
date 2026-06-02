import type { Wilaya } from '../data/wilayas';

/** Form values the checkout address step collects (superset used by the helpers). */
export interface CheckoutAddressValues {
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode?: string;
  notes?: string;
  wilayaCode: string;
  email?: string;
}

export interface ShippingAddressInput {
  fullName: string;
  streetLine1: string;
  streetLine2: string;
  city: string;
  province: string;
  postalCode: string;
  countryCode: string;
  phoneNumber: string;
}

export interface GuestCustomerInput {
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
}

/** Resolve a wilaya code to its display name; fall back to the code if unknown. */
export function resolveWilayaName(wilayaCode: string, wilayas: Wilaya[]): string {
  return wilayas.find((w) => w.code === wilayaCode)?.name ?? wilayaCode;
}

/** Build the Vendure shipping-address input, setting province to the wilaya name. */
export function buildShippingAddressInput(
  values: CheckoutAddressValues,
  wilayas: Wilaya[]
): ShippingAddressInput {
  return {
    fullName: values.fullName,
    streetLine1: values.address,
    streetLine2: values.notes || '',
    city: values.city,
    province: resolveWilayaName(values.wilayaCode, wilayas),
    postalCode: values.postalCode || '',
    countryCode: 'DZ',
    phoneNumber: values.phoneNumber,
  };
}

/** Build the guest setCustomerForOrder input from the real (never fabricated) email. */
export function buildGuestCustomerInput(values: CheckoutAddressValues): GuestCustomerInput {
  const trimmed = values.fullName.trim();
  const spaceIdx = trimmed.indexOf(' ');
  const firstName = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
  const lastName = spaceIdx === -1 ? trimmed : trimmed.slice(spaceIdx + 1);
  return {
    firstName,
    lastName,
    emailAddress: values.email ?? '',
    phoneNumber: values.phoneNumber,
  };
}
