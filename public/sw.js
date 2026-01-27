// Service Worker for FastFood PWA
const CACHE_NAME = 'fastfood-v1';
const STATIC_CACHE = 'fastfood-static-v1';
const API_CACHE = 'fastfood-api-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/login',
  '/register',
  '/order',
  '/manifest.json',
  '/favicon.ico',
  '/next.svg',
  '/globals.css',
];

// API endpoints to cache
const API_ENDPOINTS = ['/api/products', '/api/orders'];

// Install event - cache static assets
self.addEventListener('install', function (event) {
  console.log('Service Worker: Installing');

  event.waitUntil(
    caches.open(STATIC_CACHE).then(function (cache) {
      console.log('Service Worker: Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );

  // Force activation
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', function (event) {
  console.log('Service Worker: Activating');

  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Take control of all clients
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', function (event) {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external requests
  if (!url.origin.includes(self.location.origin)) return;

  // Handle API requests with network-first strategy
  if (
    API_ENDPOINTS.some(function (endpoint) {
      return url.pathname.startsWith(endpoint);
    })
  ) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Handle static assets with cache-first strategy
  if (
    STATIC_ASSETS.includes(url.pathname) ||
    url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)
  ) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Default: try cache first, then network
  event.respondWith(cacheFirstStrategy(request));
});

// Cache-first strategy
function cacheFirstStrategy(request) {
  return caches.match(request).then(function (cachedResponse) {
    if (cachedResponse) {
      return cachedResponse;
    }

    return fetch(request)
      .then(function (networkResponse) {
        if (networkResponse.ok) {
          caches.open(STATIC_CACHE).then(function (cache) {
            cache.put(request, networkResponse.clone());
          });
        }
        return networkResponse;
      })
      .catch(function (error) {
        console.error('Cache-first strategy failed:', error);

        // Return offline fallback for navigation requests
        if (request.mode === 'navigate') {
          return caches.open(STATIC_CACHE).then(function (cache) {
            return (
              cache.match('/') ||
              new Response('Offline - Please check your connection', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'text/plain' },
              })
            );
          });
        }

        throw error;
      });
  });
}

// Network-first strategy for API calls
function networkFirstStrategy(request) {
  return fetch(request)
    .then(function (networkResponse) {
      // Cache successful API responses
      if (networkResponse.ok) {
        caches.open(API_CACHE).then(function (cache) {
          cache.put(request, networkResponse.clone());
        });
      }
      return networkResponse;
    })
    .catch(function (error) {
      console.log('Network request failed, trying cache:', error);

      // Try to return cached version
      return caches.match(request).then(function (cachedResponse) {
        if (cachedResponse) {
          return cachedResponse;
        }

        // Return offline message for API calls
        return new Response(
          JSON.stringify({
            success: false,
            error: { message: 'You are offline. Please check your connection.' },
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      });
    });
}

// Handle background sync for offline orders
self.addEventListener('sync', function (event) {
  if (event.tag === 'background-sync-orders') {
    event.waitUntil(syncPendingOrders());
  }
});

// Background sync function for offline orders
function syncPendingOrders() {
  console.log('Service Worker: Syncing pending orders');

  // Get pending orders from localStorage (simplified approach)
  // In production, consider using IndexedDB for better storage
  var pendingOrders = [];
  try {
    var stored = localStorage.getItem('fastfood_offline_orders');
    if (stored) {
      pendingOrders = JSON.parse(stored).filter(function (order) {
        return order.status === 'pending';
      });
    }
  } catch (error) {
    console.error('Error reading offline orders:', error);
    return;
  }

  if (pendingOrders.length === 0) {
    console.log('No pending orders to sync');
    return;
  }

  console.log('Found', pendingOrders.length, 'pending orders to sync');

  // Process each pending order
  var syncPromises = pendingOrders.map(function (order) {
    return fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: order.items,
        total: order.total,
      }),
    })
      .then(function (response) {
        if (response.ok) {
          console.log('Successfully synced order:', order.id);
          // Remove from localStorage
          removeOfflineOrder(order.id);
          return true;
        } else {
          console.error('Failed to sync order:', order.id, response.status);
          return false;
        }
      })
      .catch(function (error) {
        console.error('Error syncing order:', order.id, error);
        return false;
      });
  });

  return Promise.all(syncPromises).then(function (results) {
    var successCount = results.filter(Boolean).length;
    console.log('Sync complete:', successCount, 'of', pendingOrders.length, 'orders synced');

    // Send notification about sync results
    if (successCount > 0) {
      self.registration.showNotification('Orders Synced', {
        body: successCount + ' offline order(s) have been submitted successfully.',
        icon: '/next.svg',
        badge: '/favicon.ico',
      });
    }
  });
}

// Helper function to remove order from localStorage
function removeOfflineOrder(orderId) {
  try {
    var stored = localStorage.getItem('fastfood_offline_orders');
    if (stored) {
      var orders = JSON.parse(stored);
      var updatedOrders = orders.filter(function (order) {
        return order.id !== orderId;
      });
      localStorage.setItem('fastfood_offline_orders', JSON.stringify(updatedOrders));
    }
  } catch (error) {
    console.error('Error removing offline order:', error);
  }
}

// Background sync function for offline orders
function syncPendingOrders() {
  console.log('Service Worker: Syncing pending orders');

  // TODO: Implement order synchronization
  // This would check for pending orders in IndexedDB
  // and attempt to submit them when connection is restored
}

// Handle push notifications (placeholder for future implementation)
self.addEventListener('push', function (event) {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/next.svg',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle notification clicks
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  event.waitUntil(self.clients.openWindow(event.notification.data.url));
});
