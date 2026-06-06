import React, { useEffect, useRef, useState } from 'react';
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
  // Tracks the last `Me` result we synced into the store, so we dispatch `setUser`
  // once per distinct result instead of looping (setUser changes `user`, which is
  // an effect dependency). Apollo returns a stable `data` reference per result.
  const syncedDataRef = useRef<unknown>(null);

  // Always re-validate the session whenever we believe we're authenticated — not
  // only when user data is missing. This refreshes the user's permissions on every
  // load AND detects an expired/invalid token even when a user object was restored
  // from localStorage (otherwise a stale token leaves the app in a broken
  // "logged in" state with every query failing). A failed `Me` query is the single
  // source of truth for "session is dead" (see apollo-client error link).
  const { data, loading, error } = useQuery(MeDocument, {
    skip: !isAuthenticated,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    // If we're not authenticated, we're initialized (just not logged in)
    if (!isAuthenticated) {
      setInitialized(true);
      return;
    }

    // While validating: if we already have a cached user, let the app render and
    // validate in the background; otherwise keep showing the loading state.
    if (loading) {
      if (user) {
        setInitialized(true);
      }
      return;
    }

    // If we got user data, sync it (once per distinct result) to refresh permissions
    if (data?.me) {
      if (syncedDataRef.current !== data) {
        syncedDataRef.current = data;
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
      }
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

  // Block the UI only on first authentication (no cached user yet). When a user
  // was restored from storage we render immediately and validate in the background.
  if (!initialized && isAuthenticated && !user) {
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
