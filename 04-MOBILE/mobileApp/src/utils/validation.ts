import * as Yup from 'yup';

// Common validation rules
export const validationRules = {
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required')
    .trim()
    .lowercase(),

  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),

  confirmPassword: (fieldName: string = 'password') =>
    Yup.string()
      .oneOf([Yup.ref(fieldName)], 'Passwords must match')
      .required('Please confirm your password'),

  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required')
    .trim(),

  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required')
    .trim(),

  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),

  required: (fieldName: string) => Yup.string().required(`${fieldName} is required`).trim(),
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
  currentPassword: Yup.string().required('Current password is required'),
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

// Shipping Address Schema
export const shippingAddressSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(3, 'Full name must be at least 3 characters')
    .required('Full name is required')
    .trim(),
  phoneNumber: validationRules.phone,
  address: Yup.string()
    .min(10, 'Address must be at least 10 characters')
    .required('Address is required')
    .trim(),
  city: Yup.string()
    .min(2, 'City must be at least 2 characters')
    .required('City is required')
    .trim(),
  postalCode: Yup.string()
    .matches(/^[0-9]{5}$/, 'Postal code must be 5 digits')
    .required('Postal code is required'),
  notes: Yup.string().max(500, 'Notes must be less than 500 characters').optional(),
});
