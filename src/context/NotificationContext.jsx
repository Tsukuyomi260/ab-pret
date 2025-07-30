import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  // Ajouter une nouvelle notification
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
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
  }, []);

  // Marquer une notification comme lue
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  // Supprimer une notification
  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  // Supprimer toutes les notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Nettoyer les notifications système (garder seulement les vraies notifications)
  const clearSystemNotifications = () => {
    setNotifications(prev => prev.filter(notif => 
      !notif.title.includes('Bienvenue') && 
      !notif.title.includes('tableau de bord')
    ));
  };

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

  // Générer des notifications automatiques basées sur les événements
  const generateSystemNotifications = () => {
    const now = new Date();
    const systemNotifications = [];

    // Notification de rappel de paiement (si proche de la date)
    const nextPaymentDate = new Date();
    nextPaymentDate.setDate(nextPaymentDate.getDate() + 3); // Dans 3 jours
    
    systemNotifications.push({
      type: 'reminder',
      title: 'Rappel de paiement',
      message: 'Votre prochain paiement de 25 000 FCFA est prévu dans 3 jours.',
      action: 'Voir les détails',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // Il y a 2h
      read: false
    });

    // Notification de prêt accordé
    systemNotifications.push({
      type: 'loan',
      title: 'Prêt accordé !',
      message: 'Votre demande de prêt de 150 000 FCFA a été approuvée.',
      action: 'Voir le contrat',
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // Il y a 1 jour
      read: false
    });

    // Notification de paiement reçu
    systemNotifications.push({
      type: 'payment',
      title: 'Paiement reçu',
      message: 'Votre paiement de 20 000 FCFA a été enregistré avec succès.',
      action: 'Voir le reçu',
      timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 3 jours
      read: true
    });

    // Notification d'amélioration du score de crédit
    systemNotifications.push({
      type: 'success',
      title: 'Score de crédit amélioré',
      message: 'Votre score de crédit a augmenté de 25 points grâce à vos paiements réguliers.',
      action: 'Voir le détail',
      timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 5 jours
      read: true
    });

    // Notification d'information
    systemNotifications.push({
      type: 'info',
      title: 'Nouvelle fonctionnalité',
      message: 'Découvrez notre nouveau calculateur de prêt pour estimer vos mensualités.',
      action: 'Essayer maintenant',
      timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 1 semaine
      read: true
    });

    return systemNotifications;
  };

  // Initialiser avec des notifications système (une seule fois)
  useEffect(() => {
    // Vérifier si les notifications sont déjà initialisées
    if (notifications.length === 0) {
      const systemNotifications = generateSystemNotifications();
      setNotifications(systemNotifications);
    }
  }, []); // Dépendance vide pour ne s'exécuter qu'une seule fois

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    clearSystemNotifications,
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