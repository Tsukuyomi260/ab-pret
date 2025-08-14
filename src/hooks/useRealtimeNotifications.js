import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNotifications } from '../context/NotificationContext';

export const useRealtimeNotifications = () => {
  const { addNotification } = useNotifications();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Écouter les nouvelles demandes de prêts
    const loansSubscription = supabase
      .channel('loans_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'loans'
        },
        (payload) => {
          console.log('[REALTIME] Nouvelle demande de prêt:', payload.new);
          
          // Ajouter une notification pour l'admin
          addNotification({
            title: 'Nouvelle demande de prêt',
            message: `Demande de ${payload.new.amount} FCFA - ${payload.new.purpose}`,
            type: 'info',
            priority: 'high',
            data: payload.new
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'loans'
        },
        (payload) => {
          console.log('[REALTIME] Mise à jour de prêt:', payload.new);
          
          // Notifier les changements de statut
          if (payload.old.status !== payload.new.status) {
            let message = '';
            let type = 'info';
            
            switch (payload.new.status) {
              case 'approved':
                message = `Prêt approuvé pour ${payload.new.amount} FCFA`;
                type = 'success';
                break;
              case 'rejected':
                message = `Prêt rejeté pour ${payload.new.amount} FCFA`;
                type = 'error';
                break;
              case 'active':
                message = `Prêt activé pour ${payload.new.amount} FCFA`;
                type = 'success';
                break;
              default:
                return;
            }
            
            addNotification({
              title: 'Statut de prêt mis à jour',
              message,
              type,
              priority: 'medium',
              data: payload.new
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('[REALTIME] Statut de la connexion:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Écouter les nouvelles inscriptions d'utilisateurs
    const usersSubscription = supabase
      .channel('users_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'users'
        },
        (payload) => {
          console.log('[REALTIME] Nouvel utilisateur:', payload.new);
          
          addNotification({
            title: 'Nouvelle inscription',
            message: `${payload.new.first_name} ${payload.new.last_name} s'est inscrit`,
            type: 'info',
            priority: 'medium',
            data: payload.new
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users'
        },
        (payload) => {
          // Notifier les changements de statut utilisateur
          if (payload.old.status !== payload.new.status) {
            let message = '';
            let type = 'info';
            
            switch (payload.new.status) {
              case 'approved':
                message = `${payload.new.first_name} ${payload.new.last_name} a été approuvé`;
                type = 'success';
                break;
              case 'rejected':
                message = `${payload.new.first_name} ${payload.new.last_name} a été rejeté`;
                type = 'error';
                break;
              default:
                return;
            }
            
            addNotification({
              title: 'Statut utilisateur mis à jour',
              message,
              type,
              priority: 'medium',
              data: payload.new
            });
          }
        }
      )
      .subscribe();

    // Nettoyer les abonnements
    return () => {
      loansSubscription.unsubscribe();
      usersSubscription.unsubscribe();
    };
  }, [addNotification]);

  return { isConnected };
};
