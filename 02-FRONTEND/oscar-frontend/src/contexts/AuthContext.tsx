'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, setToken, removeToken, isTokenValid } from '@/lib/auth/session';
import type { User } from '@/types';
import {
  useLoginMutation,
  useRegisterMutation,
  useUpdateProfileMutation,
  useGetCurrentUserQuery,
} from '@/graphql/generated/graphql';
import { apolloClient } from '@/lib/apollo/apollo-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  updateProfile: (data: UpdateProfileInput) => Promise<void>;
  refreshToken: () => Promise<void>;
  isAuthenticated: boolean;
}

interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

interface UpdateProfileInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();
  const [updateProfileMutation] = useUpdateProfileMutation();

  useEffect(() => {
    const token = getToken();
    if (token && isTokenValid(token)) {
      // Fetch current user
      // This will be implemented when we have GraphQL queries
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const { data } = await apolloClient.query({
        query: useGetCurrentUserQuery.query,
      });

      if (data?.me) {
        const userData: User = {
          id: data.me.id.toString(),
          email: data.me.email || '',
          firstName: data.me.firstName || '',
          lastName: data.me.lastName || '',
          phone: data.me.phone || undefined,
          role: data.me.role || 'CUSTOMER',
          createdAt: data.me.createdAt || new Date().toISOString(),
          updatedAt: data.me.updatedAt || new Date().toISOString(),
        };
        setUser(userData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching current user:', error);
      removeToken();
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: {
          input: { email, password },
        },
      });

      if (data?.login) {
        // Store access token
        setToken(data.login.accessToken);

        // Store refresh token if needed
        if (data.login.refreshToken) {
          localStorage.setItem('refreshToken', data.login.refreshToken);
        }

        // Set user data
        const userData: User = {
          id: data.login.userId.toString(),
          email: data.login.email || '',
          firstName: data.login.firstName || '',
          lastName: data.login.lastName || '',
          role: data.login.role || 'CUSTOMER',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUser(userData);

        router.push('/');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      removeToken();
      localStorage.removeItem('refreshToken');
      setUser(null);

      // Reset Apollo Client cache
      await apolloClient.clearStore();

      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (data: RegisterInput) => {
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

      if (result?.register) {
        // Store access token
        setToken(result.register.accessToken);

        // Store refresh token if needed
        if (result.register.refreshToken) {
          localStorage.setItem('refreshToken', result.register.refreshToken);
        }

        // Set user data
        const userData: User = {
          id: result.register.userId.toString(),
          email: result.register.email || '',
          firstName: result.register.firstName || '',
          lastName: result.register.lastName || '',
          phone: data.phone,
          role: result.register.role || 'CUSTOMER',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUser(userData);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  };

  const updateProfile = async (data: UpdateProfileInput) => {
    try {
      const { data: result } = await updateProfileMutation({
        variables: {
          input: data,
        },
      });

      if (result?.updateProfile && user) {
        const updatedUser: User = {
          ...user,
          email: result.updateProfile.email || user.email,
          firstName: result.updateProfile.firstName || user.firstName,
          lastName: result.updateProfile.lastName || user.lastName,
          phone: result.updateProfile.phone || user.phone,
          updatedAt: result.updateProfile.updatedAt || new Date().toISOString(),
        };
        setUser(updatedUser);
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw new Error(error.message || 'Profile update failed');
    }
  };

  const refreshToken = async () => {
    try {
      // TODO: Implement GraphQL mutation for token refresh
      console.log('Refresh token');
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        updateProfile,
        refreshToken,
        isAuthenticated: !!user,
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
