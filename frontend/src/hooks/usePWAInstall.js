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

    const hasAcceptedInstall = localStorage.getItem('pwa-install-accepted');
    const dismissedAt = localStorage.getItem('pwa-install-dismissed-at');
    const lastShownAt = localStorage.getItem('pwa-install-last-shown-at');
    const COOLDOWN_AFTER_DISMISS = 30 * 24 * 60 * 60 * 1000; // 30 jours
    const COOLDOWN_BETWEEN_SHOWS = 7 * 24 * 60 * 60 * 1000;  // 7 jours entre affichages

    // Déjà installé ou accepté → jamais réafficher
    if (hasAcceptedInstall === 'true') {
      setIsInstalled(true);
      return;
    }

    // Rejeté il y a moins de 30 jours → ne pas réafficher
    if (dismissedAt && Date.now() - parseInt(dismissedAt) < COOLDOWN_AFTER_DISMISS) {
      return;
    }

    // Déjà montré il y a moins de 7 jours → ne pas réafficher
    if (lastShownAt && Date.now() - parseInt(lastShownAt) < COOLDOWN_BETWEEN_SHOWS) {
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
      const _accepted = localStorage.getItem('pwa-install-accepted');
      const _dismissedAt = localStorage.getItem('pwa-install-dismissed-at');
      const _lastShownAt = localStorage.getItem('pwa-install-last-shown-at');
      if (_accepted === 'true') return;
      if (_dismissedAt && Date.now() - parseInt(_dismissedAt) < COOLDOWN_AFTER_DISMISS) return;
      if (_lastShownAt && Date.now() - parseInt(_lastShownAt) < COOLDOWN_BETWEEN_SHOWS) return;
      
      // Sauvegarder l'événement pour l'utiliser plus tard
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // Enregistrer quand le prompt a été montré
      localStorage.setItem('pwa-install-last-shown-at', Date.now().toString());

      // Afficher notre prompt personnalisé après un délai
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
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
    
    localStorage.setItem('pwa-install-dismissed-at', Date.now().toString());
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
