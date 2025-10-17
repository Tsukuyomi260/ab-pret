import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BACKEND_URL } from '../config/backend';
import { registerServiceWorker } from '../utils/serviceWorkerConfig';

// Utilitaire pour convertir la clé VAPID
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
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

  // Récupérer la clé publique VAPID depuis le backend
  useEffect(() => {
    const fetchVapidKey = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/push/vapid-public-key`);
        const data = await response.json();
        setVapidPublicKey(data.publicKey);
      } catch (error) {
        console.error('Erreur lors de la récupération de la clé VAPID:', error);
      }
    };

    fetchVapidKey();
  }, []);

  // Vérifier le support des notifications push et demander l'autorisation automatiquement
  useEffect(() => {
    const checkSupport = () => {
      const supported = "serviceWorker" in navigator && "PushManager" in window;
      setIsSupported(supported);
    };

    checkSupport();
  }, []);

  // Vérifier l'état d'abonnement au chargement et renouveler si nécessaire
  useEffect(() => {
    const checkAndRenewSubscription = async () => {
      console.log('[PUSH HOOK] Vérification et renouvellement de l\'abonnement...', {
        isSupported,
        vapidPublicKey: !!vapidPublicKey,
        user: !!user
      });

      if (!isSupported || !vapidPublicKey) {
        console.log('[PUSH HOOK] Notifications non supportées ou clé VAPID manquante');
        setHasAskedPermission(true);
        return;
      }

      // Vérifier si l'utilisateur a définitivement refusé les notifications
      const hasDeclinedPrompt = localStorage.getItem('notification-prompt-declined');
      if (hasDeclinedPrompt === 'true') {
        console.log('[PUSH HOOK] L\'utilisateur a définitivement refusé les notifications - pas d\'affichage');
        setHasAskedPermission(true);
        return;
      }

      try {
        const reg = await navigator.serviceWorker.ready;
        let existingSubscription = await reg.pushManager.getSubscription();
        
        console.log('[PUSH HOOK] Subscription existante:', !!existingSubscription);
        
        if (existingSubscription) {
          // En production, considérer l'abonnement comme valide sans test
          if (process.env.NODE_ENV === 'production') {
            console.log('[PUSH HOOK] Mode production - abonnement considéré comme valide');
            setSubscription(existingSubscription);
            setIsSubscribed(true);
            setHasAskedPermission(true);
          } else {
            // En développement, vérifier si l'abonnement est encore valide
            const isValid = await validateSubscription(existingSubscription);
            
            if (isValid) {
              console.log('[PUSH HOOK] ✅ Abonnement valide');
              setSubscription(existingSubscription);
              setIsSubscribed(true);
              setHasAskedPermission(true);
            } else {
              console.log('[PUSH HOOK] ⚠️ Abonnement expiré, renouvellement...');
              // Renouveler l'abonnement
              const renewed = await renewSubscription(reg);
              if (renewed) {
                console.log('[PUSH HOOK] ✅ Abonnement renouvelé avec succès');
                setSubscription(renewed);
                setIsSubscribed(true);
                setHasAskedPermission(true);
              } else {
                console.log('[PUSH HOOK] ❌ Échec du renouvellement');
                setHasAskedPermission(true);
              }
            }
          }
        } else {
          // Pas d'abonnement - vérifier si on peut afficher le prompt
          const hasDeclinedPrompt = localStorage.getItem('notification-prompt-declined');
          if (hasDeclinedPrompt === 'true') {
            console.log('[PUSH HOOK] L\'utilisateur a refusé les notifications - pas d\'affichage');
            setHasAskedPermission(true);
          } else {
            console.log('[PUSH HOOK] Pas d\'abonnement - prompt peut s\'afficher');
            setHasAskedPermission(true);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'abonnement:', error);
        setHasAskedPermission(true);
      }
    };

    checkAndRenewSubscription();
  }, [isSupported, vapidPublicKey, user]);

  // Vérification quotidienne de l'état des abonnements
  useEffect(() => {
    const checkSubscriptionDaily = async () => {
      console.log('[PUSH HOOK] Vérification quotidienne de l\'abonnement...');
      
      try {
        const reg = await navigator.serviceWorker.ready;
        const currentSubscription = await reg.pushManager.getSubscription();
        
        // Vérifier si l'abonnement existe et est actif
        if (!currentSubscription) {
          console.log('[PUSH HOOK] ⚠️ Abonnement inactif ou perdu');
          setIsSubscribed(false);
          setSubscription(null);
          
          // Marquer que l'abonnement est inactif pour permettre l'affichage du prompt
          localStorage.setItem('subscription-inactive', 'true');
          localStorage.setItem('subscription-last-check', Date.now().toString());
          
          // Réinitialiser le flag de prompt pour permettre l'affichage
          localStorage.removeItem('notification-prompt-seen');
          console.log('[PUSH HOOK] Prompt de notification peut s\'afficher - abonnement inactif');
        } else {
          console.log('[PUSH HOOK] ✅ Abonnement actif');
          setIsSubscribed(true);
          setSubscription(currentSubscription);
          
          // Marquer que l'abonnement est actif
          localStorage.setItem('subscription-active', 'true');
          localStorage.setItem('subscription-last-check', Date.now().toString());
          localStorage.removeItem('subscription-inactive');
        }
      } catch (error) {
        console.error('[PUSH HOOK] Erreur vérification quotidienne:', error);
        // En cas d'erreur, considérer l'abonnement comme inactif
        setIsSubscribed(false);
        setSubscription(null);
        localStorage.setItem('subscription-inactive', 'true');
      }
    };

    // Vérifier immédiatement au chargement
    checkSubscriptionDaily();

    // Puis vérifier quotidiennement (24h)
    const interval = setInterval(checkSubscriptionDaily, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]); // Déclencher quand l'utilisateur change

  // Valider un abonnement en testant l'envoi d'une notification
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
      const reg = await registerServiceWorker();
      
      if (!reg) {
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
      const existingSubscription = await reg.pushManager.getSubscription();
      if (existingSubscription) {
        setSubscription(existingSubscription);
        setIsSubscribed(true);
        console.log('[PUSH HOOK] ✅ Déjà abonné aux notifications');
        return true;
      }

      // Créer un nouvel abonnement
      console.log('[PUSH HOOK] Création d\'un nouvel abonnement...');
      const newSubscription = await reg.pushManager.subscribe({
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
      const reg = await navigator.serviceWorker.ready;
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
