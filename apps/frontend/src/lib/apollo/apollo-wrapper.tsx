'use client';

import { HttpLink, from } from '@apollo/client';
import {
  ApolloNextAppProvider,
  NextSSRInMemoryCache,
  NextSSRApolloClient,
  SSRMultipartLink,
} from '@apollo/experimental-nextjs-app-support/ssr';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';

function makeClient(locale: string) {
  const baseUri = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8085/shop-api';

  // Vendure resolves content translations (product/collection names, descriptions…)
  // from the `languageCode` URL param — NOT the Accept-Language header. On the client the
  // locale can change via SPA navigation, so resolve it per request from the URL; on the
  // server use the locale passed down from the [locale] layout.
  const resolveLocale = () => {
    if (typeof window !== 'undefined') {
      const seg = window.location.pathname.split('/')[1];
      return seg === 'ar' || seg === 'en' ? seg : 'fr';
    }
    return locale;
  };

  const httpLink = new HttpLink({ uri: baseUri, credentials: 'include' });

  const authLink = setContext((_, { headers }) => {
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token');
    }
    return {
      uri: `${baseUri}?languageCode=${resolveLocale()}`,
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, extensions }) => {
        console.error(`[GraphQL error]: ${message}`);
        if (extensions?.code === 'UNAUTHENTICATED' && typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      });
    }
    if (networkError) {
      console.error(`[Network error]: ${networkError.message}`);
    }
  });

  const retryLink = new RetryLink({
    delay: { initial: 300, max: 3000, jitter: true },
    attempts: {
      max: 3,
      retryIf: (error) => !!error && !error.message?.includes('UNAUTHENTICATED'),
    },
  });

  const cache = new NextSSRInMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: {
            keyArgs: ['options', ['filter', 'sort']],
            merge(existing, incoming, { args }: any) {
              // Replace (not append) on the first page. `skip` is undefined for
              // non-paginated callers (home grid/rails), so treat missing as 0 —
              // otherwise a cache-and-network refetch concatenates onto itself.
              if (!existing || (args?.options?.skip ?? 0) === 0) return incoming;
              return { ...incoming, items: [...(existing.items || []), ...(incoming.items || [])] };
            },
          },
          search: {
            keyArgs: ['input', ['term', 'facetValueFilters', 'sort']],
            merge(existing, incoming, { args }: any) {
              if (!existing || (args?.input?.skip ?? 0) === 0) return incoming;
              return { ...incoming, items: [...(existing.items || []), ...(incoming.items || [])] };
            },
          },
          collection: { keyArgs: ['slug'] },
          product: { keyArgs: ['slug'] },
          collections: { keyArgs: ['options', ['filter']] },
          activeOrder: { merge: true },
          activeCustomer: { merge: true },
        },
      },
      Product: { keyFields: ['id'], fields: { variants: { merge: false } } },
      ProductVariant: { keyFields: ['id'] },
      Collection: {
        keyFields: ['id'],
        fields: {
          // Infinite scroll: accumulate productVariants pages (skip-based).
          // Different collections are separate cache entries (keyed by id).
          productVariants: {
            keyArgs: false,
            merge(existing: any, incoming: any, { args }: any) {
              if (!existing || (args?.options?.skip ?? 0) === 0) return incoming;
              return { ...incoming, items: [...(existing.items || []), ...(incoming.items || [])] };
            },
          },
        },
      },
      Order: { keyFields: ['id'], fields: { lines: { merge: false } } },
      OrderLine: { keyFields: ['id'] },
      Customer: {
        keyFields: ['id'],
        fields: { addresses: { merge: false }, orders: { merge: false } },
      },
      Address: { keyFields: ['id'] },
      Facet: { keyFields: ['id'] },
      FacetValue: { keyFields: ['id'] },
      Asset: { keyFields: ['id'] },
    },
  });

  const linkChain =
    typeof window === 'undefined'
      ? from([new SSRMultipartLink({ stripDefer: true }), errorLink, authLink, httpLink])
      : from([errorLink, retryLink, authLink, httpLink]);

  return new NextSSRApolloClient({
    cache,
    link: linkChain,
    defaultOptions: {
      watchQuery: { fetchPolicy: 'cache-and-network', nextFetchPolicy: 'cache-first' },
      query: { fetchPolicy: 'cache-first', errorPolicy: 'all' },
      mutate: { errorPolicy: 'all' },
    },
  });
}

export function ApolloWrapper({ children, locale }: React.PropsWithChildren<{ locale: string }>) {
  return (
    <ApolloNextAppProvider makeClient={() => makeClient(locale)}>{children}</ApolloNextAppProvider>
  );
}
