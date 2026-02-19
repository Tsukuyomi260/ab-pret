import { useEffect, useState } from 'react';
import { messaging, getToken, onMessage } from './firebase';
import { useAuth } from './context/AuthContext';
import { supabase } from './utils/supabaseClient';

// Clé VAPID Firebase : Firebase Console > Paramètres du projet > Cloud Messaging > Certificats Web Push
const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY;

export const useNotifications = () => {
  const { user } = useAuth();
  const [token, setToken] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    
    // Vérifier d'abord si l'utilisateur a déjà un token FCM
    checkExistingTokenAndRequestPermission();

    // Écouter les messages quand l'app est ouverte
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message reçu (foreground):', payload);
      setNotification(payload.notification || null);
      
      // ⚠️ NE PAS afficher de notification système quand l'app est ouverte
      // Le service worker gère déjà les notifications en arrière-plan
      // Si on affiche aussi ici, on aura des doublons
      // On met juste à jour l'état pour l'UI, mais pas de Notification() système
      
      // Note: Les notifications système sont gérées par le service worker
      // Ici on met juste à jour l'état React pour afficher dans l'UI de l'app
    });

    return () => unsubscribe && unsubscribe();
  }, [user?.id]);

  // Vérifier si l'utilisateur a déjà un token FCM avant de demander la permission
  const checkExistingTokenAndRequestPermission = async () => {
    try {
      // 1. Vérifier d'abord si l'utilisateur a déjà un token dans la DB
      const { data: userData, error } = await supabase
        .from('users')
        .select('fcm_token')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('[FCM] Erreur récupération token existant:', error);
        // Continuer pour demander la permission si erreur
      } else if (userData?.fcm_token) {
        console.log('[FCM] Token FCM existant trouvé dans la DB');
        setToken(userData.fcm_token);
        
        // Vérifier si le token est toujours valide en essayant de l'utiliser
        // Si la permission est déjà accordée, on peut essayer de récupérer le token actuel
        if (Notification.permission === 'granted') {
          try {
            const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
            if (currentToken && currentToken !== userData.fcm_token) {
              // Le token a changé, mettre à jour la DB
              console.log('[FCM] Token FCM mis à jour');
              await saveTokenToDatabase(currentToken);
              setToken(currentToken);
            } else if (currentToken) {
              // Token toujours valide
              console.log('[FCM] Token FCM toujours valide');
            }
          } catch (tokenError) {
            console.warn('[FCM] Erreur vérification token:', tokenError);
            // Si erreur, on demande un nouveau token
            await requestPermission();
          }
        }
        return; // Pas besoin de demander la permission si on a déjà un token
      }

      // 2. Si pas de token, vérifier l'état de la permission
      if (Notification.permission === 'default') {
        // Permission jamais demandée → demander maintenant
        console.log('[FCM] Demande de permission pour la première fois');
        await requestPermission();
      } else if (Notification.permission === 'granted') {
        // Permission déjà accordée mais pas de token → obtenir le token
        console.log('[FCM] Permission déjà accordée, obtention du token');
        await requestPermission();
      } else {
        // Permission refusée → ne rien faire
        console.log('[FCM] Permission refusée par l\'utilisateur');
      }
    } catch (error) {
      console.error('[FCM] Erreur checkExistingTokenAndRequestPermission:', error);
    }
  };

  const requestPermission = async () => {
    try {
      // Si la permission n'est pas encore demandée, la demander
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission === 'granted') {
        console.log('[FCM] Permission accordée');

        if (!VAPID_KEY) {
          console.warn('[FCM] REACT_APP_FIREBASE_VAPID_KEY manquante dans .env — impossible d\'obtenir le token');
          return;
        }

        const currentToken = await getToken(messaging, {
          vapidKey: VAPID_KEY
        });

        if (currentToken) {
          console.log('[FCM] Token obtenu');
          setToken(currentToken);
          await saveTokenToDatabase(currentToken);
        } else {
          console.warn('[FCM] Aucun token reçu (vérifiez le service worker firebase-messaging-sw.js)');
        }
      } else {
        console.log('[FCM] Permission refusée:', permission);
      }
    } catch (error) {
      console.error('[FCM] Erreur:', error);
    }
  };

  const saveTokenToDatabase = async (fcmToken) => {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({ fcm_token: fcmToken, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) {
        console.error('[FCM] Erreur sauvegarde token:', error.message);
        return;
      }
      console.log('[FCM] Token sauvegardé pour l\'utilisateur');
    } catch (err) {
      console.error('[FCM] saveTokenToDatabase:', err);
    }
  };

  return { token, notification, requestPermission };
};
