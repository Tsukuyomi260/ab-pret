// Service Worker simple pour AB Campus Finance
// La version du cache est mise à jour automatiquement lors du build
const CACHE_NAME = 'ab-campus-finance-v2.0.0';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/version.json',
  '/logo192.png',
  '/logo512.png'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation du service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache ouvert, ajout des fichiers...');
        return cache.addAll(urlsToCache).catch((error) => {
          console.log('[SW] Erreur lors de la mise en cache:', error);
          // Continuer même si certains fichiers ne peuvent pas être mis en cache
          return Promise.resolve();
        });
      })
      .then(() => {
        console.log('[SW] Installation terminée');
        // Forcer l'activation immédiate
        return self.skipWaiting();
      })
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation du service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activation terminée');
      // Prendre le contrôle immédiatement
      return self.clients.claim();
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  // Ne pas intercepter les requêtes vers l'API backend
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('supabase') ||
      event.request.url.includes('fedapay')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retourner la version en cache si disponible
        if (response) {
          console.log('[SW] Ressource trouvée en cache:', event.request.url);
          return response;
        }

        // Sinon, faire la requête réseau
        console.log('[SW] Requête réseau:', event.request.url);
        return fetch(event.request).catch(() => {
          // En cas d'erreur réseau, retourner une page d'erreur si c'est une navigation
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

// Gestion des messages
self.addEventListener('message', (event) => {
  console.log('[SW] Message reçu:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  console.log('[SW] Notification push reçue');
  
  if (event.data) {
    const data = event.data.json();
    console.log('[SW] Données de notification:', data);
    
    const options = {
      body: data.body || 'Nouvelle notification',
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: data.tag || 'ab-campus-finance',
      data: data.data || {},
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'AB Campus Finance', options)
    );
  }
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Clic sur notification:', event.notification.tag);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si une fenêtre est déjà ouverte, la focus
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Sinon, ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

console.log('[SW] Service Worker chargé');