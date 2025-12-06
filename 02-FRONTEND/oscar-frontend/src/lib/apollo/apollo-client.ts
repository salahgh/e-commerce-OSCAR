import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8085/shop-api',
  credentials: 'include',
});

const authLink = setContext(async (_, { headers }) => {
  // Get token from localStorage (client-side only)
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'Accept-Language': typeof window !== 'undefined' ? navigator.language : 'fr',
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );

      if (extensions?.code === 'UNAUTHENTICATED') {
        // Redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        products: {
          keyArgs: ['filter', 'sort'],
          merge(existing, incoming, { args }) {
            const offset = args?.offset || 0;
            const merged = existing ? existing.edges.slice(0) : [];

            for (let i = 0; i < incoming.edges.length; ++i) {
              merged[offset + i] = incoming.edges[i];
            }

            return {
              ...incoming,
              edges: merged,
            };
          },
        },
        cart: {
          read(existing) {
            return existing || null;
          },
        },
      },
    },
    Product: {
      keyFields: ['id'],
    },
    User: {
      keyFields: ['id'],
    },
    Order: {
      keyFields: ['id'],
    },
  },
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache,
  ssrMode: typeof window === 'undefined',
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  },
});
