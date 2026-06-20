import { loginSchema, validationRules, makeShippingAddressSchema, addressFormSchema } from '../validation';
import * as Yup from 'yup';

describe('loginSchema', () => {
  it('accepts a valid email + password', async () => {
    await expect(
      loginSchema.validate({ email: 'user@example.com', password: 'secret1' })
    ).resolves.toBeTruthy();
  });

  it('rejects an invalid email', async () => {
    await expect(
      loginSchema.validate({ email: 'not-an-email', password: 'secret1' })
    ).rejects.toBeInstanceOf(Yup.ValidationError);
  });

  it('rejects a too-short password', async () => {
    await expect(
      loginSchema.validate({ email: 'user@example.com', password: '123' })
    ).rejects.toBeInstanceOf(Yup.ValidationError);
  });
});

describe('validationRules.phone', () => {
  it('accepts exactly 10 digits', async () => {
    await expect(validationRules.phone.validate('0551234567')).resolves.toBe('0551234567');
  });

  it('rejects non-10-digit input', async () => {
    await expect(validationRules.phone.validate('12345')).rejects.toBeInstanceOf(Yup.ValidationError);
  });
});

describe('makeShippingAddressSchema', () => {
  const base = {
    fullName: 'Sara Ben Ali',
    phoneNumber: '0551234567',
    address: '12 Rue Didouche',
    wilayaCode: '16',
    communeCode: '1601',
  };

  it('requires wilayaCode', async () => {
    await expect(
      makeShippingAddressSchema(false).validate({ ...base, wilayaCode: '' })
    ).rejects.toBeInstanceOf(Yup.ValidationError);
  });

  it('requires communeCode', async () => {
    await expect(
      makeShippingAddressSchema(false).validate({ ...base, communeCode: '' })
    ).rejects.toBeInstanceOf(Yup.ValidationError);
  });

  it('accepts a valid guest payload (with email) when includeEmail=true', async () => {
    await expect(
      makeShippingAddressSchema(true).validate({ ...base, email: 'sara@example.com' })
    ).resolves.toBeTruthy();
  });

  it('rejects an invalid email format when includeEmail=true', async () => {
    await expect(
      makeShippingAddressSchema(true).validate({ ...base, email: 'nope' })
    ).rejects.toBeInstanceOf(Yup.ValidationError);
  });

  it('rejects an empty/omitted email when includeEmail=true', async () => {
    await expect(
      makeShippingAddressSchema(true).validate({ ...base, email: '' })
    ).rejects.toBeInstanceOf(Yup.ValidationError);
  });

  it('does not require email when includeEmail=false', async () => {
    await expect(makeShippingAddressSchema(false).validate(base)).resolves.toBeTruthy();
  });
});

describe('addressFormSchema', () => {
  const base = {
    fullName: 'Sara Ben Ali',
    phoneNumber: '0551234567',
    streetLine1: '12 Rue Didouche',
    wilayaCode: '16',
    communeCode: '1601',
    defaultShippingAddress: false,
  };
  it('accepts a valid address', async () => {
    await expect(addressFormSchema.validate(base)).resolves.toBeTruthy();
  });
  it('requires wilayaCode', async () => {
    await expect(addressFormSchema.validate({ ...base, wilayaCode: '' })).rejects.toBeInstanceOf(Yup.ValidationError);
  });
  it('requires communeCode', async () => {
    await expect(addressFormSchema.validate({ ...base, communeCode: '' })).rejects.toBeInstanceOf(Yup.ValidationError);
  });
});
