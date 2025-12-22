import { ApolloClient, ApolloLink, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

export const VENDURE_TOKEN_KEY = 'vendure_token';

// HTTP Link
const httpLink = createHttpLink({
  uri: Constants.expoConfig?.extra?.graphqlUrl || 'http://10.0.2.2:8085/shop-api',
  credentials: 'include',
});

// Auth Link - Add vendure-token header for session authentication
const authLink = setContext(async (_, { headers }) => {
  try {
    const token = await SecureStore.getItemAsync(VENDURE_TOKEN_KEY);
    return {
      headers: {
        ...headers,
        ...(token ? { 'vendure-token': token } : {}),
      },
    };
  } catch (error) {
    console.error('Error getting vendure token from secure store:', error);
    return { headers };
  }
});

// Afterware Link - Capture vendure-token from response headers
const afterwareLink = new ApolloLink((operation, forward) => {
  return forward(operation).map((response) => {
    const context = operation.getContext();
    const responseHeaders = context.response?.headers;

    if (responseHeaders) {
      const token = responseHeaders.get('vendure-token');
      if (token) {
        SecureStore.setItemAsync(VENDURE_TOKEN_KEY, token).catch((err) => {
          console.error('Error storing vendure token:', err);
        });
      }
    }

    return response;
  });
});

// Error Link - Handle GraphQL and network errors
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// InMemory Cache configuration for Vendure
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // Vendure uses 'search' for product search with pagination
        search: {
          keyArgs: ['input', ['term', 'facetValueIds', 'collectionSlug']],
          merge(existing, incoming, { args }) {
            if (!existing || args?.input?.skip === 0) return incoming;
            return {
              ...incoming,
              items: [...(existing.items || []), ...(incoming.items || [])],
            };
          },
        },
      },
    },
  },
});

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, afterwareLink, httpLink]),
  cache,
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
