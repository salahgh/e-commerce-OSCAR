'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apolloClient } from '@/lib/apollo/apollo-client';
import {
  useActiveCustomerQuery,
  useShopLoginMutation,
  useShopLogoutMutation,
  useShopRegisterMutation,
  useVerifyCustomerAccountMutation,
  useRefreshVerificationMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useUpdateCustomerProfileMutation,
  useUpdateCustomerPasswordMutation,
  Customer,
  CustomerFieldsFragment,
  RegisterCustomerInput,
  UpdateCustomerInput,
} from '@/graphql/generated/graphql';

// Auth error types for proper error handling
export type AuthError = {
  code: string;
  message: string;
};

// Register result - may require email verification
export type RegisterResult = {
  success: boolean;
  requiresVerification: boolean;
};

// Password change result
export type PasswordChangeResult = {
  success: boolean;
  error?: AuthError;
};

// Auth context type definition
interface AuthContextType {
  customer: CustomerFieldsFragment | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  register: (input: RegisterCustomerInput) => Promise<RegisterResult>;
  verifyEmail: (token: string, password?: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (input: UpdateCustomerInput) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<PasswordChangeResult>;
  refetchCustomer: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerFieldsFragment | null>(null);
  const [loading, setLoading] = useState(true);

  // Queries
  const { data: customerData, refetch: refetchCustomerQuery } = useActiveCustomerQuery({
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      setCustomer(data.activeCustomer ?? null);
      setLoading(false);
    },
    onError: () => {
      setCustomer(null);
      setLoading(false);
    },
  });

  // Mutations
  const [shopLogin] = useShopLoginMutation();
  const [shopLogout] = useShopLogoutMutation();
  const [shopRegister] = useShopRegisterMutation();
  const [verifyAccount] = useVerifyCustomerAccountMutation();
  const [refreshVerification] = useRefreshVerificationMutation();
  const [requestReset] = useRequestPasswordResetMutation();
  const [resetPwd] = useResetPasswordMutation();
  const [updateCustomer] = useUpdateCustomerProfileMutation();
  const [updatePassword] = useUpdateCustomerPasswordMutation();

  // Update customer state when query data changes
  useEffect(() => {
    if (customerData?.activeCustomer) {
      setCustomer(customerData.activeCustomer);
    }
  }, [customerData]);

  // Refetch customer data
  const refetchCustomer = useCallback(async () => {
    try {
      const { data } = await refetchCustomerQuery();
      setCustomer(data?.activeCustomer ?? null);
    } catch (error) {
      setCustomer(null);
    }
  }, [refetchCustomerQuery]);

  // Login with email and password
  const login = async (email: string, password: string, rememberMe = false) => {
    const { data } = await shopLogin({
      variables: {
        username: email,
        password,
        rememberMe,
      },
    });

    const result = data?.login;

    if (!result) {
      throw new Error('Login failed - no response');
    }

    // Handle union type response
    if (result.__typename === 'CurrentUser') {
      // Success - refetch customer data
      await refetchCustomer();
      return;
    }

    // Handle error types
    if (result.__typename === 'InvalidCredentialsError') {
      throw new Error(result.message || 'Invalid email or password');
    }

    if (result.__typename === 'NotVerifiedError') {
      const error = new Error(result.message || 'Email not verified');
      (error as any).code = 'NOT_VERIFIED';
      throw error;
    }

    if (result.__typename === 'NativeAuthStrategyError') {
      throw new Error(result.message || 'Authentication error');
    }

    throw new Error('Login failed');
  };

  // Logout
  const logout = async () => {
    try {
      await shopLogout();
      setCustomer(null);
      // Clear Apollo cache
      await apolloClient.clearStore();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if server logout fails
      setCustomer(null);
    }
  };

  // Register new customer
  const register = async (input: RegisterCustomerInput): Promise<RegisterResult> => {
    const { data } = await shopRegister({
      variables: { input },
    });

    const result = data?.registerCustomerAccount;

    if (!result) {
      throw new Error('Registration failed - no response');
    }

    // Handle union type response
    if (result.__typename === 'Success') {
      return {
        success: true,
        requiresVerification: true, // Vendure typically requires email verification
      };
    }

    // Handle error types
    if (result.__typename === 'MissingPasswordError') {
      throw new Error(result.message || 'Password is required');
    }

    if (result.__typename === 'PasswordValidationError') {
      throw new Error(result.validationErrorMessage || result.message || 'Password validation failed');
    }

    if (result.__typename === 'NativeAuthStrategyError') {
      throw new Error(result.message || 'Registration error');
    }

    throw new Error('Registration failed');
  };

  // Verify email with token
  const verifyEmail = async (token: string, password?: string) => {
    const { data } = await verifyAccount({
      variables: { token, password },
    });

    const result = data?.verifyCustomerAccount;

    if (!result) {
      throw new Error('Verification failed - no response');
    }

    // Handle union type response
    if (result.__typename === 'CurrentUser') {
      // Success - refetch customer data
      await refetchCustomer();
      return;
    }

    // Handle error types
    if (result.__typename === 'VerificationTokenInvalidError') {
      throw new Error(result.message || 'Invalid verification token');
    }

    if (result.__typename === 'VerificationTokenExpiredError') {
      throw new Error(result.message || 'Verification token has expired');
    }

    if (result.__typename === 'MissingPasswordError') {
      throw new Error(result.message || 'Password is required');
    }

    if (result.__typename === 'PasswordValidationError') {
      throw new Error(result.validationErrorMessage || result.message || 'Password validation failed');
    }

    if (result.__typename === 'PasswordAlreadySetError') {
      throw new Error(result.message || 'Password has already been set');
    }

    if (result.__typename === 'NativeAuthStrategyError') {
      throw new Error(result.message || 'Verification error');
    }

    throw new Error('Email verification failed');
  };

  // Resend verification email
  const resendVerification = async (email: string) => {
    const { data } = await refreshVerification({
      variables: { emailAddress: email },
    });

    const result = data?.refreshCustomerVerification;

    if (!result) {
      throw new Error('Failed to resend verification - no response');
    }

    if (result.__typename === 'Success') {
      return;
    }

    if (result.__typename === 'NativeAuthStrategyError') {
      throw new Error(result.message || 'Failed to resend verification');
    }

    throw new Error('Failed to resend verification email');
  };

  // Request password reset
  const requestPasswordReset = async (email: string) => {
    const { data } = await requestReset({
      variables: { emailAddress: email },
    });

    const result = data?.requestPasswordReset;

    if (!result) {
      throw new Error('Password reset request failed - no response');
    }

    if (result.__typename === 'Success') {
      return;
    }

    if (result.__typename === 'NativeAuthStrategyError') {
      throw new Error(result.message || 'Password reset request failed');
    }

    throw new Error('Password reset request failed');
  };

  // Reset password with token
  const resetPassword = async (token: string, password: string) => {
    const { data } = await resetPwd({
      variables: { token, password },
    });

    const result = data?.resetPassword;

    if (!result) {
      throw new Error('Password reset failed - no response');
    }

    // Handle union type response
    if (result.__typename === 'CurrentUser') {
      // Success - user is now logged in
      await refetchCustomer();
      return;
    }

    // Handle error types
    if (result.__typename === 'PasswordResetTokenInvalidError') {
      throw new Error(result.message || 'Invalid password reset token');
    }

    if (result.__typename === 'PasswordResetTokenExpiredError') {
      throw new Error(result.message || 'Password reset token has expired');
    }

    if (result.__typename === 'PasswordValidationError') {
      throw new Error(result.validationErrorMessage || result.message || 'Password validation failed');
    }

    if (result.__typename === 'NativeAuthStrategyError') {
      throw new Error(result.message || 'Password reset error');
    }

    if (result.__typename === 'NotVerifiedError') {
      throw new Error(result.message || 'Email not verified');
    }

    throw new Error('Password reset failed');
  };

  // Update customer profile
  const updateProfile = async (input: UpdateCustomerInput) => {
    const { data } = await updateCustomer({
      variables: { input },
    });

    if (!data?.updateCustomer) {
      throw new Error('Profile update failed - no response');
    }

    // Update local state
    setCustomer(data.updateCustomer);
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string): Promise<PasswordChangeResult> => {
    const { data } = await updatePassword({
      variables: { currentPassword, newPassword },
    });

    const result = data?.updateCustomerPassword;

    if (!result) {
      return {
        success: false,
        error: { code: 'UNKNOWN', message: 'Password change failed - no response' },
      };
    }

    // Handle union type response
    if (result.__typename === 'Success') {
      return { success: true };
    }

    // Handle error types
    if (result.__typename === 'InvalidCredentialsError') {
      return {
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: result.message || 'Current password is incorrect' },
      };
    }

    if (result.__typename === 'PasswordValidationError') {
      return {
        success: false,
        error: {
          code: 'PASSWORD_VALIDATION',
          message: result.validationErrorMessage || result.message || 'Password validation failed',
        },
      };
    }

    if (result.__typename === 'NativeAuthStrategyError') {
      return {
        success: false,
        error: { code: 'AUTH_ERROR', message: result.message || 'Password change error' },
      };
    }

    return {
      success: false,
      error: { code: 'UNKNOWN', message: 'Password change failed' },
    };
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        loading,
        isAuthenticated: !!customer,
        login,
        logout,
        register,
        verifyEmail,
        resendVerification,
        requestPasswordReset,
        resetPassword,
        updateProfile,
        changePassword,
        refetchCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
