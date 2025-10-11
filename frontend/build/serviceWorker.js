// Service Worker pour les mises à jour automatiques
const CACHE_NAME = 'ab-campus-finance-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
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
        console.log('[SW] Service worker installé avec succès');
        // Forcer l'activation immédiate
        return self.skipWaiting();
      })
  );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation du service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service worker activé avec succès');
      // Prendre le contrôle immédiatement
      return self.clients.claim();
    })
  );
});

// Interception des requêtes réseau
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retourner la réponse en cache si elle existe
        if (response) {
          return response;
        }
        
        // Sinon, faire la requête réseau
        return fetch(event.request);
      }
    )
  );
});

// Écouter les messages de mise à jour
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ===== NOTIFICATIONS PUSH =====

// Écouter les événements push
self.addEventListener("push", (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon || "/logo192.png",
    badge: data.badge || "/logo192.png",
    vibrate: data.vibrate || [200, 50, 100],
    data: data.data || {}
  });
});

// Gérer les clics sur les notifications
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  
  // Récupérer l'URL depuis les données de la notification
  const url = event.notification.data?.url || "/";
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // Si l'app est déjà ouverte, naviguer vers l'URL
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Sinon, ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
