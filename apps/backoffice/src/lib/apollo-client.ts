import { ApolloClient, InMemoryCache, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { createUploadLink } from 'apollo-upload-client';

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:8085/admin-api';

// Vendure Admin API endpoint with file upload support
const uploadLink = createUploadLink({
  uri: graphqlUrl,
  credentials: 'include', // Important for Vendure cookie-based auth
});

// Auth link - Vendure uses vendure-token header
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('vendure_auth_token');
  return {
    headers: {
      ...headers,
      ...(token ? { 'vendure-token': token } : {}),
    },
  };
});

// The canonical "is my session still valid?" query. Only an auth failure on THIS
// operation means the session is dead — see the note below.
const SESSION_CHECK_OPERATION = 'Me';

// Error handling for Vendure.
//
// IMPORTANT: Vendure returns the `FORBIDDEN` code for BOTH cases:
//   1. the session is expired / not authenticated, AND
//   2. the user IS authenticated but lacks permission for this specific operation.
// These are indistinguishable from the error alone. We must therefore NOT log the
// user out on a forbidden *business* query — otherwise a restricted-role admin
// (e.g. an orders-only role) is bounced to /login the moment any screen fires a
// query they aren't permitted to run (the dashboard fires several catalog queries).
//
// Authorization is handled where it belongs — route guards (ProtectedRoute /
// PermissionGate / /access-denied) and per-query `skip`s. Session validity is
// decided solely by the `Me` query (re-run on load by AuthInitializer): if that
// comes back forbidden, the token really is dead, so we clear it and re-login.
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    for (const error of graphQLErrors) {
      console.error(
        `[GraphQL error]: ${operation.operationName} — ${error.message}`,
        error.path
      );

      const errorCode = error.extensions?.code as string | undefined;
      const isAuthError =
        errorCode === 'FORBIDDEN' ||
        error.message.includes('You are not currently authorized') ||
        error.message.includes('Not authenticated');

      if (isAuthError && operation.operationName === SESSION_CHECK_OPERATION) {
        // The session itself is invalid/expired → wipe it and force a fresh login.
        localStorage.removeItem('vendure_auth_token');
        localStorage.removeItem('vendure_channel_id');
        localStorage.removeItem('vendure_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, uploadLink as any]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Vendure uses skip/take pagination
          products: {
            keyArgs: ['options'],
            merge(existing, incoming) {
              return incoming;
            },
          },
          orders: {
            keyArgs: ['options'],
            merge(existing, incoming) {
              return incoming;
            },
          },
          customers: {
            keyArgs: ['options'],
            merge(existing, incoming) {
              return incoming;
            },
          },
          assets: {
            keyArgs: ['options'],
            merge(existing, incoming) {
              return incoming;
            },
          },
          collections: {
            keyArgs: ['options'],
            merge(existing, incoming) {
              return incoming;
            },
          },
          facets: {
            keyArgs: ['options'],
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});
