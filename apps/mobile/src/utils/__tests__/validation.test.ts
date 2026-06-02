import { loginSchema, validationRules } from '../validation';
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
