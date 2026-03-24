// Service Worker for OSCAR Fashion PWA
const CACHE_NAME = 'oscar-v1';
const STATIC_CACHE = 'oscar-static-v1';
const DYNAMIC_CACHE = 'oscar-dynamic-v1';
const IMAGE_CACHE = 'oscar-images-v1';
const API_CACHE = 'oscar-api-v1';

// Static assets to cache immediately (only files that definitely exist)
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

// Cache size limits
const CACHE_LIMITS = {
  images: 100,
  dynamic: 50,
  api: 30,
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      console.log('[SW] Caching static assets');
      // Cache each asset individually to handle failures gracefully
      for (const url of STATIC_ASSETS) {
        try {
          await cache.add(url);
        } catch (error) {
          console.warn('[SW] Failed to cache:', url, error);
        }
      }
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name.startsWith('oscar-') &&
                   ![STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, API_CACHE].includes(name);
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests except for images
  if (url.origin !== location.origin && !isImageRequest(request)) return;

  // Handle different request types
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isImageRequest(request)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, CACHE_LIMITS.images));
  } else if (isAPIRequest(request)) {
    event.respondWith(networkFirst(request, API_CACHE, CACHE_LIMITS.api));
  } else if (isPageRequest(request)) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE, CACHE_LIMITS.dynamic));
  } else {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
  }
});

// Check request types
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|woff2?|ttf|eot)$/) ||
         url.pathname.startsWith('/_next/static/');
}

function isImageRequest(request) {
  const url = new URL(request.url);
  return request.destination === 'image' ||
         url.pathname.match(/\.(png|jpg|jpeg|gif|webp|avif|svg|ico)$/) ||
         url.pathname.startsWith('/_next/image');
}

function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') ||
         url.pathname.includes('shop-api') ||
         url.pathname.includes('graphql');
}

function isPageRequest(request) {
  return request.mode === 'navigate' ||
         request.headers.get('accept')?.includes('text/html');
}

// Cache strategies
async function cacheFirst(request, cacheName, limit) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      if (limit) {
        limitCacheSize(cacheName, limit);
      }
    }
    return response;
  } catch (error) {
    // Return offline fallback for pages
    if (isPageRequest(request)) {
      const offlinePage = await caches.match('/');
      if (offlinePage) return offlinePage;
    }
    throw error;
  }
}

async function networkFirst(request, cacheName, limit) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      if (limit) {
        limitCacheSize(cacheName, limit);
      }
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    // Return offline fallback for pages
    if (isPageRequest(request)) {
      const offlinePage = await caches.match('/');
      if (offlinePage) return offlinePage;
    }
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}

// Limit cache size
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxSize) {
    // Delete oldest entries (FIFO)
    const toDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(toDelete.map((key) => cache.delete(key)));
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCart());
  }
});

async function syncCart() {
  // Implement cart sync logic when back online
  const db = await openDB();
  const pendingActions = await db.getAll('pending-cart-actions');

  for (const action of pendingActions) {
    try {
      await fetch('/api/cart', {
        method: 'POST',
        body: JSON.stringify(action),
        headers: { 'Content-Type': 'application/json' },
      });
      await db.delete('pending-cart-actions', action.id);
    } catch (error) {
      console.error('[SW] Failed to sync cart action:', error);
    }
  }
}

// Push notifications (for order updates)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Focus existing window if open
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Message handler for cache management
self.addEventListener('message', (event) => {
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((names) =>
        Promise.all(names.map((name) => caches.delete(name)))
      )
    );
  }

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
