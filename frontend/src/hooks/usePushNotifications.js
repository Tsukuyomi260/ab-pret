import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

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
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/push/vapid-public-key`);
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

  // Vérifier l'état d'abonnement au chargement
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      console.log('[PUSH HOOK] Vérification de l\'état d\'abonnement...', {
        isSupported,
        vapidPublicKey: !!vapidPublicKey,
        user: !!user
      });

      if (!isSupported || !vapidPublicKey) {
        console.log('[PUSH HOOK] Notifications non supportées ou clé VAPID manquante');
        setHasAskedPermission(true);
        return;
      }

      try {
        const reg = await navigator.serviceWorker.ready;
        const existingSubscription = await reg.pushManager.getSubscription();
        
        console.log('[PUSH HOOK] Subscription existante:', !!existingSubscription);
        
        if (existingSubscription) {
          // Déjà abonné
          console.log('[PUSH HOOK] Utilisateur déjà abonné');
          setSubscription(existingSubscription);
          setIsSubscribed(true);
          setHasAskedPermission(true);
        } else {
          // Pas d'abonnement - on peut afficher le prompt
          console.log('[PUSH HOOK] Pas d\'abonnement - prompt peut s\'afficher');
          setHasAskedPermission(true);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'abonnement:', error);
        setHasAskedPermission(true);
      }
    };

    checkSubscriptionStatus();
  }, [isSupported, vapidPublicKey, user]);

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

    try {
      // Enregistrer le service worker
      console.log('[PUSH HOOK] Enregistrement du service worker...');
      const reg = await navigator.serviceWorker.register("/serviceWorker.js");
      console.log('[PUSH HOOK] Service worker enregistré:', reg);
      
      // Attendre que le service worker soit actif
      console.log('[PUSH HOOK] Attente de l\'activation du service worker...');
      await navigator.serviceWorker.ready;
      console.log('[PUSH HOOK] Service worker prêt !');

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
        url: `${process.env.REACT_APP_BACKEND_URL}/api/save-subscription`,
        userId: user?.id
      });
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/save-subscription`, {
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
