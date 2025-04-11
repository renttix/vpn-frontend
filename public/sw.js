/**
 * Service Worker for Push Notifications
 * 
 * This service worker handles push notifications for the VPN News website.
 * It receives push events from the server and displays notifications to the user.
 */

// Cache name for offline support
const CACHE_NAME = 'vpn-news-cache-v1';

// Install event - cache essential files for offline support
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing');
  
  // Skip waiting to ensure the new service worker activates immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/offline',
        '/logo.png'
      ]);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating');
  
  // Claim clients to ensure the service worker controls all clients immediately
  event.waitUntil(self.clients.claim());
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  let data = {};
  
  // Parse the push data
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Service Worker: Error parsing push data', e);
      data = {
        title: 'New Notification',
        body: event.data.text(),
        icon: '/logo.png',
        url: '/'
      };
    }
  }
  
  // Default notification options
  const options = {
    body: data.body || 'New content available',
    icon: data.icon || '/logo.png',
    badge: '/logo-small.png',
    data: {
      url: data.url || '/'
    },
    timestamp: data.timestamp ? new Date(data.timestamp).getTime() : Date.now(),
    vibrate: [100, 50, 100],
    actions: [
      {
        action: 'view',
        title: 'View'
      }
    ]
  };
  
  // Show the notification
  event.waitUntil(
    self.registration.showNotification(data.title || 'VPN News', options)
  );
});

// Notification click event - handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.notification.data);
  
  // Close the notification
  event.notification.close();
  
  // Get the URL to open
  const url = event.notification.data.url || '/';
  
  // Open the URL in a new window/tab or focus an existing one
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no window/tab is open with the URL, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Fetch event - handle offline support
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip non-HTTP(S) requests
  if (!event.request.url.startsWith('http')) return;
  
  // Network-first strategy for most requests
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // If network request fails, try to serve from cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // If not in cache, serve the offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline');
            }
            
            // Otherwise, just return a 404
            return new Response('Not found', { status: 404 });
          });
      })
  );
});
