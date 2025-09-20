import { useEffect, useState } from 'react';
import { subscribeToNewUsers } from './supabaseClient';

export const useSupabaseNotifications = () => {
  const [newUsers, setNewUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Fonction de callback pour les nouvelles inscriptions
    const handleNewUser = (userData) => {
      setNewUsers(prev => [userData, ...prev]);
      
      // Afficher une notification toast
      if (window.showToast) {
        window.showToast({
          type: 'success',
          title: 'Nouvelle inscription',
          message: `${userData.firstName} ${userData.lastName} s'est inscrit(e)`,
          duration: 5000
        });
      }
    };

    // S'abonner aux nouvelles inscriptions
    const subscription = subscribeToNewUsers(handleNewUser);

    // Mettre à jour le statut de connexion
    setIsConnected(true);

    // Nettoyer la subscription à la fermeture
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      setIsConnected(false);
    };
  }, []);

  return {
    newUsers,
    isConnected,
    clearNewUsers: () => setNewUsers([])
  };
}; 