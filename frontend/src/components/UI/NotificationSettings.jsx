import React, { useState } from 'react';
import { Bell, BellOff, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { resetNotificationPrompt, shouldShowNotificationPrompt } from '../../utils/resetNotificationPrompt';

const NotificationSettings = ({ onClose }) => {
  const { isSupported, isSubscribed, subscribeUser, unsubscribeUser } = usePushNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleToggleNotifications = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      if (isSubscribed) {
        await unsubscribeUser();
        setMessage('Notifications désactivées');
      } else {
        const success = await subscribeUser();
        if (success) {
          setMessage('Notifications activées avec succès !');
        } else {
          setMessage('Erreur lors de l\'activation des notifications');
        }
      }
    } catch (error) {
      console.error('Erreur lors du changement d\'état des notifications:', error);
      setMessage('Erreur lors du changement d\'état des notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPrompt = () => {
    resetNotificationPrompt();
    setMessage('Prompt réinitialisé - il sera affiché au prochain chargement');
  };

  const getStatusIcon = () => {
    if (isLoading) {
      return <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />;
    }
    
    if (isSubscribed) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    
    return <AlertCircle className="w-5 h-5 text-orange-600" />;
  };

  const getStatusText = () => {
    if (isLoading) {
      return 'Chargement...';
    }
    
    if (isSubscribed) {
      return 'Notifications activées';
    }
    
    return 'Notifications désactivées';
  };

  const getStatusColor = () => {
    if (isSubscribed) {
      return 'text-green-600 bg-green-50 border-green-200';
    }
    
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  if (!isSupported) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
        <div className="text-center">
          <BellOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Notifications non supportées
          </h3>
          <p className="text-gray-600 mb-4">
            Votre navigateur ne supporte pas les notifications push.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <div className="text-center mb-6">
        <Bell className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Paramètres des notifications
        </h3>
        <p className="text-gray-600">
          Gérez vos préférences de notifications push
        </p>
      </div>

      {/* Statut actuel */}
      <div className={`p-4 rounded-lg border mb-4 ${getStatusColor()}`}>
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <p className="font-medium">{getStatusText()}</p>
            <p className="text-sm opacity-75">
              {isSubscribed 
                ? 'Vous recevrez des notifications pour les dépôts et mises à jour'
                : 'Activez les notifications pour recevoir des alertes importantes'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Message de retour */}
      {message && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
          <p className="text-blue-800 text-sm">{message}</p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={handleToggleNotifications}
          disabled={isLoading}
          className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
            isSubscribed
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } disabled:opacity-50`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Chargement...</span>
            </div>
          ) : isSubscribed ? (
            <div className="flex items-center justify-center space-x-2">
              <BellOff className="w-4 h-4" />
              <span>Désactiver les notifications</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Activer les notifications</span>
            </div>
          )}
        </button>

        <button
          onClick={handleResetPrompt}
          className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Réinitialiser le prompt
        </button>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
