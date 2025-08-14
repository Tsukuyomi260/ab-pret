import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertCircle, CheckCircle, XCircle, Clock, Eye, ArrowRight } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { getLoans } from '../../utils/supabaseAPI';
import Button from '../UI/Button';

const AdminNotifications = () => {
  const { notifications, markAsRead } = useNotifications();
  const [pendingLoans, setPendingLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingLoans();
  }, []);

  const loadPendingLoans = async () => {
    try {
      setLoading(true);
      const result = await getLoans();
      
      if (result.success) {
        const pending = result.data.filter(loan => loan.status === 'pending');
        setPendingLoans(pending.slice(0, 5)); // Limiter à 5 demandes
      }
    } catch (error) {
      console.error('[ADMIN] Erreur lors du chargement des prêts en attente:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'error':
        return <XCircle size={16} className="text-red-500" />;
      case 'warning':
        return <AlertCircle size={16} className="text-yellow-500" />;
      default:
        return <Bell size={16} className="text-blue-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 FCFA';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/50 shadow-soft p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête des notifications */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Bell size={20} className="text-primary-600" />
          <span>Notifications</span>
          {notifications.length > 0 && (
            <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-1">
              {notifications.length}
            </span>
          )}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => markAsRead()}
          className="text-sm"
        >
          Tout marquer comme lu
        </Button>
      </div>

      {/* Demandes de prêts en attente */}
      {pendingLoans.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Clock size={16} className="text-yellow-600" />
            <h4 className="font-medium text-yellow-800">
              Demandes de prêts en attente ({pendingLoans.length})
            </h4>
          </div>
          <div className="space-y-2">
            {pendingLoans.map((loan) => (
              <div key={loan.id} className="flex items-center justify-between p-2 bg-white/50 rounded">
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">
                    {loan.users?.first_name} {loan.users?.last_name}
                  </p>
                  <p className="text-xs text-yellow-600">
                    {formatCurrency(loan.amount)} - {loan.purpose}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  <Eye size={12} className="mr-1" />
                  Voir
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications récentes */}
      <div className="space-y-2">
        <AnimatePresence>
          {notifications.slice(0, 5).map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`${getNotificationColor(notification.type)} border rounded-lg p-3 transition-all duration-200 hover:shadow-sm`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDate(notification.timestamp)}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Aucune notification */}
      {notifications.length === 0 && pendingLoans.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Bell size={24} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Aucune notification pour le moment</p>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
