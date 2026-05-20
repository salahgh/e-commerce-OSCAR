import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useMutation, useLazyQuery } from '@apollo/client/react';
import * as SecureStore from 'expo-secure-store';
import { apolloClient, VENDURE_TOKEN_KEY } from '../apollo/client';
import { Storage, STORAGE_KEYS } from '../utils/storage';
import {
  ShopLoginMutation,
  ShopLoginMutationVariables,
  ShopLoginDocument,
  ShopLogoutMutation,
  ShopLogoutDocument,
  ShopRegisterMutation,
  ShopRegisterMutationVariables,
  ShopRegisterDocument,
  ActiveCustomerQuery,
  ActiveCustomerDocument,
  RequestPasswordResetMutation,
  RequestPasswordResetMutationVariables,
  RequestPasswordResetDocument,
  useResetPasswordMutation,
  useVerifyCustomerAccountMutation,
  useRefreshVerificationMutation,
} from '../graphql/generated/graphql';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message?: string }>;
  /** Consume a password-reset token + new password to set a new credential. */
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; message?: string }>;
  /** Verify a customer account from an email link (`?token=` deep link). */
  verifyEmail: (token: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  /** Resend the verification email after a user typo'd or the link expired. */
  resendVerification: (email: string) => Promise<{ success: boolean; message?: string }>;
  refetchUser: () => Promise<void>;
}

interface RegisterData {
  emailAddress: string;
  password: string;
  firstName: string;
  lastName: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const [loginMutation] = useMutation<ShopLoginMutation, ShopLoginMutationVariables>(
    ShopLoginDocument
  );
  const [logoutMutation] = useMutation<ShopLogoutMutation>(ShopLogoutDocument);
  const [registerMutation] = useMutation<ShopRegisterMutation, ShopRegisterMutationVariables>(
    ShopRegisterDocument
  );
  const [requestResetMutation] = useMutation<
    RequestPasswordResetMutation,
    RequestPasswordResetMutationVariables
  >(RequestPasswordResetDocument);
  const [resetPasswordMutation] = useResetPasswordMutation();
  const [verifyAccountMutation] = useVerifyCustomerAccountMutation();
  const [refreshVerificationMutation] = useRefreshVerificationMutation();

  const [fetchActiveCustomer] = useLazyQuery<ActiveCustomerQuery>(ActiveCustomerDocument, {
    fetchPolicy: 'network-only',
  });

  const clearAuth = async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(VENDURE_TOKEN_KEY),
      Storage.removeItem(STORAGE_KEYS.USER_DATA),
    ]);
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const loadStoredAuth = async () => {
    try {
      const [vendureToken, userDataStr] = await Promise.all([
        SecureStore.getItemAsync(VENDURE_TOKEN_KEY),
        Storage.getItem(STORAGE_KEYS.USER_DATA),
      ]);

      if (vendureToken && userDataStr) {
        const user = JSON.parse(userDataStr) as User;
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        try {
          const { data } = await fetchActiveCustomer();
          if (data?.activeCustomer) {
            const customer = data.activeCustomer;
            const updatedUser: User = {
              id: customer.id,
              email: customer.emailAddress,
              firstName: customer.firstName,
              lastName: customer.lastName,
              phoneNumber: customer.phoneNumber,
            };
            setAuthState({
              user: updatedUser,
              isAuthenticated: true,
              isLoading: false,
            });
            await Storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
          } else {
            await clearAuth();
          }
        } catch {
          await clearAuth();
        }
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const login = useCallback(
    async (email: string, password: string, rememberMe: boolean = true) => {
      try {
        const { data } = await loginMutation({
          variables: {
            username: email,
            password,
            rememberMe,
          },
        });

        if (!data?.login) {
          throw new Error('Login failed');
        }

        const result = data.login;

        if ('errorCode' in result) {
          const errorResult = result as { errorCode: string; message: string };
          throw new Error(errorResult.message || 'Login failed');
        }

        const { data: customerData } = await fetchActiveCustomer();

        if (!customerData?.activeCustomer) {
          throw new Error('Could not fetch customer details');
        }

        const customer = customerData.activeCustomer;
        const user: User = {
          id: customer.id,
          email: customer.emailAddress,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phoneNumber: customer.phoneNumber,
        };

        await Storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    [loginMutation, fetchActiveCustomer]
  );

  const register = useCallback(
    async (data: RegisterData): Promise<{ success: boolean; message?: string }> => {
      try {
        const { data: result } = await registerMutation({
          variables: {
            input: {
              emailAddress: data.emailAddress,
              firstName: data.firstName,
              lastName: data.lastName,
              password: data.password,
            },
          },
        });

        if (!result?.registerCustomerAccount) {
          throw new Error('Registration failed');
        }

        const registerResult = result.registerCustomerAccount;

        if ('errorCode' in registerResult) {
          const errorResult = registerResult as { errorCode: string; message: string };
          return { success: false, message: errorResult.message };
        }

        return { success: true, message: 'Registration successful. Please verify your email.' };
      } catch (error) {
        console.error('Registration error:', error);
        const message = error instanceof Error ? error.message : 'Registration failed';
        return { success: false, message };
      }
    },
    [registerMutation]
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation();
      await clearAuth();
      await apolloClient.clearStore();
    } catch (error) {
      console.error('Logout error:', error);
      await clearAuth();
      await apolloClient.clearStore();
    }
  }, [logoutMutation]);

  const requestPasswordReset = useCallback(
    async (email: string): Promise<{ success: boolean; message?: string }> => {
      try {
        const { data } = await requestResetMutation({
          variables: { emailAddress: email },
        });

        if (!data?.requestPasswordReset) {
          return { success: false, message: 'Password reset request failed' };
        }

        const result = data.requestPasswordReset;

        if ('errorCode' in result) {
          const errorResult = result as { errorCode: string; message: string };
          return { success: false, message: errorResult.message };
        }

        return { success: true, message: 'Password reset email sent' };
      } catch (error) {
        console.error('Password reset error:', error);
        const message = error instanceof Error ? error.message : 'Password reset failed';
        return { success: false, message };
      }
    },
    [requestResetMutation]
  );

  const resetPassword = useCallback(
    async (token: string, password: string): Promise<{ success: boolean; message?: string }> => {
      try {
        const { data } = await resetPasswordMutation({ variables: { token, password } });
        const result = data?.resetPassword as any;
        if (!result) return { success: false, message: 'Password reset failed' };
        if (result.__typename === 'CurrentUser') {
          await refetchUser();
          return { success: true };
        }
        return { success: false, message: result.message ?? 'Invalid or expired link' };
      } catch (err) {
        return { success: false, message: err instanceof Error ? err.message : 'Password reset failed' };
      }
    },
    [resetPasswordMutation],
  );

  const verifyEmail = useCallback(
    async (token: string, password?: string): Promise<{ success: boolean; message?: string }> => {
      try {
        const { data } = await verifyAccountMutation({ variables: { token, password } });
        const result = data?.verifyCustomerAccount as any;
        if (!result) return { success: false, message: 'Verification failed' };
        if (result.__typename === 'CurrentUser') {
          await refetchUser();
          return { success: true };
        }
        return { success: false, message: result.message ?? 'Invalid or expired link' };
      } catch (err) {
        return { success: false, message: err instanceof Error ? err.message : 'Verification failed' };
      }
    },
    [verifyAccountMutation],
  );

  const resendVerification = useCallback(
    async (email: string): Promise<{ success: boolean; message?: string }> => {
      try {
        const { data } = await refreshVerificationMutation({ variables: { emailAddress: email } });
        const result = data?.refreshCustomerVerification as any;
        if (!result) return { success: false, message: 'Failed to resend' };
        if (result.__typename === 'Success') return { success: true };
        return { success: false, message: result.message ?? 'Failed to resend' };
      } catch (err) {
        return { success: false, message: err instanceof Error ? err.message : 'Failed to resend' };
      }
    },
    [refreshVerificationMutation],
  );

  const updateUser = useCallback((user: User) => {
    setAuthState((prev) => ({ ...prev, user }));
    Storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  }, []);

  const refetchUser = useCallback(async () => {
    try {
      const { data } = await fetchActiveCustomer();
      if (data?.activeCustomer) {
        const customer = data.activeCustomer;
        const user: User = {
          id: customer.id,
          email: customer.emailAddress,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phoneNumber: customer.phoneNumber,
        };
        updateUser(user);
      }
    } catch (error) {
      console.error('Error refetching user:', error);
    }
  }, [fetchActiveCustomer, updateUser]);

  const value: AuthContextValue = {
    ...authState,
    login,
    register,
    logout,
    updateUser,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    resendVerification,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
