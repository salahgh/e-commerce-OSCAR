import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// HTTP Link
const httpLink = createHttpLink({
  uri: Constants.expoConfig?.extra?.graphqlUrl || 'http://localhost:8085/graphql',
});

// Auth Link - Add JWT token to headers
const authLink = setContext(async (_, { headers }) => {
  try {
    const token = await SecureStore.getItemAsync('access_token');
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  } catch (error) {
    console.error('Error getting token from secure store:', error);
    return { headers };
  }
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

// InMemory Cache configuration
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        products: {
          keyArgs: ['sortBy', 'sortDirection'],
          merge(existing, incoming) {
            if (!existing) return incoming;
            return {
              ...incoming,
              content: [...(existing.content || []), ...(incoming.content || [])],
            };
          },
        },
      },
    },
  },
});

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
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
