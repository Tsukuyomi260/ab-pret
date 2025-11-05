import React, { useState, useEffect, useRef } from 'react';
// Animations supprimées pour améliorer les performances
import { Bell, X, CheckCircle, AlertCircle, Info, Clock, DollarSign, CreditCard, FileText, Calendar, Wifi, WifiOff, CheckCheck, Trash2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useLoanCounters } from '../../hooks/useLoanCounters';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { useAuth } from '../../context/AuthContext';
import { getLoans } from '../../utils/supabaseAPI';
import { formatCurrency } from '../../utils/helpers';

const NotificationBell = ({ notifications: propNotifications, onNotificationClick, className = '', fixed = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [pendingLoanRequests, setPendingLoanRequests] = useState([]);
  const [dismissedPendingLoans, setDismissedPendingLoans] = useState(new Set());
  
  // Appeler tous les hooks en premier (ordre important !)
  const { user } = useAuth();
  const { notifications: contextNotifications, unreadCount, markAllAsRead, clearReadNotifications, refreshNotifications, showSuccess } = useNotifications();
  const { pendingRequests } = useLoanCounters(); // Utiliser le hook des compteurs
  const { isSupported, isSubscribed, subscribeUser, unsubscribeUser } = usePushNotifications();
  
  // Utiliser les notifications du contexte en priorité, sinon la prop
  const baseNotifications = contextNotifications && contextNotifications.length > 0 ? contextNotifications : (propNotifications || []);
  
  // Filtrer les notifications non lues pour l'affichage (les notifications lues ne sont pas affichées)
  const unreadNotifications = baseNotifications.filter(n => !n.read);
  
  // Combiner les notifications non lues avec les demandes en attente pour l'admin
  const allNotifications = [...unreadNotifications];
  
  // Ajouter les demandes de prêts en attente comme notifications pour l'admin
  // (sauf celles qui ont été marquées comme "dismissed")
  if (user?.role === 'admin' && pendingLoanRequests.length > 0) {
    pendingLoanRequests.forEach(loan => {
      // Ne pas ajouter si cette demande a été "dismissed"
      if (!dismissedPendingLoans.has(loan.id)) {
        allNotifications.push({
          id: `pending-loan-${loan.id}`,
          title: 'Nouvelle demande de prêt',
          message: `${loan.users?.first_name || 'Utilisateur'} ${loan.users?.last_name || ''} - ${formatCurrency(loan.amount || 0)}`,
          type: 'warning',
          priority: 'high',
          read: false,
          timestamp: loan.created_at,
          data: { loanId: loan.id, userId: loan.user_id },
          action: 'Voir la demande',
          isPendingLoan: true
        });
      }
    });
  }
  
  // Trier par date (plus récentes en premier)
  const notifications = allNotifications.sort((a, b) => {
    const dateA = new Date(a.timestamp || 0);
    const dateB = new Date(b.timestamp || 0);
    return dateB - dateA;
  });

  // Calculer le nombre de vraies notifications non lues (excluant les demandes en attente)
  const realUnreadCount = baseNotifications.filter(n => !n.read).length;
  
  // Calculer le nombre de notifications lues (excluant les demandes en attente)
  const readCount = baseNotifications.filter(n => n.read).length;
  
  // Calculer le nombre total de notifications non lues (incluant les demandes en attente pour l'affichage)
  const totalUnreadCount = notifications.filter(n => !n.read).length;
  
  // Nombre de demandes en attente (notifications dynamiques) non dismissed
  const activePendingLoanCount = pendingLoanRequests.filter(loan => !dismissedPendingLoans.has(loan.id)).length;
  const pendingLoanNotificationsCount = notifications.filter(n => n.isPendingLoan).length;
  
  // Afficher les boutons s'il y a des notifications à gérer (réelles ou demandes en attente)
  // Utiliser activePendingLoanCount au lieu de pendingRequests pour exclure les dismissed
  const hasNotificationsToManage = notifications.length > 0 || activePendingLoanCount > 0;

  // Charger les demandes en attente pour l'admin
  useEffect(() => {
    const loadPendingLoans = async () => {
      if (user?.role === 'admin' && isOpen) {
        try {
          const result = await getLoans();
          if (result.success) {
            const pending = result.data.filter(loan => loan.status === 'pending');
            setPendingLoanRequests(pending.slice(0, 10)); // Limiter à 10
            console.log('[NOTIFICATION_BELL] Demandes en attente chargées:', pending.length);
          }
        } catch (error) {
          console.error('[NOTIFICATION_BELL] Erreur chargement demandes:', error);
        }
      }
    };
    
    loadPendingLoans();
  }, [isOpen, user?.role]);

  // Rafraîchir les notifications quand on ouvre le dropdown
  useEffect(() => {
    if (isOpen && user?.id) {
      console.log('[NOTIFICATION_BELL] 🔔 Dropdown ouvert, rafraîchissement des notifications pour user:', user.id);
      console.log('[NOTIFICATION_BELL] Notifications actuelles:', notifications.length);
      setIsLoadingNotifications(true);
      
      refreshNotifications(user.id).then(() => {
        setIsLoadingNotifications(false);
        console.log('[NOTIFICATION_BELL] ✅ Notifications rafraîchies');
      }).catch((error) => {
        console.error('[NOTIFICATION_BELL] ❌ Erreur rafraîchissement:', error);
        setIsLoadingNotifications(false);
      });
    }
  }, [isOpen, user?.id]);

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
  };

  // Marquer toutes les notifications comme lues
  const handleMarkAllAsRead = async () => {
    try {
      console.log('[NOTIFICATION_BELL] 🟦 Marquage de toutes les notifications comme lues...');
      console.log('[NOTIFICATION_BELL] Notifications avant:', baseNotifications.length, 'non lues:', realUnreadCount);
      
      // Marquer les notifications de la base de données
      await markAllAsRead();
      
      // Marquer toutes les demandes en attente comme "dismissed" pour cette session
      // Elles disparaîtront de la vue immédiatement
      if (pendingLoanRequests.length > 0) {
        const newDismissed = new Set(dismissedPendingLoans);
        pendingLoanRequests.forEach(loan => {
          newDismissed.add(loan.id);
        });
        setDismissedPendingLoans(newDismissed);
        console.log('[NOTIFICATION_BELL] Demandes en attente marquées comme dismissed:', newDismissed.size);
      }
      
      // Rafraîchir les notifications IMMÉDIATEMENT pour mettre à jour l'affichage
      if (user?.id) {
        console.log('[NOTIFICATION_BELL] 🔄 Rafraîchissement des notifications...');
        await refreshNotifications(user.id);
        console.log('[NOTIFICATION_BELL] ✅ Notifications rafraîchies');
      }
      
      showSuccess('Toutes les notifications ont été marquées comme lues');
      
      // Le compteur se mettra à jour automatiquement via le contexte
      // car le contexte recalcule unreadCount à chaque changement de notifications
      // Les notifications lues disparaîtront automatiquement car on filtre avec unreadNotifications
    } catch (error) {
      console.error('[NOTIFICATION_BELL] ❌ Erreur lors du marquage:', error);
      showSuccess('Erreur lors du marquage des notifications');
    }
  };

  // Nettoyer les notifications lues
  const handleClearReadNotifications = async () => {
    try {
      await clearReadNotifications(user?.id || null);
      showSuccess('Notifications lues supprimées');
      // Rafraîchir les notifications
      if (user?.id) {
        await refreshNotifications(user.id);
      }
    } catch (error) {
      console.error('[NOTIFICATION_BELL] Erreur lors du nettoyage:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    // Si c'est une demande de prêt en attente, naviguer vers les demandes de prêts
    if (notification.isPendingLoan && notification.data?.loanId) {
      handleClose();
      // Utiliser setTimeout pour permettre la fermeture du dropdown avant la navigation
      setTimeout(() => {
        window.location.href = '/admin/loan-requests';
      }, 100);
      return;
    }
    
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

  // Déterminer le nombre total à afficher (notifications non lues + demandes en attente actives pour admin)
  // Utiliser realUnreadCount pour les notifications réelles et activePendingLoanCount pour les demandes en attente non dismissed
  const totalCount = realUnreadCount + activePendingLoanCount;

  return (
    <div className={`relative ${fixed ? 'fixed top-24 right-4 z-[9999] sm:top-4' : 'z-[9999]'} ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200/50"
      >
        <Bell size={20} className="text-gray-700 w-5 h-5 sm:w-5 sm:h-5" />
        
        {/* Badge avec le nombre total */}
        {totalCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {totalCount > 99 ? '99+' : totalCount}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] sm:w-80 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200/50 overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white/50">
              <div className="flex items-center justify-between p-4">
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
                  aria-label="Fermer"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
              
              {/* Boutons d'action */}
              {hasNotificationsToManage && (
                <div className="flex gap-2 px-4 pb-3 border-t border-gray-200/50 pt-3 bg-gray-50/30">
                  {(totalUnreadCount > 0 || activePendingLoanCount > 0) && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                      title={`Marquer ${totalUnreadCount || activePendingLoanCount} notification${(totalUnreadCount || activePendingLoanCount) > 1 ? 's' : ''} comme lue${(totalUnreadCount || activePendingLoanCount) > 1 ? 's' : ''}`}
                    >
                      <CheckCheck size={14} className="flex-shrink-0" />
                      <span>Tout marquer lu</span>
                      {(totalUnreadCount || activePendingLoanCount) > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-blue-200 text-blue-800 rounded-full text-[10px] font-bold">
                          {totalUnreadCount || activePendingLoanCount}
                        </span>
                      )}
                    </button>
                  )}
                  {readCount > 0 && (
                    <button
                      onClick={handleClearReadNotifications}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 active:bg-red-200 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                      title={`Supprimer ${readCount} notification${readCount > 1 ? 's' : ''} lue${readCount > 1 ? 's' : ''}`}
                    >
                      <Trash2 size={14} className="flex-shrink-0" />
                      <span>Nettoyer</span>
                      {readCount > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-red-200 text-red-800 rounded-full text-[10px] font-bold">
                          {readCount}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Contenu des notifications */}
            <div className="max-h-96 overflow-y-auto">
              {isLoadingNotifications ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-sm">Chargement des notifications...</p>
                </div>
              ) : notifications.length === 0 && activePendingLoanCount === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">Aucune notification</p>
                </div>
              ) : (
                <div className="p-2">
                  {notifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50/80 ${
                        !notification.read || notification.isPendingLoan ? 'bg-orange-50/50 border-l-4 border-orange-400' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {notification.type === 'success' && <CheckCircle size={16} className="text-green-500" />}
                          {notification.type === 'error' && <AlertCircle size={16} className="text-red-500" />}
                          {notification.type === 'info' && <Info size={16} className="text-blue-500" />}
                          {notification.type === 'warning' && <Clock size={16} className="text-yellow-500" />}
                          {notification.isPendingLoan && <Clock size={16} className="text-orange-500" />}
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
                    </div>
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
          </div>
        )}
    </div>
  );
};

export default NotificationBell; 