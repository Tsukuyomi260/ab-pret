/**
 * Utilitaire pour gérer le cache de l'application
 * Permet de forcer le rechargement en cas de mise à jour
 */

const APP_VERSION = '2.0.0';
const VERSION_KEY = 'ab_app_version';

/**
 * Vérifie si l'application a été mise à jour
 * et force un rechargement du cache si nécessaire
 */
export const checkAndClearCache = () => {
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    
    if (storedVersion !== APP_VERSION) {
      console.log('[CACHE] Nouvelle version détectée:', APP_VERSION, '(ancienne:', storedVersion, ')');
      
      // Mettre à jour la version
      localStorage.setItem(VERSION_KEY, APP_VERSION);
      
      // Nettoyer le cache de l'application
      clearApplicationCache();
      
      // Afficher un message à l'utilisateur
      console.log('[CACHE] Cache nettoyé pour la version', APP_VERSION);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[CACHE] Erreur lors de la vérification de version:', error);
    return false;
  }
};

/**
 * Nettoie le cache de l'application
 */
export const clearApplicationCache = async () => {
  try {
    // 1. Nettoyer le localStorage (sauf les données utilisateur essentielles)
    const essentialKeys = ['ab_user_cache', 'supabase.auth.token'];
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
      if (!essentialKeys.some(essential => key.includes(essential))) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('[CACHE] localStorage nettoyé (sauf données essentielles)');
    
    // 2. Nettoyer le sessionStorage
    sessionStorage.clear();
    console.log('[CACHE] sessionStorage nettoyé');
    
    // 3. Nettoyer le cache du Service Worker si disponible
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log('[CACHE] Suppression du cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
      console.log('[CACHE] Cache Service Worker nettoyé');
    }
    
    // 4. Désinscrire les anciens Service Workers si nécessaire
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        await registration.unregister();
        console.log('[CACHE] Service Worker désinscrit');
      }
    }
    
    return true;
  } catch (error) {
    console.error('[CACHE] Erreur lors du nettoyage du cache:', error);
    return false;
  }
};

/**
 * Force un rechargement complet de l'application
 * (sans cache)
 */
export const forceReload = () => {
  console.log('[CACHE] Rechargement forcé de l\'application...');
  
  // Recharger en contournant le cache
  if (window.location.reload) {
    window.location.reload(true); // true = bypass cache
  } else {
    // Fallback pour les navigateurs modernes
    window.location.href = window.location.href;
  }
};

/**
 * Obtenir la version actuelle de l'application
 */
export const getAppVersion = () => APP_VERSION;

/**
 * Vérifier si le cache doit être nettoyé au démarrage
 */
export const initCacheManagement = () => {
  const wasUpdated = checkAndClearCache();
  
  if (wasUpdated) {
    console.log('[CACHE] ✅ Application mise à jour vers la version', APP_VERSION);
    
    // Optionnel : afficher un message à l'utilisateur
    // Vous pouvez utiliser un toast ou une notification
    
    return true;
  }
  
  console.log('[CACHE] Application à jour (version', APP_VERSION, ')');
  return false;
};

export default {
  checkAndClearCache,
  clearApplicationCache,
  forceReload,
  getAppVersion,
  initCacheManagement
};


