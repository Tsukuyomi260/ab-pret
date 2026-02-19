importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBDWP7wZ1vx_2VjgHjNJ7AxaoRvs9Obf3Y",
  authDomain: "ab-campus-notif.firebaseapp.com",
  projectId: "ab-campus-notif",
  storageBucket: "ab-campus-notif.firebasestorage.app",
  messagingSenderId: "436866264113",
  appId: "1:436866264113:web:46f56ed7745a8c770df910"
});

const messaging = firebase.messaging();

// Cache pour éviter les doublons (stocké en mémoire du service worker)
// Structure: { notificationId: timestamp }
const notificationCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Nettoyer le cache toutes les 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, timestamp] of notificationCache.entries()) {
    if (now - timestamp > CACHE_DURATION) {
      notificationCache.delete(id);
    }
  }
}, 10 * 60 * 1000);

messaging.onBackgroundMessage(async (payload) => {
  console.log('[SW] Message reçu en arrière-plan:', payload);
  
  // ⚠️ PROTECTION CONTRE LES DOUBLONS : Créer un ID unique et stable basé sur les données
  const data = payload.data || {};
  // Pour les remboursements : utiliser payment_id (unique et stable)
  // Pour les autres : utiliser loanId + type, ou type + userId
  const notificationId = data.payment_id 
    ? `payment-${data.payment_id}`
    : (data.loanId || data.loan_id)
      ? `loan-${data.loanId || data.loan_id}-${data.type || 'default'}`
      : `notif-${data.type || 'default'}-${data.userId || 'unknown'}-${Date.now()}`;
  
  const now = Date.now();
  
  // ⚠️ PROTECTION 1 : Vérifier dans le cache EN PREMIER (le plus rapide)
  const cachedTimestamp = notificationCache.get(notificationId);
  if (cachedTimestamp && (now - cachedTimestamp) < CACHE_DURATION) {
    console.log('[SW] ⚠️ Notification déjà affichée récemment (cache), évite doublon:', notificationId);
    return; // Ne pas afficher de doublon
  }
  
  // ⚠️ PROTECTION 2 : Vérifier toutes les notifications système existantes (pas seulement par tag)
  try {
    const allNotifications = await self.registration.getNotifications();
    
    // Vérifier si une notification avec le même contenu existe déjà
    const duplicateFound = allNotifications.some(notif => {
      // Vérifier par tag
      if (notif.tag === notificationId) return true;
      
      // Vérifier par données (payment_id, loanId, etc.)
      const notifData = notif.data || {};
      if (data.payment_id && notifData.payment_id === data.payment_id) return true;
      if ((data.loanId || data.loan_id) && (notifData.loanId === (data.loanId || data.loan_id) || notifData.loan_id === (data.loanId || data.loan_id))) {
        // Vérifier aussi que c'est le même type et que c'est récent (moins de 5 min)
        if (notifData.type === data.type && notif.timestamp && (now - notif.timestamp) < CACHE_DURATION) {
          return true;
        }
      }
      return false;
    });
    
    if (duplicateFound) {
      console.log('[SW] ⚠️ Notification déjà affichée (système), évite doublon:', notificationId);
      // Mettre à jour le cache
      notificationCache.set(notificationId, now);
      return; // Ne pas afficher de doublon
    }
  } catch (error) {
    console.error('[SW] Erreur vérification notifications existantes:', error);
    // En cas d'erreur, vérifier quand même le cache
    if (cachedTimestamp && (now - cachedTimestamp) < CACHE_DURATION) {
      return; // Ne pas afficher si déjà dans le cache
    }
  }
  
  // ⚠️ PROTECTION 3 : Ajouter au cache AVANT d'afficher (pour éviter les doublons simultanés)
  notificationCache.set(notificationId, now);
  
  const notificationTitle = payload.notification?.title || 'AB Campus Finance';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/logo192.png',
    badge: '/logo192.png',
    image: '/logo512.png',
    sound: 'default',
    vibrate: [200, 100, 200],
    requireInteraction: false,
    tag: notificationId, // Tag unique pour éviter les doublons
    data: {
      ...data,
      notificationId: notificationId,
      timestamp: now.toString()
    },
    timestamp: now
  };

  console.log('[SW] ✅ Affichage notification:', notificationId);
  self.registration.showNotification(notificationTitle, notificationOptions);
});
