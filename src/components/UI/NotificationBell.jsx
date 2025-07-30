import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, AlertCircle, Info, Clock, DollarSign, CreditCard, FileText, Calendar } from 'lucide-react';

const NotificationBell = ({ notifications = [], onNotificationClick, className = '', fixed = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const count = notifications.filter(notif => !notif.read).length;
    setUnreadCount(count);
  }, [notifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment':
        return <DollarSign size={16} className="text-green-600" />;
      case 'loan':
        return <CreditCard size={16} className="text-blue-600" />;
      case 'reminder':
        return <Clock size={16} className="text-orange-600" />;
      case 'success':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'warning':
        return <AlertCircle size={16} className="text-yellow-600" />;
      case 'info':
        return <Info size={16} className="text-blue-600" />;
      default:
        return <Bell size={16} className="text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'payment':
        return 'bg-green-50 border-green-200';
      case 'loan':
        return 'bg-blue-50 border-blue-200';
      case 'reminder':
        return 'bg-orange-50 border-orange-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)}j`;
  };

  return (
    <div className={`relative ${fixed ? 'fixed top-24 right-4 z-[9999] sm:top-4' : 'z-[9999]'} ${className}`} ref={dropdownRef}>
      {/* Bouton de notification */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 sm:p-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-white/90 transition-all duration-200 shadow-sm hover:shadow-md ${
          fixed ? 'shadow-lg' : ''
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell size={20} className="text-gray-700 w-5 h-5 sm:w-5 sm:h-5" />
        
        {/* Badge de notification */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Dropdown des notifications */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-12 w-80 max-w-[calc(100vw-2rem)] sm:right-0 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl z-[9999] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white/50">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            {/* Liste des notifications */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell size={32} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Aucune notification</p>
                </div>
              ) : (
                <div className="p-2">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        onNotificationClick?.(notification);
                        setIsOpen(false);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
                        getNotificationColor(notification.type)
                      } ${!notification.read ? 'ring-2 ring-blue-200/50' : ''}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <p className={`text-sm font-medium ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            <span className="text-xs text-gray-500 ml-2">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          {notification.action && (
                            <div className="mt-2">
                              <span className="text-xs text-blue-600 font-medium">
                                {notification.action}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/30 to-white/30">
                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
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