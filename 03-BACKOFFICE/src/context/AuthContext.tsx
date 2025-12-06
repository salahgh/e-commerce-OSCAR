import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { LOGIN_MUTATION, LOGOUT_MUTATION, ME_QUERY } from '../graphql/queries';

interface User {
  id: string;
  identifier: string;
  channels: Array<{
    id: string;
    code: string;
    permissions: string[];
  }>;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { data: meData, loading: meLoading, refetch } = useQuery(ME_QUERY, {
    fetchPolicy: 'network-only',
    onError: () => {
      setUser(null);
      setLoading(false);
    },
    onCompleted: (data) => {
      if (data?.me) {
        setUser(data.me);
      }
      setLoading(false);
    },
  });

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);

  useEffect(() => {
    if (!meLoading && meData?.me) {
      setUser(meData.me);
    }
  }, [meData, meLoading]);

  const login = async (username: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: { username, password },
      });

      if (data?.login?.__typename === 'CurrentUser') {
        setUser(data.login);
        await refetch();
        return { success: true };
      } else if (data?.login?.__typename === 'InvalidCredentialsError') {
        return { success: false, error: data.login.message };
      }
      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  };

  const logout = async () => {
    try {
      await logoutMutation();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: loading || meLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
