import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, AlertCircle, Info, Clock, DollarSign, CreditCard, FileText, Calendar, Wifi, WifiOff } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useLoanCounters } from '../../hooks/useLoanCounters';
import { usePushNotifications } from '../../hooks/usePushNotifications';

const NotificationBell = ({ notifications = [], onNotificationClick, className = '', fixed = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const { unreadCount, markAllAsRead } = useNotifications();
  const { pendingRequests } = useLoanCounters(); // Utiliser le hook des compteurs
  const { isSupported, isSubscribed, subscribeUser, unsubscribeUser } = usePushNotifications();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (unreadCount > 0) {
      markAllAsRead();
    }
  };

  const handleNotificationClick = (notification) => {
    onNotificationClick?.(notification);
    handleClose();
  };

  // Gérer l'abonnement aux notifications push
  const handlePushSubscription = async () => {
    if (isSubscribed) {
      await unsubscribeUser();
    } else {
      await subscribeUser();
    }
  };

  // Déterminer le nombre total à afficher (notifications + demandes en attente pour admin)
  const totalCount = unreadCount + pendingRequests;

  return (
    <div className={`relative ${fixed ? 'fixed top-24 right-4 z-[9999] sm:top-4' : 'z-[9999]'} ${className}`} ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200/50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell size={20} className="text-gray-700 w-5 h-5 sm:w-5 sm:h-5" />
        
        {/* Badge avec le nombre total */}
        {totalCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
          >
            {totalCount > 99 ? '99+' : totalCount}
          </motion.div>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200/50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white/50">
              <div>
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {pendingRequests > 0 && (
                  <p className="text-sm text-orange-600 font-medium">
                    {pendingRequests} demande{pendingRequests > 1 ? 's' : ''} en attente
                  </p>
                )}
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            {/* Contenu des notifications */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">Aucune notification</p>
                  {pendingRequests > 0 && (
                    <p className="text-xs text-orange-600 mt-2">
                      {pendingRequests} demande{pendingRequests > 1 ? 's' : ''} en attente de validation
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-2">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50/80 ${
                        !notification.read ? 'bg-blue-50/50 border-l-4 border-blue-400' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {notification.type === 'success' && <CheckCircle size={16} className="text-green-500" />}
                          {notification.type === 'error' && <AlertCircle size={16} className="text-red-500" />}
                          {notification.type === 'info' && <Info size={16} className="text-blue-500" />}
                          {notification.type === 'warning' && <Clock size={16} className="text-yellow-500" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 leading-5">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 leading-5 mt-1">
                            {notification.message}
                          </p>
                          {notification.action && (
                            <p className="text-xs text-blue-600 font-medium mt-2">
                              {notification.action} →
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200/50 bg-gray-50/30">
              {/* Gestion des notifications push */}
              {isSupported && (
                <div className="mb-3">
                  <button
                    onClick={handlePushSubscription}
                    className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isSubscribed
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {isSubscribed ? (
                      <>
                        <Wifi size={16} />
                        <span>Notifications activées</span>
                      </>
                    ) : (
                      <>
                        <WifiOff size={16} />
                        <span>Activer les notifications</span>
                      </>
                    )}
                  </button>
                </div>
              )}
              
              {/* Compteurs de notifications */}
              {notifications.length > 0 && (
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</span>
                  {pendingRequests > 0 && (
                    <span className="text-orange-600 font-medium">
                      {pendingRequests} en attente
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell; 