import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import Toast from '../components/UI/Toast';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  // Calculer le nombre de notifications non lues
  useEffect(() => {
    const count = notifications.filter(notif => !notif.read).length;
    setUnreadCount(count);
  }, [notifications]);

  // Charger les notifications réelles depuis la base de données
  const loadRealNotifications = useCallback(async (userId = null) => {
    try {
      // Si Supabase n'est pas configuré, ne pas essayer de charger
      if (!supabase) {
        console.log('[NOTIFICATIONS] Supabase non configuré - skip chargement');
        return;
      }

      // Construire la requête avec filtrage par utilisateur si spécifié
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Filtrer par utilisateur si un userId est fourni
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: notificationsData, error } = await query;

      if (error) {
        console.error('[NOTIFICATIONS] Erreur lors du chargement:', error);
        return;
      }

      if (notificationsData) {
        // Transformer les données Supabase en format local
        const realNotifications = notificationsData.map(notif => ({
          id: notif.id,
          title: notif.title,
          message: notif.message,
          type: notif.type || 'info',
          priority: notif.priority || 'medium',
          read: notif.read || false,
          timestamp: notif.created_at,
          data: notif.data || {},
          action: notif.action || null
        }));

        setNotifications(realNotifications);
      }
    } catch (error) {
      console.error('[NOTIFICATIONS] Erreur lors du chargement:', error);
    }
  }, []);

  // Ajouter une nouvelle notification
  const addNotification = useCallback(async (notification) => {
    try {
      // Si Supabase n'est pas configuré, ajouter seulement en local
      if (!supabase) {
        console.log('[NOTIFICATIONS] Supabase non configuré - notification locale seulement');
        const newNotification = {
          id: Date.now() + Math.random(),
          title: notification.title,
          message: notification.message,
          type: notification.type || 'info',
          priority: notification.priority || 'medium',
          read: false,
          data: notification.data || {},
          action: notification.action || null,
          user_id: notification.userId || null,
          created_at: new Date().toISOString(),
          timestamp: new Date().toISOString()
        };

        setNotifications(prev => {
          // Éviter les doublons basés sur le titre et le message
          const isDuplicate = prev.some(existing => 
            existing.title === notification.title && 
            existing.message === notification.message &&
            Date.now() - new Date(existing.timestamp).getTime() < 60000 // Dans la dernière minute
          );
          
          if (isDuplicate) {
            return prev;
          }
          
          return [newNotification, ...prev.slice(0, 49)]; // Garder max 50 notifications
        });
        return;
      }

      const newNotification = {
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        priority: notification.priority || 'medium',
        read: false,
        data: notification.data || {},
        action: notification.action || null,
        user_id: notification.userId || null,
        created_at: new Date().toISOString()
      };

      // Sauvegarder dans Supabase
      const { data, error } = await supabase
        .from('notifications')
        .insert([newNotification])
        .select()
        .single();

      if (error) {
        console.error('[NOTIFICATIONS] Erreur lors de la sauvegarde:', error);
        return;
      }

      // Ajouter à l'état local
      const savedNotification = {
        id: data.id,
        ...newNotification,
        timestamp: data.created_at
      };

      setNotifications(prev => {
        // Éviter les doublons basés sur le titre et le message
        const isDuplicate = prev.some(existing => 
          existing.title === notification.title && 
          existing.message === notification.message &&
          Date.now() - new Date(existing.timestamp).getTime() < 60000 // Dans la dernière minute
        );
        
        if (isDuplicate) {
          return prev;
        }
        
        return [savedNotification, ...prev.slice(0, 49)]; // Garder max 50 notifications
      });
    } catch (error) {
      console.error('[NOTIFICATIONS] Erreur lors de l\'ajout:', error);
    }
  }, []);

  // Marquer une notification comme lue
  const markAsRead = async (notificationId) => {
    try {
      // Si Supabase n'est pas configuré, mettre à jour seulement en local
      if (!supabase) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
        return;
      }

      // Mettre à jour dans Supabase
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('[NOTIFICATIONS] Erreur lors de la mise à jour:', error);
        return;
      }

      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('[NOTIFICATIONS] Erreur lors de la mise à jour:', error);
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      // Si Supabase n'est pas configuré, mettre à jour seulement en local
      if (!supabase) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
        return;
      }

      // Mettre à jour toutes les notifications dans Supabase
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);

      if (error) {
        console.error('[NOTIFICATIONS] Erreur lors de la mise à jour globale:', error);
        return;
      }

      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('[NOTIFICATIONS] Erreur lors de la mise à jour globale:', error);
    }
  };

  // Supprimer une notification
  const removeNotification = async (notificationId) => {
    try {
      // Si Supabase n'est pas configuré, supprimer seulement en local
      if (!supabase) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        return;
      }

      // Supprimer de Supabase
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('[NOTIFICATIONS] Erreur lors de la suppression:', error);
        return;
      }

      // Supprimer de l'état local
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('[NOTIFICATIONS] Erreur lors de la suppression:', error);
    }
  };

  // Supprimer toutes les notifications
  const clearAllNotifications = async () => {
    try {
      // Si Supabase n'est pas configuré, vider seulement en local
      if (!supabase) {
        setNotifications([]);
        return;
      }

      // Supprimer toutes les notifications de Supabase
      const { error } = await supabase
        .from('notifications')
        .delete()
        .neq('id', 0); // Supprimer tous les enregistrements

      if (error) {
        console.error('[NOTIFICATIONS] Erreur lors de la suppression globale:', error);
        return;
      }

      // Vider l'état local
      setNotifications([]);
    } catch (error) {
      console.error('[NOTIFICATIONS] Erreur lors de la suppression globale:', error);
    }
  };

  // Rafraîchir les notifications depuis la base de données
  const refreshNotifications = useCallback(async (userId = null) => {
    await loadRealNotifications(userId);
  }, [loadRealNotifications]);

  // Fonctions pour les toasts
  const showToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const showSuccess = useCallback((message) => {
    showToast(message, 'success');
  }, [showToast]);

  const showError = useCallback((message) => {
    showToast(message, 'error');
  }, [showToast]);

  const showWarning = useCallback((message) => {
    showToast(message, 'warning');
  }, [showToast]);

  const showInfo = useCallback((message) => {
    showToast(message, 'info');
  }, [showToast]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Initialiser avec des notifications réelles (sans userId pour éviter de charger toutes les notifications)
  // Les notifications seront chargées par les composants qui utilisent le contexte avec le bon userId
  // useEffect(() => {
  //   loadRealNotifications();
  // }, [loadRealNotifications]);

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    refreshNotifications,
    // Toast functions
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Render all toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}; 