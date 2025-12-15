'use client';

import { ApolloLink, HttpLink } from '@apollo/client';
import {
  ApolloNextAppProvider,
  NextSSRInMemoryCache,
  NextSSRApolloClient,
  SSRMultipartLink,
} from '@apollo/experimental-nextjs-app-support/ssr';
import { setContext } from '@apollo/client/link/context';

function makeClient() {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8085/shop-api',
    credentials: 'include', // Required for Vendure session cookies
    fetchOptions: { cache: 'no-store' },
  });

  const authLink = setContext((_, { headers }) => {
    let token = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token');
    }

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  return new NextSSRApolloClient({
    cache: new NextSSRInMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            products: {
              keyArgs: false, // Don't cache by arguments, we handle pagination manually
              merge(existing, incoming, { args }) {
                // If skip is 0, this is a fresh query, return incoming
                if (!existing || args?.options?.skip === 0) {
                  return incoming;
                }
                // Otherwise merge items for infinite scroll
                return {
                  ...incoming,
                  items: [...(existing.items || []), ...(incoming.items || [])],
                };
              },
            },
          },
        },
      },
    }),
    link:
      typeof window === 'undefined'
        ? ApolloLink.from([
            new SSRMultipartLink({
              stripDefer: true,
            }),
            authLink,
            httpLink,
          ])
        : ApolloLink.from([authLink, httpLink]),
  });
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
