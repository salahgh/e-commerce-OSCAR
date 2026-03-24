import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { setUser, logout } from '../../store/slices/authSlice';
import { MeDocument } from '../../graphql/generated/graphql';
import { Spinner } from '../ui/Spinner';

interface AuthInitializerProps {
  children: React.ReactNode;
}

/**
 * Component that initializes auth state on app load.
 * If we have a token but no user data, it fetches the current user.
 */
export const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const [initialized, setInitialized] = useState(false);

  // Only fetch if we're authenticated but don't have user data
  const shouldFetch = isAuthenticated && !user;

  const { data, loading, error } = useQuery(MeDocument, {
    skip: !shouldFetch,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    // If we already have user data, we're initialized
    if (user) {
      setInitialized(true);
      return;
    }

    // If we're not authenticated, we're initialized (just not logged in)
    if (!isAuthenticated) {
      setInitialized(true);
      return;
    }

    // If we're fetching, wait
    if (loading) {
      return;
    }

    // If we got user data, set it
    if (data?.me) {
      dispatch(
        setUser({
          id: data.me.id,
          identifier: data.me.identifier,
          channels: data.me.channels.map((ch) => ({
            id: ch.id,
            code: ch.code,
            token: ch.token,
            permissions: ch.permissions as string[],
          })),
        })
      );
      setInitialized(true);
      return;
    }

    // If we got an error or no data, the session is invalid - logout
    if (error || (!loading && !data?.me)) {
      console.warn('Session invalid or expired, logging out');
      dispatch(logout());
      setInitialized(true);
      return;
    }
  }, [isAuthenticated, user, data, loading, error, dispatch]);

  // Show loading while initializing auth
  if (!initialized && shouldFetch) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-muted-foreground">Chargement de la session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthInitializer;
