// Configuration du Service Worker pour AB Campus Finance

export const SERVICE_WORKER_CONFIG = {
  // Désactiver le service worker en développement si nécessaire
  enabled: process.env.NODE_ENV === 'production' || process.env.REACT_APP_ENABLE_SW === 'true',
  
  // URL du service worker
  swUrl: '/serviceWorker.js',
  
  // Options d'enregistrement
  registrationOptions: {
    scope: '/',
    updateViaCache: 'none'
  }
};

// Fonction pour enregistrer le service worker avec gestion d'erreur
export const registerServiceWorker = async () => {
  if (!SERVICE_WORKER_CONFIG.enabled) {
    console.log('[SW_CONFIG] Service Worker désactivé en développement');
    return null;
  }

  if (!('serviceWorker' in navigator)) {
    console.log('[SW_CONFIG] Service Worker non supporté par ce navigateur');
    return null;
  }

  try {
    console.log('[SW_CONFIG] Enregistrement du Service Worker...');
    const registration = await navigator.serviceWorker.register(
      SERVICE_WORKER_CONFIG.swUrl,
      SERVICE_WORKER_CONFIG.registrationOptions
    );
    
    console.log('[SW_CONFIG] Service Worker enregistré avec succès:', registration.scope);
    
    // Gérer les mises à jour
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[SW_CONFIG] Nouvelle version du Service Worker disponible');
            // Optionnel: afficher une notification à l'utilisateur
          }
        });
      }
    });
    
    return registration;
  } catch (error) {
    console.warn('[SW_CONFIG] Échec de l\'enregistrement du Service Worker:', error);
    return null;
  }
};

// Fonction pour désenregistrer le service worker
export const unregisterServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(registration => registration.unregister()));
    console.log('[SW_CONFIG] Service Workers désenregistrés');
  } catch (error) {
    console.warn('[SW_CONFIG] Erreur lors du désenregistrement:', error);
  }
};

