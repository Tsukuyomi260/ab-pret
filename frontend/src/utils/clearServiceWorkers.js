// Script pour nettoyer les Service Workers existants

export const clearAllServiceWorkers = async () => {
  if (!('serviceWorker' in navigator)) {
    console.log('[CLEAR_SW] Service Worker non supporté');
    return;
  }

  try {
    console.log('[CLEAR_SW] 🧹 Nettoyage des Service Workers...');
    
    // Récupérer tous les enregistrements
    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log(`[CLEAR_SW] ${registrations.length} Service Worker(s) trouvé(s)`);
    
    // Désenregistrer tous les Service Workers
    await Promise.all(registrations.map(registration => {
      console.log(`[CLEAR_SW] Désenregistrement: ${registration.scope}`);
      return registration.unregister();
    }));
    
    console.log('[CLEAR_SW] ✅ Tous les Service Workers ont été désenregistrés');
    
    // Nettoyer les caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log(`[CLEAR_SW] ${cacheNames.length} cache(s) trouvé(s)`);
      
      await Promise.all(cacheNames.map(cacheName => {
        console.log(`[CLEAR_SW] Suppression du cache: ${cacheName}`);
        return caches.delete(cacheName);
      }));
      
      console.log('[CLEAR_SW] ✅ Tous les caches ont été supprimés');
    }
    
    return true;
  } catch (error) {
    console.error('[CLEAR_SW] ❌ Erreur lors du nettoyage:', error);
    return false;
  }
};

// Fonction pour vérifier l'état des Service Workers
export const checkServiceWorkerStatus = async () => {
  if (!('serviceWorker' in navigator)) {
    return { supported: false, message: 'Service Worker non supporté' };
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    const controller = navigator.serviceWorker.controller;
    
    return {
      supported: true,
      registrations: registrations.length,
      hasController: !!controller,
      scope: controller?.scope || 'Aucun',
      state: controller?.state || 'Aucun'
    };
  } catch (error) {
    return { supported: true, error: error.message };
  }
};

