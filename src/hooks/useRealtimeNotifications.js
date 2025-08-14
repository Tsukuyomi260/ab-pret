import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export const useRealtimeNotifications = () => {
  const { addNotification } = useNotifications();
  const { user } = useAuth(); // Récupérer l'utilisateur connecté
  const [isConnected, setIsConnected] = useState(false);
  const [processedIds] = useState(new Set()); // Pour éviter les doublons

  useEffect(() => {
    if (!user) return;

    const isAdmin = user?.role === 'admin';
    const userId = user?.id;

    console.log(`[REALTIME] ${isAdmin ? 'Admin' : 'Utilisateur'} connecté, ID: ${userId}`);

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
          
          // Éviter les doublons
          if (processedIds.has(payload.new.id)) {
            return;
          }
          processedIds.add(payload.new.id);
          
          // Seulement l'admin voit les nouvelles demandes
          if (isAdmin) {
            addNotification({
              title: '🚨 Nouvelle demande de prêt',
              message: `Demande de ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(payload.new.amount)} - ${payload.new.purpose || 'Objectif non spécifié'}`,
              type: 'info',
              priority: 'high',
              forAdmin: true, // Marquer comme notification admin
              data: {
                loan_id: payload.new.id,
                amount: payload.new.amount,
                purpose: payload.new.purpose,
                status: payload.new.status,
                created_at: payload.new.created_at
              },
              action: 'Voir la demande'
            });
          }
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
            let title = '';
            
            switch (payload.new.status) {
              case 'approved':
                message = `Prêt approuvé pour ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(payload.new.amount)} FCFA`;
                type = 'success';
                title = '✅ Prêt approuvé';
                break;
              case 'rejected':
                message = `Prêt rejeté pour ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(payload.new.amount)} FCFA`;
                type = 'error';
                title = '❌ Prêt rejeté';
                break;
              case 'active':
                message = `Prêt activé pour ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(payload.new.amount)} FCFA`;
                type = 'success';
                title = '🚀 Prêt activé';
                break;
              default:
                return;
            }
            
            // Admin voit toutes les notifications de statut
            if (isAdmin) {
              addNotification({
                title: `Statut de prêt mis à jour`,
                message: `${message} - Utilisateur: ${payload.new.user_id}`,
                type,
                priority: 'medium',
                forAdmin: true, // Marquer comme notification admin
                data: payload.new
              });
            }
            
            // Utilisateur voit seulement ses propres notifications de statut
            if (!isAdmin && payload.new.user_id === userId) {
              addNotification({
                title,
                message,
                type,
                priority: 'high',
                forUser: true, // Marquer comme notification utilisateur
                userId: userId, // Spécifier l'utilisateur destinataire
                data: payload.new,
                action: 'Voir les détails'
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('[REALTIME] Statut de la connexion loans:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Écouter les nouvelles inscriptions d'utilisateurs (seulement pour les admins)
    if (isAdmin) {
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
            console.log('[REALTIME] Nouvel utilisateur (admin):', payload.new);
            
            // Éviter les doublons
            if (processedIds.has(payload.new.id)) {
              return;
            }
            processedIds.add(payload.new.id);
            
            // Ajouter une notification pour l'admin
            addNotification({
              title: '👤 Nouvel utilisateur inscrit',
              message: `${payload.new.first_name} ${payload.new.last_name} - ${payload.new.phone_number}`,
              type: 'info',
              priority: 'medium',
              forAdmin: true, // Marquer comme notification admin
              data: {
                user_id: payload.new.id,
                first_name: payload.new.first_name,
                last_name: payload.new.last_name,
                phone_number: payload.new.phone_number,
                status: payload.new.status,
                created_at: payload.new.created_at
              },
              action: 'Voir le profil'
            });
          }
        )
        .subscribe((status) => {
          console.log('[REALTIME] Statut de la connexion users (admin):', status);
        });

      // Cleanup function pour admin
      return () => {
        console.log('[REALTIME] Nettoyage des abonnements (admin)');
        loansSubscription.unsubscribe();
        usersSubscription.unsubscribe();
      };
    } else {
      // Cleanup function pour utilisateur
      return () => {
        console.log('[REALTIME] Nettoyage des abonnements (utilisateur)');
        loansSubscription.unsubscribe();
      };
    }
  }, [addNotification, user?.role, user?.id]); // Dépendance sur le rôle et l'ID de l'utilisateur

  return { isConnected };
};
