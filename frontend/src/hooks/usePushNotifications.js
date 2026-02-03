import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BACKEND_URL } from '../config/backend';
import { registerServiceWorker } from '../utils/serviceWorkerConfig';

// Utilitaire pour convertir la clé VAPID
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [vapidPublicKey, setVapidPublicKey] = useState(null);
  const [hasAskedPermission, setHasAskedPermission] = useState(false);

  // Récupérer la clé publique VAPID après le premier affichage (ne pas bloquer le chargement)
  useEffect(() => {
    const id = setTimeout(() => {
      const fetchVapidKey = async () => {
        try {
          const response = await fetch(`${BACKEND_URL}/api/push/vapid-public-key`);
          const data = await response.json();
          setVapidPublicKey(data.publicKey);
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Erreur lors de la récupération de la clé VAPID:', error);
          }
        }
      };
      fetchVapidKey();
    }, 800);
    return () => clearTimeout(id);
  }, []);

  // Vérifier le support des notifications push et demander l'autorisation automatiquement
  useEffect(() => {
    const checkSupport = () => {
      const supported = "serviceWorker" in navigator && "PushManager" in window;
      setIsSupported(supported);
    };

    checkSupport();
  }, []);

  // Vérifier l'état d'abonnement après que VAPID soit dispo (ne pas bloquer l'affichage)
  useEffect(() => {
    const checkAndRenewSubscription = async () => {
      if (!isSupported || !vapidPublicKey) {
        setHasAskedPermission(true);
        return;
      }

      const hasDeclinedPrompt = localStorage.getItem('notification-prompt-declined');
      if (hasDeclinedPrompt === 'true') {
        setHasAskedPermission(true);
        return;
      }

      try {
        const reg = await navigator.serviceWorker.ready;
        let existingSubscription = await reg.pushManager.getSubscription();
        
        if (existingSubscription) {
          if (process.env.NODE_ENV === 'production') {
            setSubscription(existingSubscription);
            setIsSubscribed(true);
            setHasAskedPermission(true);
          } else {
            const isValid = await validateSubscription(existingSubscription);
            if (isValid) {
              setSubscription(existingSubscription);
              setIsSubscribed(true);
              setHasAskedPermission(true);
            } else {
              const renewed = await renewSubscription(reg);
              if (renewed) {
                setSubscription(renewed);
                setIsSubscribed(true);
                setHasAskedPermission(true);
              } else {
                setHasAskedPermission(true);
              }
            }
          }
        } else {
          setHasAskedPermission(true);
        }
      } catch (error) {
        setHasAskedPermission(true);
      }
    };

    checkAndRenewSubscription();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- exécution volontaire uniquement à l'init / changement user ou vapid
  }, [isSupported, vapidPublicKey, user]);

  // Vérification intelligente et renouvellement automatique (différée, sans bloquer l'affichage)
  useEffect(() => {
    if (!user?.id || !vapidPublicKey) return;
    let intervalId;
    const id = setTimeout(() => {
    const checkAndRenewSubscription = async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const currentSubscription = await reg.pushManager.getSubscription();
        
        if (!currentSubscription) {
          setIsSubscribed(false);
          setSubscription(null);
          localStorage.setItem('subscription-inactive', 'true');
          localStorage.removeItem('notification-prompt-seen');
          return;
        }

        const isValid = await validateSubscriptionToken(currentSubscription);
        
        if (!isValid) {
          const renewed = await renewSubscriptionSilently(reg);
          if (renewed) {
            setIsSubscribed(true);
            setSubscription(renewed);
            localStorage.setItem('subscription-active', 'true');
            localStorage.removeItem('subscription-inactive');
          } else {
            setIsSubscribed(false);
            setSubscription(null);
            localStorage.setItem('subscription-inactive', 'true');
            localStorage.removeItem('notification-prompt-seen');
          }
        } else {
          setIsSubscribed(true);
          setSubscription(currentSubscription);
          localStorage.setItem('subscription-active', 'true');
          localStorage.removeItem('subscription-inactive');
        }
      } catch (error) {
        setIsSubscribed(false);
        setSubscription(null);
        localStorage.setItem('subscription-inactive', 'true');
      }
    };

    checkAndRenewSubscription();
    intervalId = setInterval(checkAndRenewSubscription, 6 * 60 * 60 * 1000);
    }, 1500);
    return () => {
      clearTimeout(id);
      if (intervalId) clearInterval(intervalId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- interval volontaire, pas de renouvellement à chaque changement de callback
  }, [user?.id, vapidPublicKey]);

  // Valider un token d'abonnement de manière intelligente
  const validateSubscriptionToken = async (subscription) => {
    try {
      console.log('[PUSH HOOK] Validation du token d\'abonnement...');
      
      // Vérifier si l'abonnement a les propriétés requises
      if (!subscription || !subscription.endpoint || !subscription.keys) {
        console.log('[PUSH HOOK] ❌ Abonnement invalide - propriétés manquantes');
        return false;
      }

      // Vérifier si l'endpoint est valide
      if (!subscription.endpoint.startsWith('https://')) {
        console.log('[PUSH HOOK] ❌ Endpoint invalide');
        return false;
      }

      // Vérifier si les clés sont présentes
      if (!subscription.keys.p256dh || !subscription.keys.auth) {
        console.log('[PUSH HOOK] ❌ Clés d\'abonnement manquantes');
        return false;
      }

      // En production, considérer comme valide si les propriétés sont correctes
      if (process.env.NODE_ENV === 'production') {
        console.log('[PUSH HOOK] ✅ Token valide (mode production)');
        return true;
      }

      // En développement, tester avec le backend
      try {
        const response = await fetch(`${BACKEND_URL}/api/validate-subscription`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: subscription,
            userId: user?.id
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('[PUSH HOOK] ✅ Token validé par le backend');
          return result.valid;
        } else {
          console.log('[PUSH HOOK] ⚠️ Erreur validation backend, considérer comme valide');
          return true; // Fallback : considérer comme valide
        }
      } catch (error) {
        console.log('[PUSH HOOK] ⚠️ Erreur test backend, considérer comme valide');
        return true; // Fallback : considérer comme valide
      }
    } catch (error) {
      console.error('[PUSH HOOK] Erreur validation token:', error);
      return false;
    }
  };

  // Renouveler un abonnement de manière silencieuse
  const renewSubscriptionSilently = async (reg) => {
    try {
      console.log('[PUSH HOOK] Renouvellement silencieux de l\'abonnement...');
      
      // Désabonner l'ancien abonnement
      const existingSubscription = await reg.pushManager.getSubscription();
      if (existingSubscription) {
        await existingSubscription.unsubscribe();
        console.log('[PUSH HOOK] Ancien abonnement désabonné');
      }

      // Créer un nouvel abonnement
      const newSubscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      console.log('[PUSH HOOK] Nouvel abonnement créé');

      // Sauvegarder le nouvel abonnement
      const saveResponse = await fetch(`${BACKEND_URL}/api/save-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: newSubscription,
          userId: user?.id
        })
      });

      if (saveResponse.ok) {
        console.log('[PUSH HOOK] ✅ Nouvel abonnement sauvegardé');
        return newSubscription;
      } else {
        console.error('[PUSH HOOK] ❌ Erreur sauvegarde nouvel abonnement');
        return null;
      }
    } catch (error) {
      console.error('[PUSH HOOK] Erreur renouvellement silencieux:', error);
      return null;
    }
  };

  // Valider un abonnement en testant l'envoi d'une notification (ancienne méthode)
  const validateSubscription = async (subscription) => {
    try {
      console.log('[PUSH HOOK] Validation de l\'abonnement...');
      
      // En production, ne pas envoyer de notifications de test
      if (process.env.NODE_ENV === 'production') {
        console.log('[PUSH HOOK] Mode production - validation silencieuse');
        return true; // Considérer comme valide en production
      }
      
      // En développement seulement, tester l'abonnement en envoyant une notification de test
      const response = await fetch(`${BACKEND_URL}/api/test-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription,
          userId: user?.id
        })
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('[PUSH HOOK] Erreur validation abonnement:', error);
      return false;
    }
  };

  // Renouveler un abonnement expiré
  const renewSubscription = async (reg) => {
    try {
      console.log('[PUSH HOOK] Renouvellement de l\'abonnement...');
      
      // Désabonner l'ancien abonnement
      const existingSubscription = await reg.pushManager.getSubscription();
      if (existingSubscription) {
        await existingSubscription.unsubscribe();
        console.log('[PUSH HOOK] Ancien abonnement désabonné');
      }

      // Créer un nouvel abonnement
      const newSubscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      console.log('[PUSH HOOK] Nouvel abonnement créé');

      // Sauvegarder le nouvel abonnement
      const saveResponse = await fetch(`${BACKEND_URL}/api/save-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: newSubscription,
          userId: user?.id
        })
      });

      if (saveResponse.ok) {
        console.log('[PUSH HOOK] ✅ Nouvel abonnement sauvegardé');
        return newSubscription;
      } else {
        console.error('[PUSH HOOK] ❌ Erreur sauvegarde nouvel abonnement');
        return null;
      }
    } catch (error) {
      console.error('[PUSH HOOK] Erreur renouvellement abonnement:', error);
      return null;
    }
  };

  // S'abonner aux notifications push
  const subscribeUser = async () => {
    console.log('[PUSH HOOK] Début de subscribeUser...', {
      isSupported,
      vapidPublicKey: !!vapidPublicKey,
      user: !!user,
      userId: user?.id
    });

    if (!isSupported || !vapidPublicKey) {
      console.log('[PUSH HOOK] Notifications push non supportées ou clé VAPID manquante');
      return false;
    }

    // En développement, permettre les notifications push pour les tests
    if (process.env.NODE_ENV === 'development') {
      console.log('[PUSH HOOK] Mode développement - notifications push activées pour les tests');
    }

    try {
      // Enregistrer le service worker avec la configuration
      console.log('[PUSH HOOK] Enregistrement du service worker...');
      const registration = await registerServiceWorker();

      if (!registration) {
        console.log('[PUSH HOOK] Service worker non disponible, continuation sans...');
      }

      // Demander la permission
      console.log('[PUSH HOOK] Demande de permission...');
      const permission = await Notification.requestPermission();
      console.log('[PUSH HOOK] Permission:', permission);
      
      if (permission !== "granted") {
        console.log('[PUSH HOOK] Permission refusée');
        return false;
      }

      // Vérifier si déjà abonné
      console.log('[PUSH HOOK] Vérification de l\'abonnement existant...');
      const existingSubscription = registration ? await registration.pushManager.getSubscription() : null;
      if (existingSubscription) {
        setSubscription(existingSubscription);
        setIsSubscribed(true);
        console.log('[PUSH HOOK] ✅ Déjà abonné aux notifications');
        return true;
      }

      // Créer un nouvel abonnement
      console.log('[PUSH HOOK] Création d\'un nouvel abonnement...');
      if (!registration) return false;
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      console.log('[PUSH HOOK] ✅ Nouvelle subscription créée:', newSubscription);

      // Envoyer au backend avec l'userId
      console.log('[PUSH HOOK] Envoi au backend...', {
        url: `${BACKEND_URL}/api/save-subscription`,
        userId: user?.id
      });
      
      const response = await fetch(`${BACKEND_URL}/api/save-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          subscription: newSubscription,
          userId: user?.id 
        }),
      });

      console.log('[PUSH HOOK] Réponse du backend:', response.status, response.ok);

      if (response.ok) {
        setSubscription(newSubscription);
        setIsSubscribed(true);
        console.log('[PUSH HOOK] ✅ Abonnement enregistré avec succès !');
        return true;
      } else {
        const errorText = await response.text();
        console.error('[PUSH HOOK] Erreur lors de l\'enregistrement de l\'abonnement:', errorText);
        return false;
      }
    } catch (err) {
      console.error('[PUSH HOOK] Erreur abonnement:', err);
      return false;
    }
  };

  // Se désabonner des notifications push
  const unsubscribeUser = async () => {
    if (!subscription) return false;

    try {
      await navigator.serviceWorker.ready;
      const result = await subscription.unsubscribe();
      
      if (result) {
        setSubscription(null);
        setIsSubscribed(false);
        console.log("Désabonnement réussi");
        return true;
      }
    } catch (error) {
      console.error("Erreur lors du désabonnement:", error);
    }
    
    return false;
  };

  return {
    isSupported,
    isSubscribed,
    subscription,
    vapidPublicKey,
    hasAskedPermission,
    subscribeUser,
    unsubscribeUser
  };
};
