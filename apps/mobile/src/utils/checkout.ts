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

/** Thrown by submitCheckoutAddress when Vendure reports the session is already logged in. */
export const STALE_SESSION_ERROR = 'STALE_SESSION';

/** Minimal shape of a Vendure union result (Order on success, ErrorResult variants on failure). */
interface OrderResultLike {
  __typename?: string;
  errorCode?: string;
  message?: string;
}

export interface SubmitCheckoutAddressDeps {
  values: CheckoutAddressValues;
  isAuthenticated: boolean;
  wilayas: Wilaya[];
  /** Attach a guest customer; resolves to the setCustomerForOrder union (or null). */
  setCustomer: (input: GuestCustomerInput) => Promise<OrderResultLike | null | undefined>;
  /** Set the order shipping address; resolves to the setOrderShippingAddress union (or null). */
  setShippingAddress: (input: ShippingAddressInput) => Promise<OrderResultLike | null | undefined>;
}

/**
 * Orchestrate the checkout address submit:
 * - Guests: attach the customer (real email) first, then set the shipping address.
 * - Authenticated: skip setCustomer; only set the shipping address.
 * Throws Error(STALE_SESSION_ERROR) on AlreadyLoggedInError, or Error(message) on any
 * other GraphQL error result. Resolves to void on success.
 */
export async function submitCheckoutAddress({
  values,
  isAuthenticated,
  wilayas,
  setCustomer,
  setShippingAddress,
}: SubmitCheckoutAddressDeps): Promise<void> {
  if (!isAuthenticated) {
    const customerResp = await setCustomer(buildGuestCustomerInput(values));
    if (customerResp && 'errorCode' in customerResp) {
      if (customerResp.__typename === 'AlreadyLoggedInError') {
        throw new Error(STALE_SESSION_ERROR);
      }
      throw new Error(customerResp.message || 'Failed to set customer for order');
    }
  }

  const shipResp = await setShippingAddress(buildShippingAddressInput(values, wilayas));
  if (shipResp && 'errorCode' in shipResp) {
    throw new Error(shipResp.message || 'Failed to set shipping address');
  }
}
