import { ApolloClient, ApolloLink, InMemoryCache, Observable, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import i18n from '../i18n';

export const VENDURE_TOKEN_KEY = 'vendure_token';

// HTTP Link
const GRAPHQL_URI = process.env.EXPO_PUBLIC_GRAPHQL_URL || Constants.expoConfig?.extra?.graphqlUrl || 'http://leqta.com:8085/shop-api';

const httpLink = createHttpLink({
  uri: GRAPHQL_URI,
  credentials: 'include',
});

// Auth Link - Add vendure-token header for session authentication
const authLink = setContext(async (_, { headers }) => {
  try {
    const token = await SecureStore.getItemAsync(VENDURE_TOKEN_KEY);
    return {
      headers: {
        ...headers,
        'Accept-Language': i18n.language || 'fr',
        ...(token ? { 'vendure-token': token } : {}),
      },
    };
  } catch (error) {
    console.error('Error getting vendure token from secure store:', error);
    return { headers };
  }
});

// Fix Windows backslashes in asset URLs (Vendure on Windows generates paths with \)
function fixAssetUrls(obj: any): any {
  if (obj == null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(fixAssetUrls);
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if ((key === 'preview' || key === 'source') && typeof val === 'string') {
      result[key] = val.replace(/\\/g, '/');
    } else if (typeof val === 'object') {
      result[key] = fixAssetUrls(val);
    } else {
      result[key] = val;
    }
  }
  return result;
}

// Afterware Link - Capture vendure-token + fix asset URLs
const afterwareLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    const subscription = forward(operation).subscribe({
      next: (response) => {
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

        // Fix backslashes in all asset URLs
        if (response.data) {
          response.data = fixAssetUrls(response.data);
        }

        observer.next(response);
      },
      error: (err) => observer.error(err),
      complete: () => observer.complete(),
    });

    return () => subscription.unsubscribe();
  });
});

// Error Link - Handle GraphQL and network errors
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  console.log(`[Apollo] Operation: ${operation.operationName}`);
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(locations)}, Path: ${path}`);
    });
  }

  if (networkError) {
    console.error(`[Network error]: name=${networkError.name}, message=${networkError.message}, stack=${networkError.stack}`);
  }
});

// InMemory Cache configuration for Vendure
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // Vendure uses 'search' for product search with pagination
        search: {
          keyArgs: ['input', ['term', 'facetValueIds', 'collectionSlug', 'groupByProduct']],
          merge(existing, incoming, { args }) {
            const skip = args?.input?.skip ?? 0;
            if (!existing || skip === 0) return incoming;
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
