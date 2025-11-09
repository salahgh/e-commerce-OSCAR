import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:8085/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('admin_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }: any) => {
  if (graphQLErrors) {
    graphQLErrors.forEach((error: any) => {
      const { message, locations, path } = error;
      console.error(`[GraphQL error]: Message: ${message}, Path: ${path}`, locations);
      // Handle unauthorized errors
      if (message.includes('Unauthorized') || message.includes('Not authenticated')) {
        localStorage.removeItem('admin_token');
        window.location.href = '/login';
      }
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: {
            keyArgs: ['filter', 'sort'],
            merge(existing, incoming, { args }) {
              if (!args?.page || args.page === 0) {
                return incoming;
              }
              return {
                ...incoming,
                edges: [...(existing?.edges || []), ...(incoming?.edges || [])],
              };
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
