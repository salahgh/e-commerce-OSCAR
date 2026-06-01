'use client';

import { ApolloLink, HttpLink, from } from '@apollo/client';
import {
  ApolloNextAppProvider,
  NextSSRInMemoryCache,
  NextSSRApolloClient,
  SSRMultipartLink,
} from '@apollo/experimental-nextjs-app-support/ssr';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';

// Cache time-to-live settings (in milliseconds)
const CACHE_TTL = {
  products: 5 * 60 * 1000, // 5 minutes
  categories: 30 * 60 * 1000, // 30 minutes
  collections: 30 * 60 * 1000, // 30 minutes
  activeOrder: 0, // No cache
  customer: 60 * 1000, // 1 minute
};

// Derive the next-intl locale from the URL on the client. French (default) has no prefix.
function localeFromPath(pathname: string): string {
  const seg = pathname.split('/')[1];
  return seg === 'ar' || seg === 'en' ? seg : 'fr';
}

function makeClient(ssrLocale: string = 'fr') {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8085/shop-api',
    credentials: 'include',
    fetchOptions: {
      // Use cache for GET requests
      cache: 'default',
    },
  });

  // Auth link for token handling
  const authLink = setContext((_, { headers }) => {
    let token = null;
    // On the client, read the current locale from the URL (robust to locale switches);
    // on the server, use the locale passed into makeClient from the layout.
    let locale = ssrLocale;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token');
      locale = localeFromPath(window.location.pathname);
    }

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
        'Accept-Language': locale,
      },
    };
  });

  // Error handling link
  const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, extensions }) => {
        console.error(`[GraphQL error]: ${message}`);

        // Handle auth errors
        if (extensions?.code === 'UNAUTHENTICATED') {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            // Don't redirect immediately, let the app handle it
          }
        }
      });
    }

    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
    }
  });

  // Retry link for failed requests
  const retryLink = new RetryLink({
    delay: {
      initial: 300,
      max: 3000,
      jitter: true,
    },
    attempts: {
      max: 3,
      retryIf: (error) => !!error && !error.message?.includes('UNAUTHENTICATED'),
    },
  });

  // Optimized cache configuration
  const cache = new NextSSRInMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Products with pagination merge
          products: {
            keyArgs: ['options', ['filter', 'sort']],
            merge(existing, incoming, { args }) {
              if (!existing || args?.options?.skip === 0) {
                return incoming;
              }
              return {
                ...incoming,
                items: [...(existing.items || []), ...(incoming.items || [])],
              };
            },
          },
          // Search results
          search: {
            keyArgs: ['input', ['term', 'facetValueFilters', 'sort']],
            merge(existing, incoming, { args }) {
              if (!existing || args?.input?.skip === 0) {
                return incoming;
              }
              return {
                ...incoming,
                items: [...(existing.items || []), ...(incoming.items || [])],
              };
            },
          },
          // Collections - cache by slug
          collection: {
            keyArgs: ['slug'],
          },
          // Product - cache by slug
          product: {
            keyArgs: ['slug'],
          },
          // Categories list
          collections: {
            keyArgs: ['options', ['filter']],
          },
          // Active order - never cache stale data
          activeOrder: {
            merge: true,
          },
          // Customer data
          activeCustomer: {
            merge: true,
          },
        },
      },
      // Normalize by ID for efficient updates
      Product: {
        keyFields: ['id'],
        fields: {
          variants: {
            merge: false, // Always replace variants
          },
        },
      },
      ProductVariant: {
        keyFields: ['id'],
      },
      Collection: {
        keyFields: ['id'],
      },
      Order: {
        keyFields: ['id'],
        fields: {
          lines: {
            merge: false,
          },
        },
      },
      OrderLine: {
        keyFields: ['id'],
      },
      Customer: {
        keyFields: ['id'],
        fields: {
          addresses: {
            merge: false,
          },
          orders: {
            merge: false,
          },
        },
      },
      Address: {
        keyFields: ['id'],
      },
      Facet: {
        keyFields: ['id'],
      },
      FacetValue: {
        keyFields: ['id'],
      },
      Asset: {
        keyFields: ['id'],
      },
    },
  });

  // Build link chain
  const linkChain = typeof window === 'undefined'
    ? from([
        new SSRMultipartLink({ stripDefer: true }),
        errorLink,
        authLink,
        httpLink,
      ])
    : from([
        errorLink,
        retryLink,
        authLink,
        httpLink,
      ]);

  return new NextSSRApolloClient({
    cache,
    link: linkChain,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
      },
      query: {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  });
}

export function ApolloWrapper({
  children,
  locale = 'fr',
}: React.PropsWithChildren<{ locale?: string }>) {
  return (
    <ApolloNextAppProvider makeClient={() => makeClient(locale)}>
      {children}
    </ApolloNextAppProvider>
  );
}
