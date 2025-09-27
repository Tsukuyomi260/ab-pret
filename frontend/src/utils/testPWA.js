// Script de test pour vérifier la configuration PWA
export const testPWAConfiguration = () => {
  console.log('🔍 Test de la configuration PWA...');
  
  // Vérifier si le service worker est supporté
  if ('serviceWorker' in navigator) {
    console.log('✅ Service Worker supporté');
  } else {
    console.log('❌ Service Worker non supporté');
  }
  
  // Vérifier si l'API d'installation est disponible
  if ('beforeinstallprompt' in window) {
    console.log('✅ API d\'installation PWA disponible');
  } else {
    console.log('❌ API d\'installation PWA non disponible');
  }
  
  // Vérifier si l'app est en mode standalone
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('✅ App en mode standalone (installée)');
  } else {
    console.log('ℹ️ App en mode navigateur');
  }
  
  // Vérifier le manifest
  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (manifestLink) {
    console.log('✅ Manifest.json trouvé:', manifestLink.href);
  } else {
    console.log('❌ Manifest.json non trouvé');
  }
  
  // Vérifier les meta tags PWA
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) {
    console.log('✅ Theme color défini:', themeColor.content);
  } else {
    console.log('❌ Theme color non défini');
  }
  
  const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
  if (appleTouchIcon) {
    console.log('✅ Apple touch icon défini:', appleTouchIcon.href);
  } else {
    console.log('❌ Apple touch icon non défini');
  }
  
  // Vérifier le cache
  if ('caches' in window) {
    console.log('✅ Cache API disponible');
    caches.keys().then(cacheNames => {
      console.log('📦 Caches disponibles:', cacheNames);
    });
  } else {
    console.log('❌ Cache API non disponible');
  }
  
  console.log('🎯 Test PWA terminé');
};

// Fonction pour forcer l'affichage du prompt d'installation (pour les tests)
export const forceInstallPrompt = () => {
  console.log('🔧 Forçage de l\'affichage du prompt d\'installation...');
  
  // Simuler l'événement beforeinstallprompt
  const event = new Event('beforeinstallprompt');
  event.preventDefault = () => {};
  event.prompt = () => Promise.resolve({ outcome: 'accepted' });
  event.userChoice = Promise.resolve({ outcome: 'accepted' });
  
  window.dispatchEvent(event);
  console.log('✅ Événement beforeinstallprompt simulé');
};

// Fonction pour vérifier l'état d'installation
export const checkInstallationStatus = () => {
  const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                     window.navigator.standalone === true;
  
  const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-seen');
  const hasAccepted = localStorage.getItem('pwa-install-accepted');
  const hasDeclined = localStorage.getItem('pwa-install-declined');
  
  console.log('📊 État d\'installation:', {
    isInstalled,
    hasSeenPrompt: !!hasSeenPrompt,
    hasAccepted: !!hasAccepted,
    hasDeclined: !!hasDeclined
  });
  
  return {
    isInstalled,
    hasSeenPrompt: !!hasSeenPrompt,
    hasAccepted: !!hasAccepted,
    hasDeclined: !!hasDeclined
  };
};

// Fonction pour réinitialiser l'état d'installation (pour les tests)
export const resetInstallationState = () => {
  console.log('🔄 Réinitialisation de l\'état d\'installation...');
  
  localStorage.removeItem('pwa-install-prompt-seen');
  localStorage.removeItem('pwa-install-prompt-last-seen');
  localStorage.removeItem('pwa-install-accepted');
  localStorage.removeItem('pwa-install-declined');
  localStorage.removeItem('pwa-install-declined-date');
  localStorage.removeItem('pwa-installed');
  localStorage.removeItem('pwa-install-date');
  
  console.log('✅ État d\'installation réinitialisé');
};

// Exporter toutes les fonctions pour utilisation dans la console
if (typeof window !== 'undefined') {
  window.testPWA = {
    testConfiguration: testPWAConfiguration,
    forceInstallPrompt,
    checkInstallationStatus,
    resetInstallationState
  };
  
  console.log('🛠️ Fonctions de test PWA disponibles dans window.testPWA');
}
