// Script pour nettoyer complètement tous les caches et forcer un refresh
export const clearAllCache = () => {
  console.log('[CLEAR_ALL_CACHE] 🧹 Début du nettoyage complet...');
  
  try {
    // 1. Nettoyer localStorage (sauf les éléments essentiels)
    const essentialKeys = ['push_subscription']; // Garder l'abonnement push
    const currentLocalStorage = { ...localStorage };
    
    for (const key in currentLocalStorage) {
      if (!essentialKeys.includes(key)) {
        localStorage.removeItem(key);
        console.log(`[CLEAR_ALL_CACHE] 🗑️ Supprimé localStorage: ${key}`);
      }
    }
    
    // 2. Nettoyer sessionStorage
    sessionStorage.clear();
    console.log('[CLEAR_ALL_CACHE] 🗑️ sessionStorage nettoyé');
    
    // 3. Nettoyer les caches du navigateur
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
          console.log(`[CLEAR_ALL_CACHE] 🗑️ Cache supprimé: ${cacheName}`);
        });
      });
    }
    
    // 4. Forcer un rechargement complet
    console.log('[CLEAR_ALL_CACHE] 🔄 Rechargement de la page...');
    window.location.reload(true);
    
  } catch (error) {
    console.error('[CLEAR_ALL_CACHE] ❌ Erreur lors du nettoyage:', error);
    // Forcer le rechargement même en cas d'erreur
    window.location.reload(true);
  }
};

// Fonction pour vérifier l'état du cache
export const checkCacheState = () => {
  const state = {
    localStorage: {},
    sessionStorage: {},
    cacheKeys: []
  };
  
  try {
    // Vérifier localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        state.localStorage[key] = localStorage.getItem(key);
      }
    }
    
    // Vérifier sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        state.sessionStorage[key] = sessionStorage.getItem(key);
      }
    }
    
    // Vérifier les caches
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        state.cacheKeys = cacheNames;
        console.log('[CHECK_CACHE_STATE] 📊 État du cache:', state);
      });
    }
    
    console.log('[CHECK_CACHE_STATE] 📊 État du cache:', state);
    return state;
    
  } catch (error) {
    console.error('[CHECK_CACHE_STATE] ❌ Erreur vérification cache:', error);
    return { error: error.message };
  }
};
