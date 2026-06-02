import {
  resolveWilayaName,
  buildShippingAddressInput,
  buildGuestCustomerInput,
  submitCheckoutAddress,
  STALE_SESSION_ERROR,
} from '../checkout';
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

describe('submitCheckoutAddress', () => {
  const okOrder = { __typename: 'Order' };

  function makeDeps(overrides: Record<string, unknown> = {}) {
    return {
      values: VALUES,
      isAuthenticated: false,
      wilayas: WILAYAS,
      setCustomer: jest.fn().mockResolvedValue(okOrder),
      setShippingAddress: jest.fn().mockResolvedValue(okOrder),
      ...overrides,
    } as Parameters<typeof submitCheckoutAddress>[0] & {
      setCustomer: jest.Mock;
      setShippingAddress: jest.Mock;
    };
  }

  it('guest: attaches the customer with the real email, then sets the shipping address', async () => {
    const deps = makeDeps();
    await submitCheckoutAddress(deps);
    expect(deps.setCustomer).toHaveBeenCalledTimes(1);
    expect(deps.setCustomer).toHaveBeenCalledWith(
      expect.objectContaining({ emailAddress: 'sara@example.com', firstName: 'Sara', lastName: 'Ben Ali' })
    );
    expect(deps.setShippingAddress).toHaveBeenCalledWith(
      expect.objectContaining({ province: 'Alger', countryCode: 'DZ' })
    );
  });

  it('authenticated: does NOT attach a customer, only sets the shipping address', async () => {
    const deps = makeDeps({ isAuthenticated: true });
    await submitCheckoutAddress(deps);
    expect(deps.setCustomer).not.toHaveBeenCalled();
    expect(deps.setShippingAddress).toHaveBeenCalledTimes(1);
  });

  it('throws STALE_SESSION on AlreadyLoggedInError and never sets the address', async () => {
    const deps = makeDeps({
      setCustomer: jest.fn().mockResolvedValue({
        __typename: 'AlreadyLoggedInError',
        errorCode: 'ALREADY_LOGGED_IN_ERROR',
        message: 'already logged in',
      }),
    });
    await expect(submitCheckoutAddress(deps)).rejects.toThrow(STALE_SESSION_ERROR);
    expect(deps.setShippingAddress).not.toHaveBeenCalled();
  });

  it('throws the GraphQL message on other customer errors', async () => {
    const deps = makeDeps({
      setCustomer: jest.fn().mockResolvedValue({
        __typename: 'GuestCheckoutError',
        errorCode: 'GUEST_CHECKOUT_ERROR',
        message: 'boom',
      }),
    });
    await expect(submitCheckoutAddress(deps)).rejects.toThrow('boom');
    expect(deps.setShippingAddress).not.toHaveBeenCalled();
  });

  it('throws when setting the shipping address errors', async () => {
    const deps = makeDeps({
      setShippingAddress: jest.fn().mockResolvedValue({
        __typename: 'NoActiveOrderError',
        errorCode: 'NO_ACTIVE_ORDER_ERROR',
        message: 'no order',
      }),
    });
    await expect(submitCheckoutAddress(deps)).rejects.toThrow('no order');
  });
});
