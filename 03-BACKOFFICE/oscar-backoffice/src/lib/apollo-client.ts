import { ApolloClient, InMemoryCache, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { createUploadLink } from 'apollo-upload-client';

// Vendure Admin API endpoint with file upload support
const uploadLink = createUploadLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:8085/admin-api',
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

// Error handling for Vendure
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach((error) => {
      const { message, locations, path } = error;
      console.error(`[GraphQL error]: Message: ${message}, Path: ${path}`, locations);

      // Handle Vendure auth errors
      const errorCode = (error as any).extensions?.code;
      if (
        errorCode === 'FORBIDDEN' ||
        message.includes('You are not currently authorized') ||
        message.includes('Not authenticated')
      ) {
        localStorage.removeItem('vendure_auth_token');
        window.location.href = '/login';
      }
    });
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
