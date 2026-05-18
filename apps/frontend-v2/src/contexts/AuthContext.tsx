'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useApolloClient } from '@apollo/client';
import { useRouter } from '@/i18n/routing';
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
  type CustomerFieldsFragment,
  type RegisterCustomerInput,
  type UpdateCustomerInput,
} from '@oscar/graphql-shop/generated';

export type AuthError = { code: string; message: string };

export type RegisterResult = { success: boolean; requiresVerification: boolean };

export type PasswordChangeResult = { success: boolean; error?: AuthError };

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
  const apolloClient = useApolloClient();
  const [customer, setCustomer] = useState<CustomerFieldsFragment | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    data: customerData,
    loading: queryLoading,
    error: queryError,
    refetch: refetchCustomerQuery,
  } = useActiveCustomerQuery({ fetchPolicy: 'network-only' });

  useEffect(() => {
    if (!queryLoading) {
      setCustomer(queryError ? null : customerData?.activeCustomer ?? null);
      setLoading(false);
    }
  }, [customerData, queryLoading, queryError]);

  const [shopLogin] = useShopLoginMutation();
  const [shopLogout] = useShopLogoutMutation();
  const [shopRegister] = useShopRegisterMutation();
  const [verifyAccount] = useVerifyCustomerAccountMutation();
  const [refreshVerification] = useRefreshVerificationMutation();
  const [requestReset] = useRequestPasswordResetMutation();
  const [resetPwd] = useResetPasswordMutation();
  const [updateCustomer] = useUpdateCustomerProfileMutation();
  const [updatePassword] = useUpdateCustomerPasswordMutation();

  const refetchCustomer = useCallback(async () => {
    try {
      const { data } = await refetchCustomerQuery();
      setCustomer(data?.activeCustomer ?? null);
    } catch {
      setCustomer(null);
    }
  }, [refetchCustomerQuery]);

  const login = async (email: string, password: string, rememberMe = false) => {
    const { data } = await shopLogin({ variables: { username: email, password, rememberMe } });
    const result = data?.login;
    if (!result) throw new Error('Login failed - no response');

    if (result.__typename === 'CurrentUser') {
      await refetchCustomer();
      return;
    }
    if (result.__typename === 'InvalidCredentialsError') {
      throw new Error(result.message || 'Invalid email or password');
    }
    if (result.__typename === 'NotVerifiedError') {
      const error = new Error(result.message || 'Email not verified');
      (error as Error & { code?: string }).code = 'NOT_VERIFIED';
      throw error;
    }
    if (result.__typename === 'NativeAuthStrategyError') {
      throw new Error(result.message || 'Authentication error');
    }
    throw new Error('Login failed');
  };

  const logout = async () => {
    try {
      await shopLogout();
      setCustomer(null);
      await apolloClient.clearStore();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      setCustomer(null);
    }
  };

  const register = async (input: RegisterCustomerInput): Promise<RegisterResult> => {
    const { data } = await shopRegister({ variables: { input } });
    const result = data?.registerCustomerAccount;
    if (!result) throw new Error('Registration failed - no response');

    if (result.__typename === 'Success') {
      return { success: true, requiresVerification: true };
    }
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

  const verifyEmail = async (token: string, password?: string) => {
    const { data } = await verifyAccount({ variables: { token, password } });
    const result = data?.verifyCustomerAccount;
    if (!result) throw new Error('Verification failed - no response');

    if (result.__typename === 'CurrentUser') {
      await refetchCustomer();
      return;
    }
    if (result.__typename === 'VerificationTokenInvalidError') throw new Error(result.message);
    if (result.__typename === 'VerificationTokenExpiredError') throw new Error(result.message);
    if (result.__typename === 'MissingPasswordError') throw new Error(result.message);
    if (result.__typename === 'PasswordValidationError') {
      throw new Error(result.validationErrorMessage || result.message);
    }
    if (result.__typename === 'PasswordAlreadySetError') throw new Error(result.message);
    if (result.__typename === 'NativeAuthStrategyError') throw new Error(result.message);
    throw new Error('Email verification failed');
  };

  const resendVerification = async (email: string) => {
    const { data } = await refreshVerification({ variables: { emailAddress: email } });
    const result = data?.refreshCustomerVerification;
    if (!result) throw new Error('Failed to resend verification - no response');
    if (result.__typename === 'Success') return;
    if (result.__typename === 'NativeAuthStrategyError') throw new Error(result.message);
    throw new Error('Failed to resend verification email');
  };

  const requestPasswordReset = async (email: string) => {
    const { data } = await requestReset({ variables: { emailAddress: email } });
    const result = data?.requestPasswordReset;
    if (!result) throw new Error('Password reset request failed - no response');
    if (result.__typename === 'Success') return;
    if (result.__typename === 'NativeAuthStrategyError') throw new Error(result.message);
    throw new Error('Password reset request failed');
  };

  const resetPassword = async (token: string, password: string) => {
    const { data } = await resetPwd({ variables: { token, password } });
    const result = data?.resetPassword;
    if (!result) throw new Error('Password reset failed - no response');

    if (result.__typename === 'CurrentUser') {
      await refetchCustomer();
      return;
    }
    if (result.__typename === 'PasswordResetTokenInvalidError') throw new Error(result.message);
    if (result.__typename === 'PasswordResetTokenExpiredError') throw new Error(result.message);
    if (result.__typename === 'PasswordValidationError') {
      throw new Error(result.validationErrorMessage || result.message);
    }
    if (result.__typename === 'NativeAuthStrategyError') throw new Error(result.message);
    if (result.__typename === 'NotVerifiedError') throw new Error(result.message);
    throw new Error('Password reset failed');
  };

  const updateProfile = async (input: UpdateCustomerInput) => {
    const { data } = await updateCustomer({ variables: { input } });
    if (!data?.updateCustomer) throw new Error('Profile update failed - no response');
    setCustomer(data.updateCustomer);
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<PasswordChangeResult> => {
    const { data } = await updatePassword({ variables: { currentPassword, newPassword } });
    const result = data?.updateCustomerPassword;
    if (!result) {
      return { success: false, error: { code: 'UNKNOWN', message: 'No response' } };
    }
    if (result.__typename === 'Success') return { success: true };
    if (result.__typename === 'InvalidCredentialsError') {
      return { success: false, error: { code: 'INVALID_CREDENTIALS', message: result.message } };
    }
    if (result.__typename === 'PasswordValidationError') {
      return {
        success: false,
        error: { code: 'PASSWORD_VALIDATION', message: result.validationErrorMessage || result.message },
      };
    }
    if (result.__typename === 'NativeAuthStrategyError') {
      return { success: false, error: { code: 'AUTH_ERROR', message: result.message } };
    }
    return { success: false, error: { code: 'UNKNOWN', message: 'Password change failed' } };
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
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
