import { useState, useEffect } from 'react';

const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    const checkIfInstalled = () => {
      // Vérifier si l'app est en mode standalone (installée)
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }
      
      // Vérifier si l'app est ajoutée à l'écran d'accueil sur iOS
      if (window.navigator.standalone === true) {
        setIsInstalled(true);
        return true;
      }
      
      return false;
    };

    // Vérifier si l'utilisateur a déjà vu le prompt d'installation
    const hasSeenInstallPrompt = localStorage.getItem('pwa-install-prompt-seen');
    const hasDismissedPrompt = localStorage.getItem('pwa-install-prompt-dismissed');
    const hasAcceptedInstall = localStorage.getItem('pwa-install-accepted');
    
    // Si l'utilisateur a déjà accepté l'installation, ne pas re-afficher
    if (hasAcceptedInstall === 'true') {
      console.log('[PWA_INSTALL] App déjà acceptée par l\'utilisateur');
      setIsInstalled(true);
      return;
    }
    
    // Si l'utilisateur a déjà vu le prompt ET l'a rejeté, ne pas le re-afficher
    if (hasSeenInstallPrompt === 'true' && hasDismissedPrompt === 'true') {
      console.log('[PWA_INSTALL] Prompt déjà rejeté par l\'utilisateur, pas d\'affichage');
      return;
    }

    // Vérifier si l'app est déjà installée
    if (checkIfInstalled()) {
      console.log('[PWA_INSTALL] App déjà installée');
      return;
    }

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      console.log('[PWA_INSTALL] beforeinstallprompt déclenché');
      
      // Empêcher l'affichage automatique du prompt
      e.preventDefault();
      
      // Vérifier à nouveau les préférences avant d'afficher
      const hasSeenInstallPrompt = localStorage.getItem('pwa-install-prompt-seen');
      const hasDismissedPrompt = localStorage.getItem('pwa-install-prompt-dismissed');
      const hasAcceptedInstall = localStorage.getItem('pwa-install-accepted');
      
      if (hasAcceptedInstall === 'true' || (hasSeenInstallPrompt === 'true' && hasDismissedPrompt === 'true')) {
        console.log('[PWA_INSTALL] Prompt déjà géré par l\'utilisateur - pas d\'affichage');
        return;
      }
      
      // Sauvegarder l'événement pour l'utiliser plus tard
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // Afficher notre prompt personnalisé après un délai
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000); // Attendre 3 secondes après le chargement de la page
    };

    // Écouter l'événement appinstalled
    const handleAppInstalled = () => {
      console.log('[PWA_INSTALL] App installée avec succès');
      setIsInstalled(true);
      setIsInstallable(false);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      
      // Marquer que l'utilisateur a installé l'app
      localStorage.setItem('pwa-installed', 'true');
      localStorage.setItem('pwa-install-date', Date.now().toString());
    };

    // Ajouter les écouteurs d'événements
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Nettoyage
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Fonction pour déclencher l'installation
  const installApp = async () => {
    if (!deferredPrompt) {
      console.log('[PWA_INSTALL] Pas de prompt d\'installation disponible');
      return false;
    }

    try {
      console.log('[PWA_INSTALL] Déclenchement de l\'installation...');
      
      // Afficher le prompt d'installation
      deferredPrompt.prompt();
      
      // Attendre la réponse de l'utilisateur
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('[PWA_INSTALL] Résultat de l\'installation:', outcome);
      
      if (outcome === 'accepted') {
        console.log('[PWA_INSTALL] ✅ Installation acceptée');
        setIsInstalled(true);
        setShowInstallPrompt(false);
        
        // Marquer que l'utilisateur a accepté l'installation
        localStorage.setItem('pwa-install-accepted', 'true');
        localStorage.setItem('pwa-install-date', Date.now().toString());
      } else {
        console.log('[PWA_INSTALL] ❌ Installation refusée');
        
        // Marquer que l'utilisateur a refusé l'installation
        localStorage.setItem('pwa-install-declined', 'true');
        localStorage.setItem('pwa-install-declined-date', Date.now().toString());
      }
      
      // Nettoyer le prompt
      setDeferredPrompt(null);
      setIsInstallable(false);
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('[PWA_INSTALL] Erreur lors de l\'installation:', error);
      return false;
    }
  };

  // Fonction pour fermer le prompt
  const dismissInstallPrompt = () => {
    console.log('[PWA_INSTALL] Prompt d\'installation fermé');
    setShowInstallPrompt(false);
    
    // Marquer que l'utilisateur a vu le prompt et l'a rejeté
    localStorage.setItem('pwa-install-prompt-seen', 'true');
    localStorage.setItem('pwa-install-prompt-dismissed', 'true');
    console.log('[PWA_INSTALL] Prompt d\'installation rejeté par l\'utilisateur');
  };

  // Fonction pour vérifier si l'app peut être installée
  const canInstall = () => {
    return isInstallable && !isInstalled && deferredPrompt !== null;
  };

  return {
    isInstallable,
    isInstalled,
    showInstallPrompt,
    canInstall: canInstall(),
    installApp,
    dismissInstallPrompt
  };
};

export default usePWAInstall;
