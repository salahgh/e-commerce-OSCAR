import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useMutation } from '@apollo/client';
import * as SecureStore from 'expo-secure-store';
import { apolloClient } from '../apollo/client';
import { SecureStorage, STORAGE_KEYS, Storage } from '../utils/storage';
import {
  LoginMutation,
  LoginMutationVariables,
  RegisterMutation,
  RegisterMutationVariables,
  LoginDocument,
  RegisterDocument,
} from '../graphql/generated/graphql';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // GraphQL Mutations
  const [loginMutation] = useMutation<LoginMutation, LoginMutationVariables>(LoginDocument);
  const [registerMutation] = useMutation<RegisterMutation, RegisterMutationVariables>(
    RegisterDocument
  );

  // Load user data from storage on app start
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [accessToken, refreshToken, userDataStr] = await Promise.all([
        SecureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        Storage.getItem(STORAGE_KEYS.USER_DATA),
      ]);

      if (accessToken && userDataStr) {
        const user = JSON.parse(userDataStr) as User;
        setAuthState({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const { data } = await loginMutation({
          variables: {
            input: { email, password },
          },
        });

        if (!data?.login) {
          throw new Error('Login failed');
        }

        const { accessToken, refreshToken, userId, firstName, lastName, role } = data.login;

        const user: User = {
          id: userId.toString(),
          email,
          firstName,
          lastName,
          role,
        };

        // Store tokens securely
        await Promise.all([
          SecureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
          SecureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
          Storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user)),
        ]);

        setAuthState({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    [loginMutation]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      try {
        const { data: result } = await registerMutation({
          variables: {
            input: {
              email: data.email,
              password: data.password,
              firstName: data.firstName,
              lastName: data.lastName,
            },
          },
        });

        if (!result?.register) {
          throw new Error('Registration failed');
        }

        const { accessToken, refreshToken, userId, email, firstName, lastName, role } =
          result.register;

        const user: User = {
          id: userId.toString(),
          email,
          firstName,
          lastName,
          role,
        };

        // Store tokens securely
        await Promise.all([
          SecureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
          SecureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
          Storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user)),
        ]);

        setAuthState({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        console.error('Registration error:', error);
        throw error;
      }
    },
    [registerMutation]
  );

  const logout = useCallback(async () => {
    try {
      // Clear tokens from storage
      await Promise.all([
        SecureStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
        Storage.removeItem(STORAGE_KEYS.USER_DATA),
      ]);

      // Clear Apollo cache
      await apolloClient.clearStore();

      setAuthState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }, []);

  const updateUser = useCallback((user: User) => {
    setAuthState((prev) => ({ ...prev, user }));
    Storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  }, []);

  const value: AuthContextValue = {
    ...authState,
    login,
    register,
    logout,
    updateUser,
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
