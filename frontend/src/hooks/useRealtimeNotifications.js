import { useEffect, useRef, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export const useRealtimeNotifications = () => {
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  // useRef pour que processedIds survive aux re-renders sans déclencher de re-souscription
  const processedIds = useRef(new Set());
  // useRef pour addNotification — évite de le mettre dans les deps de useEffect
  const addNotificationRef = useRef(addNotification);
  useEffect(() => { addNotificationRef.current = addNotification; }, [addNotification]);

  useEffect(() => {
    if (!user) return;

    const isAdmin = user?.role === 'admin';
    const userId = user?.id;
    // Timestamp de démarrage : on ignore tous les événements Supabase antérieurs à maintenant
    const subscriptionStart = new Date();

    console.log(`[REALTIME] ${isAdmin ? 'Admin' : 'Utilisateur'} connecté, ID: ${userId}`);

    const loansSubscription = supabase
      .channel(`loans_changes_${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'loans' },
        (payload) => {
          // Ignorer les événements antérieurs à l'abonnement (replay Supabase)
          const eventDate = new Date(payload.new.created_at);
          if (eventDate < subscriptionStart) return;

          if (processedIds.current.has(`insert_${payload.new.id}`)) return;
          processedIds.current.add(`insert_${payload.new.id}`);

          if (isAdmin) {
            addNotificationRef.current({
              title: '🚨 Nouvelle demande de prêt',
              message: `Demande de ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(payload.new.amount)} - ${payload.new.purpose || 'Objectif non spécifié'}`,
              type: 'info',
              priority: 'high',
              forAdmin: true,
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
        { event: 'UPDATE', schema: 'public', table: 'loans' },
        (payload) => {
          if (payload.old.status === payload.new.status) return;

          // Clé unique : loanId + nouveau statut — évite le doublon si l'event est rejoué
          const eventKey = `update_${payload.new.id}_${payload.new.status}`;
          if (processedIds.current.has(eventKey)) return;
          processedIds.current.add(eventKey);

          let message = '';
          let type = 'info';
          let title = '';

          switch (payload.new.status) {
            case 'approved':
              message = `Prêt approuvé pour ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(payload.new.amount)}`;
              type = 'success';
              title = '✅ Prêt approuvé';
              break;
            case 'rejected':
              message = `Prêt rejeté pour ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(payload.new.amount)}`;
              type = 'error';
              title = '❌ Prêt rejeté';
              break;
            case 'active':
              message = `Prêt activé pour ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(payload.new.amount)}`;
              type = 'success';
              title = '🚀 Prêt activé';
              break;
            default:
              return;
          }

          if (isAdmin) {
            addNotificationRef.current({
              title: `Statut de prêt mis à jour`,
              message: `${message} - Utilisateur: ${payload.new.user_id}`,
              type,
              priority: 'medium',
              forAdmin: true,
              data: payload.new
            });
          }

          if (!isAdmin && payload.new.user_id === userId) {
            addNotificationRef.current({
              title,
              message,
              type,
              priority: 'high',
              forUser: true,
              userId,
              data: payload.new,
              action: 'Voir les détails'
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('[REALTIME] Statut connexion loans:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    let usersSubscription = null;
    if (isAdmin) {
      usersSubscription = supabase
        .channel(`users_changes_${userId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'users' },
          (payload) => {
            const eventDate = new Date(payload.new.created_at);
            if (eventDate < subscriptionStart) return;

            if (processedIds.current.has(`user_${payload.new.id}`)) return;
            processedIds.current.add(`user_${payload.new.id}`);

            addNotificationRef.current({
              title: '👤 Nouvel utilisateur inscrit',
              message: `${payload.new.first_name} ${payload.new.last_name} - ${payload.new.phone_number}`,
              type: 'info',
              priority: 'medium',
              forAdmin: true,
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
          console.log('[REALTIME] Statut connexion users (admin):', status);
        });
    }

    return () => {
      console.log('[REALTIME] Nettoyage des abonnements');
      loansSubscription.unsubscribe();
      if (usersSubscription) usersSubscription.unsubscribe();
    };
  // Dépendances stables uniquement : user.id et user.role
  // addNotification est accédé via ref pour éviter les re-souscriptions
  }, [user?.id, user?.role]);

  return { isConnected };
};