import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, AlertCircle } from 'lucide-react';
import { usePushNotifications } from '../../hooks/usePushNotifications';

const PushNotificationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isSupported, isSubscribed, hasAskedPermission, subscribeUser } = usePushNotifications();

  useEffect(() => {
    const hasDeclinedPrompt = localStorage.getItem('notification-prompt-declined');
    if (hasDeclinedPrompt === 'true') return;
    if (isSubscribed) return;

    const subscriptionInactive = localStorage.getItem('subscription-inactive');
    if (subscriptionInactive !== 'true') return;

    const hasSeenPrompt = localStorage.getItem('notification-prompt-seen');
    if (hasSeenPrompt === 'true') {
      const lastSeen = localStorage.getItem('notification-prompt-last-seen');
      if (lastSeen) {
        const hoursSinceLastSeen = (Date.now() - parseInt(lastSeen)) / (1000 * 60 * 60);
        if (hoursSinceLastSeen < 24) return;
      }
    }

    if (isSupported && hasAskedPermission && !isSubscribed && Notification.permission !== 'denied') {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSupported, hasAskedPermission, isSubscribed]);

  const handleAccept = async () => {
    console.log('[PUSH PROMPT] Début de l\'activation des notifications...');
    setIsProcessing(true);
    
    try {
      const success = await subscribeUser();
      console.log('[PUSH PROMPT] Résultat de l\'abonnement:', success);
      
      // Marquer que l'utilisateur a vu le prompt, peu importe le résultat
      localStorage.setItem('notification-prompt-seen', 'true');
      localStorage.setItem('notification-prompt-last-seen', Date.now().toString());
      console.log('[PUSH PROMPT] Prompt marqué comme vu dans localStorage');
      
      if (success) {
        console.log('[PUSH PROMPT] Abonnement réussi, fermeture du prompt');
        // Marquer l'abonnement comme actif
        localStorage.setItem('subscription-active', 'true');
        localStorage.removeItem('subscription-inactive');
        setShowPrompt(false);
      } else {
        console.log('[PUSH PROMPT] Échec de l\'abonnement, fermeture du prompt quand même');
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('[PUSH PROMPT] Erreur lors de l\'abonnement:', error);
      // Marquer comme vu même en cas d'erreur
      localStorage.setItem('notification-prompt-seen', 'true');
      localStorage.setItem('notification-prompt-last-seen', Date.now().toString());
      setShowPrompt(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = () => {
    // Marquer que l'utilisateur a refusé les notifications
    localStorage.setItem('notification-prompt-seen', 'true');
    localStorage.setItem('notification-prompt-declined', 'true');
    localStorage.setItem('notification-prompt-last-seen', Date.now().toString());
    console.log('[PUSH PROMPT] Prompt marqué comme refusé - ne plus afficher');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed top-4 right-4 z-[10000] max-w-sm"
      >
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200/50 p-4 backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-start space-x-3 mb-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell size={20} className="text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm">
                Notifications requises
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Activez les notifications pour recevoir les alertes importantes sur les nouveautés et avantages 
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={handleAccept}
              disabled={isProcessing}
              className="w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Activation en cours...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>Activer les notifications maintenant</span>
                </>
              )}
            </button>
          </div>

          {/* Info supplémentaire */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <AlertCircle size={12} />
              <span>Les notifications sont essentielles pour votre expérience utilisateur</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PushNotificationPrompt;
