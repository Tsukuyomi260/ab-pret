import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../context/NotificationContext';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    uiNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    removeNotification,
    getUnreadCount 
  } = useNotification();

  const unreadCount = getUnreadCount();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'warning':
        return <AlertCircle size={16} className="text-yellow-600" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <Info size={16} className="text-blue-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50/80';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50/80';
      case 'error':
        return 'border-red-200 bg-red-50/80';
      default:
        return 'border-blue-200 bg-blue-50/80';
    }
  };

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.notification-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="notification-container relative">
      {/* Bouton de notification */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-white/90 backdrop-blur-sm border border-white/50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell size={20} className="text-gray-700" />
        
        {/* Badge de notification */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Menu des notifications */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-80 bg-white/95 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl z-50"
          >
            {/* Header du menu */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Tout marquer comme lu
                  </button>
                )}
              </div>
            </div>

            {/* Liste des notifications */}
            <div className="max-h-96 overflow-y-auto">
              {uiNotifications.length > 0 ? (
                <div className="p-2">
                  {uiNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`relative p-3 rounded-xl border mb-2 transition-all duration-200 hover:shadow-md ${
                        notification.read ? 'opacity-75' : ''
                      } ${getNotificationColor(notification.type)}`}
                    >
                      {/* Bouton de fermeture */}
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X size={14} />
                      </button>

                      <div className="flex items-start space-x-3 pr-6">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock size={12} className="mr-1" />
                            {notification.time}
                          </div>
                        </div>
                      </div>

                      {/* Bouton marquer comme lu */}
                      {!notification.read && (
                        <button
                          onClick={() => markNotificationAsRead(notification.id)}
                          className="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Marquer comme lu
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">Aucune notification</p>
                </div>
              )}
            </div>

            {/* Footer du menu */}
            {uiNotifications.length > 0 && (
              <div className="p-3 border-t border-gray-200/50">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Voir toutes les notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell; 