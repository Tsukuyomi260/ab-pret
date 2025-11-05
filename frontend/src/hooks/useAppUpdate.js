import { useState, useEffect, useCallback } from 'react';

const CHECK_INTERVAL = 5 * 60 * 1000; // Vérifier toutes les 5 minutes
const VERSION_FILE = '/version.json';

export const useAppUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [newVersion, setNewVersion] = useState(null);
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState(null);

  // Fonction pour configurer les écouteurs
  const setupServiceWorkerListeners = useCallback((registration) => {
    // Écouter les mises à jour du service worker
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[APP_UPDATE] Nouveau Service Worker disponible');
            setUpdateAvailable(true);
          }
        });
      }
    });
  }, []);

  // Fonction pour mettre à jour le Service Worker de manière sécurisée
  const safeUpdateServiceWorker = useCallback((registration) => {
    if (!registration) return;
    
    try {
      // Vérifier que le registration est toujours actif
      navigator.serviceWorker.getRegistration(registration.scope)
        .then((activeRegistration) => {
          if (activeRegistration) {
            activeRegistration.update().catch((error) => {
              // Erreur silencieuse si le Service Worker a été désinstallé
              if (!error.message?.includes('uninstalled')) {
                if (process.env.NODE_ENV === 'development') {
                  console.log('[APP_UPDATE] Service Worker mise à jour ignorée:', error.message);
                }
              }
            });
          }
        })
        .catch(() => {
          // Registration n'existe plus, c'est OK
        });
    } catch (error) {
      // Erreur silencieuse
      if (process.env.NODE_ENV === 'development') {
        console.log('[APP_UPDATE] Mise à jour Service Worker ignorée:', error.message);
      }
    }
  }, []);

  // Enregistrer le service worker
  useEffect(() => {
    // Ne pas enregistrer le Service Worker en développement (sauf si explicitement activé)
    if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_ENABLE_SW !== 'true') {
      console.log('[APP_UPDATE] Service Worker désactivé en développement');
      return;
    }

    if ('serviceWorker' in navigator) {
      // Vérifier d'abord si un Service Worker est déjà enregistré
      navigator.serviceWorker.getRegistration()
        .then((existingRegistration) => {
          if (existingRegistration) {
            console.log('[APP_UPDATE] Service Worker déjà enregistré:', existingRegistration.scope);
            setServiceWorkerRegistration(existingRegistration);
            setupServiceWorkerListeners(existingRegistration);
            return existingRegistration;
          } else {
            // Enregistrer un nouveau Service Worker
            return navigator.serviceWorker.register('/serviceWorker.js');
          }
        })
        .then((registration) => {
          if (registration) {
            // Toujours configurer les écouteurs et vérifier les mises à jour
            console.log('[APP_UPDATE] Service Worker enregistré:', registration.scope);
            setServiceWorkerRegistration((prev) => {
              // Ne configurer les écouteurs que si ce n'est pas déjà fait
              if (!prev || prev !== registration) {
                setupServiceWorkerListeners(registration);
              }
              return registration;
            });
            
            // Vérifier les mises à jour de manière sécurisée
            safeUpdateServiceWorker(registration);
          }
        })
        .catch((error) => {
          // Erreur silencieuse en développement
          if (process.env.NODE_ENV === 'development') {
            console.log('[APP_UPDATE] Service Worker non disponible en développement:', error.message);
          } else {
            console.error('[APP_UPDATE] Erreur enregistrement Service Worker:', error);
          }
        });
    }
  }, [setupServiceWorkerListeners, safeUpdateServiceWorker]);

  // Vérifier la version de l'application
  const checkVersion = useCallback(async () => {
    try {
      setIsChecking(true);
      
      // Récupérer la version actuelle stockée
      const storedVersion = localStorage.getItem('app-version');
      const storedBuildNumber = localStorage.getItem('app-build-number');

      // Récupérer la nouvelle version depuis le serveur (avec cache busting)
      const response = await fetch(`${VERSION_FILE}?t=${Date.now()}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        console.log('[APP_UPDATE] Fichier version.json non trouvé, utilisation de la détection Service Worker uniquement');
        return;
      }

      const versionData = await response.json();
      const { version, buildNumber, buildDate } = versionData;

      console.log('[APP_UPDATE] Version serveur:', { version, buildNumber, buildDate });
      console.log('[APP_UPDATE] Version stockée:', { version: storedVersion, buildNumber: storedBuildNumber });

      // Comparer avec la version stockée
      if (storedVersion && storedBuildNumber) {
        if (buildNumber > parseInt(storedBuildNumber) || version !== storedVersion) {
          console.log('[APP_UPDATE] ✅ Nouvelle version détectée !');
          setNewVersion(versionData);
          setUpdateAvailable(true);
        }
      } else {
        // Première visite, stocker la version actuelle
        localStorage.setItem('app-version', version);
        localStorage.setItem('app-build-number', buildNumber.toString());
        setCurrentVersion(versionData);
      }

      // Mettre à jour la version stockée
      if (version) {
        localStorage.setItem('app-version', version);
        localStorage.setItem('app-build-number', buildNumber.toString());
      }

    } catch (error) {
      console.error('[APP_UPDATE] Erreur lors de la vérification:', error);
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Vérification initiale
  useEffect(() => {
    checkVersion();

    // Vérifier régulièrement
    const interval = setInterval(checkVersion, CHECK_INTERVAL);

    // Vérifier aussi quand la fenêtre reprend le focus
    const handleFocus = () => {
      checkVersion();
    };
    window.addEventListener('focus', handleFocus);

    // Vérifier le service worker régulièrement (de manière sécurisée)
    if (serviceWorkerRegistration) {
      const swInterval = setInterval(() => {
        // Vérifier que le Service Worker est toujours actif avant de mettre à jour
        navigator.serviceWorker.getRegistration(serviceWorkerRegistration.scope)
          .then((registration) => {
            if (registration) {
              registration.update().catch((error) => {
                // Erreur silencieuse si le Service Worker a été désinstallé
                if (!error.message?.includes('uninstalled')) {
                  console.log('[APP_UPDATE] Service Worker mise à jour:', error.message);
                }
              });
            }
          })
          .catch(() => {
            // Registration n'existe plus, c'est OK
          });
      }, CHECK_INTERVAL);

      return () => {
        clearInterval(interval);
        clearInterval(swInterval);
        window.removeEventListener('focus', handleFocus);
      };
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkVersion, serviceWorkerRegistration]);

  // Appliquer la mise à jour
  const applyUpdate = useCallback(() => {
    // Vérifier que le Service Worker est toujours actif
    if (serviceWorkerRegistration) {
      navigator.serviceWorker.getRegistration(serviceWorkerRegistration.scope)
        .then((registration) => {
          if (registration?.waiting) {
            // Nouveau service worker en attente
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            registration.waiting.addEventListener('statechange', (e) => {
              if (e.target.state === 'activated') {
                window.location.reload();
              }
            });
          } else {
            // Recharger la page pour appliquer les changements
            window.location.reload();
          }
        })
        .catch(() => {
          // Service Worker non disponible, recharger simplement
          window.location.reload();
        });
    } else {
      // Pas de Service Worker, recharger simplement
      window.location.reload();
    }
  }, [serviceWorkerRegistration]);

  // Ignorer la mise à jour (pour cette session)
  const ignoreUpdate = useCallback(() => {
    setUpdateAvailable(false);
    // Ne pas afficher à nouveau pendant cette session
    sessionStorage.setItem('update-ignored', 'true');
  }, []);

  return {
    updateAvailable: updateAvailable && !sessionStorage.getItem('update-ignored'),
    isChecking,
    currentVersion,
    newVersion,
    checkVersion,
    applyUpdate,
    ignoreUpdate
  };
};

