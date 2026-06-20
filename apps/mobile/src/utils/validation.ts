import * as Yup from 'yup';
import i18n from '../i18n';

// Resolve a validation message through i18n at *validation time* (not schema-build time),
// so messages follow the active language and react to language changes. Yup accepts a
// function for every message slot and calls it lazily when an error is produced.
const tr = (key: string, opts?: Record<string, unknown>): string => i18n.t(key, opts) as string;

// Single source of truth for Algerian mobile numbers (mobile prefixes 5/6/7).
export const ALGERIAN_PHONE_REGEX = /^(?:\+213|0)[5-7]\d{8}$/;

/**
 * Normalize user-entered Algerian phone input to the canonical `0XXXXXXXXX` form.
 * Strips spaces/dots/dashes/parens, then — when only the 9-digit national part was
 * captured (UI shows a separate `+213` prefix) — restores the leading `0` so a
 * single regex validates every entry form (register, checkout, address book…).
 */
export const normalizeAlgerianPhone = (v: unknown): unknown => {
  if (typeof v !== 'string') return v;
  const s = v.replace(/[\s.\-()]/g, '');
  return /^[5-7]\d{8}$/.test(s) ? `0${s}` : s;
};

// Common validation rules
export const validationRules = {
  email: Yup.string()
    .email(() => tr('validation.emailInvalid'))
    .required(() => tr('validation.emailRequired'))
    .trim()
    .lowercase(),

  password: Yup.string()
    .min(6, ({ min }) => tr('validation.passwordMin', { n: min }))
    .required(() => tr('validation.passwordRequired')),

  confirmPassword: (fieldName: string = 'password') =>
    Yup.string()
      .oneOf([Yup.ref(fieldName)], () => tr('validation.confirmPasswordMatch'))
      .required(() => tr('validation.confirmPasswordRequired')),

  firstName: Yup.string()
    .min(2, ({ min }) => tr('validation.firstNameMin', { n: min }))
    .required(() => tr('validation.firstNameRequired'))
    .trim(),

  lastName: Yup.string()
    .min(2, ({ min }) => tr('validation.lastNameMin', { n: min }))
    .required(() => tr('validation.lastNameRequired'))
    .trim(),

  // Algerian phone number: mobile 0[5-7]XXXXXXXX or +213[5-7]XXXXXXXX.
  // Spaces, dots and dashes are stripped before matching, and a bare 9-digit
  // national number (when the UI shows the +213 prefix separately, e.g. the
  // create-account form) is canonicalised to 0XXXXXXXXX — so every phone field
  // in the app validates against the SAME rule regardless of input layout.
  phone: Yup.string()
    .transform((v) => normalizeAlgerianPhone(v))
    .matches(ALGERIAN_PHONE_REGEX, () => tr('validation.phoneAlgerian'))
    .required(() => tr('validation.phoneRequired')),

  required: (fieldName: string) =>
    Yup.string()
      .required(() => tr('validation.fieldRequired', { field: fieldName }))
      .trim(),
};

// Login Schema
export const loginSchema = Yup.object().shape({
  email: validationRules.email,
  password: validationRules.password,
});

// Register Schema
export const registerSchema = Yup.object().shape({
  firstName: validationRules.firstName,
  lastName: validationRules.lastName,
  email: validationRules.email,
  password: validationRules.password,
  confirmPassword: validationRules.confirmPassword(),
});

// Create-account form schema — matches the mobile register screen fields
// (fullName + phone, unlike the firstName/lastName `registerSchema` above).
export const registerFormSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(3, ({ min }) => tr('validation.fullNameMin', { n: min }))
    .required(() => tr('validation.fullNameRequired'))
    .trim(),
  email: validationRules.email,
  phone: validationRules.phone,
  password: validationRules.password,
  confirmPassword: validationRules.confirmPassword(),
});

// Forgot Password Schema
export const forgotPasswordSchema = Yup.object().shape({
  email: validationRules.email,
});

// Reset Password Schema
export const resetPasswordSchema = Yup.object().shape({
  password: validationRules.password,
  confirmPassword: validationRules.confirmPassword(),
});

// Change Password Schema
export const changePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required(() => tr('validation.currentPasswordRequired')),
  newPassword: validationRules.password,
  confirmPassword: validationRules.confirmPassword('newPassword'),
});

// Update Profile Schema
export const updateProfileSchema = Yup.object().shape({
  firstName: validationRules.firstName,
  lastName: validationRules.lastName,
  email: validationRules.email,
  phone: validationRules.phone.optional(),
});

// Shipping Address Schema (factory — email required only for guest checkout)
export const makeShippingAddressSchema = (includeEmail: boolean) =>
  Yup.object().shape({
    fullName: Yup.string()
      .min(3, ({ min }) => tr('validation.fullNameMin', { n: min }))
      .required(() => tr('validation.fullNameRequired'))
      .trim(),
    phoneNumber: validationRules.phone,
    address: Yup.string()
      .min(10, ({ min }) => tr('validation.addressMin', { n: min }))
      .required(() => tr('validation.addressRequired'))
      .trim(),
    wilayaCode: Yup.string().required(() => tr('validation.wilayaRequired')),
    communeCode: Yup.string().required(() => tr('validation.communeRequired')),
    notes: Yup.string()
      .max(500, ({ max }) => tr('validation.notesMax', { n: max }))
      .optional(),
    ...(includeEmail
      ? {
          email: Yup.string()
            .email(() => tr('validation.emailInvalid'))
            .required(() => tr('validation.emailRequired'))
            .trim(),
        }
      : {}),
  });

/** Default (guest email NOT required) — kept for back-compat with existing importers. */
export const shippingAddressSchema = makeShippingAddressSchema(false);

// Address-book form schema (profile/addresses)
export const addressFormSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(3, ({ min }) => tr('validation.fullNameMin', { n: min }))
    .required(() => tr('validation.fullNameRequired'))
    .trim(),
  phoneNumber: validationRules.phone,
  streetLine1: Yup.string()
    .min(5, ({ min }) => tr('validation.addressMin', { n: min }))
    .required(() => tr('validation.addressRequired'))
    .trim(),
  wilayaCode: Yup.string().required(() => tr('validation.wilayaRequired')),
  communeCode: Yup.string().required(() => tr('validation.communeRequired')),
  defaultShippingAddress: Yup.boolean(),
});
