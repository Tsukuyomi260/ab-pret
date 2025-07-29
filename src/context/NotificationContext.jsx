import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/UI/Toast';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [uiNotifications, setUiNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Paiement effectué',
      message: 'Votre paiement de 82 500 FCFA a été traité avec succès.',
      time: 'Il y a 2 heures',
      read: false
    },
    {
      id: 2,
      type: 'info',
      title: 'Nouveau prêt disponible',
      message: 'Vous êtes éligible pour un nouveau prêt. Vérifiez vos options.',
      time: 'Il y a 1 jour',
      read: false
    },
    {
      id: 3,
      type: 'warning',
      title: 'Échéance approche',
      message: 'Votre prochain paiement est prévu dans 3 jours.',
      time: 'Il y a 2 jours',
      read: true
    },
    {
      id: 4,
      type: 'success',
      title: 'Prêt approuvé',
      message: 'Votre demande de prêt de 150 000 FCFA a été approuvée.',
      time: 'Il y a 1 semaine',
      read: true
    }
  ]);

  // Fonctions pour les toasts (existantes)
  const showNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now();
    const newToast = { id, message, type, duration };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const showSuccess = useCallback((message) => {
    showNotification(message, 'success');
  }, [showNotification]);

  const showError = useCallback((message) => {
    showNotification(message, 'error');
  }, [showNotification]);

  const showWarning = useCallback((message) => {
    showNotification(message, 'warning');
  }, [showNotification]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Nouvelles fonctions pour les notifications UI
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      type: notification.type || 'info',
      title: notification.title,
      message: notification.message,
      time: 'À l\'instant',
      read: false,
      ...notification
    };
    setUiNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markNotificationAsRead = useCallback((id) => {
    setUiNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setUiNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id) => {
    setUiNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setUiNotifications([]);
  }, []);

  const getUnreadCount = useCallback(() => {
    return uiNotifications.filter(n => !n.read).length;
  }, [uiNotifications]);

  const value = {
    // Toast functions
    toasts,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    removeToast,
    
    // UI Notification functions
    uiNotifications,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    clearAllNotifications,
    getUnreadCount
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