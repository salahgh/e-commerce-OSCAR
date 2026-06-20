import { ApolloClient, ApolloLink, InMemoryCache, Observable, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
// Inline multipart upload link (graphql-multipart-request-spec). Emits multipart/form-data
// when a request contains a File/Blob/RN-file variable, and falls back to a normal JSON POST
// otherwise — replaces apollo-upload-client, which is incompatible with Apollo Client v4 +
// Metro's resolver. Required for the updateCustomerAvatar mutation.
import { createRNUploadLink } from './uploadLink';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import i18n from '../i18n';
import { createPersistor } from './persistence';

export const VENDURE_TOKEN_KEY = 'vendure_token';

// Web fallback for expo-secure-store (not available on web)
const tokenStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
};

// HTTP Link
const GRAPHQL_URI = process.env.EXPO_PUBLIC_GRAPHQL_URL || Constants.expoConfig?.extra?.graphqlUrl || 'http://leqta.com:8085/shop-api';

// Upload-capable terminal link. Behaves exactly like an HttpLink for normal operations
// but switches to a multipart request (graphql-multipart-request-spec) when variables
// contain a file, which is required for the updateCustomerAvatar mutation.
const httpLink = createRNUploadLink({
  uri: GRAPHQL_URI,
  credentials: 'include',
});

// Resolve the active language as a Vendure LanguageCode (en/fr/ar). Vendure reads content
// translations (product/collection names…) from the `languageCode` URL param — NOT the
// Accept-Language header — so without this everything falls back to the default (English).
function activeLanguageCode(): 'en' | 'fr' | 'ar' {
  const base = (i18n.language || 'fr').split('-')[0];
  return base === 'en' || base === 'ar' ? base : 'fr';
}

// Auth Link - Add vendure-token header + languageCode URL param for translated content
const authLink = setContext(async (_, { headers }) => {
  const uri = `${GRAPHQL_URI}?languageCode=${activeLanguageCode()}`;
  try {
    const token = await tokenStorage.getItem(VENDURE_TOKEN_KEY);
    return {
      uri,
      headers: {
        ...headers,
        'Accept-Language': i18n.language || 'fr',
        ...(token ? { 'vendure-token': token } : {}),
      },
    };
  } catch (error) {
    console.error('Error getting vendure token from secure store:', error);
    return { uri, headers };
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
            tokenStorage.setItem(VENDURE_TOKEN_KEY, token).catch((err) => {
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
export const cache = new InMemoryCache({
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

// Cache persistence (cold-start read survival). Restore is driven by the
// `useApolloPersistence` bootstrap hook; purge runs on logout.
export const cachePersistor = createPersistor(cache);

export async function purgeApolloCache(): Promise<void> {
  await cachePersistor.purge();
}
