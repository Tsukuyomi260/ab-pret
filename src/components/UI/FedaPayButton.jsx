import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const FedaPayButton = ({ amount = 1000, email = 'client@example.com', firstname = 'Client', lastname = '', phone = '97000000', onSuccess, onError }) => {
  const { user } = useAuth();
  const buttonRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fonction de nettoyage FedaPay
  const cleanupFedaPay = () => {
    try {
      if (window.FedaPay) {
        window.FedaPay.destroy();
      }
    } catch (e) {
      console.log('[FedaPay] Erreur lors du nettoyage:', e.message);
    }
    setIsInitialized(false);
  };

  useEffect(() => {
    const ensureScript = () => {
      const existing = document.getElementById('fedapay-checkout');
      if (existing) {
        setScriptLoaded(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.fedapay.com/checkout.js?v=1.1.7';
      script.id = 'fedapay-checkout';
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => setScriptLoaded(false);
      document.body.appendChild(script);
    };

    ensureScript();
  }, []);

  const validateAndFormatPhone = (raw) => {
    const fallback = '97223174';
    if (!raw) return fallback;
    const clean = raw.toString().replace(/[\s\-]/g, '');
    if (clean.startsWith('+229') || clean.startsWith('229')) return clean.slice(-8);
    if (clean.startsWith('0')) return clean.slice(1);
    return clean;
  };

  useEffect(() => {
    console.log('[FedaPay] useEffect déclenché:', { scriptLoaded, buttonRef: !!buttonRef.current, FedaPay: !!window.FedaPay, isInitialized });
    if (!scriptLoaded || !buttonRef.current || !window.FedaPay || isInitialized) return;

    // Nettoyer toute instance précédente
    try {
      window.FedaPay.destroy();
    } catch (e) {
      console.log('[FedaPay] Nettoyage instance précédente:', e.message);
    }

    try {
      const effectiveEmail = email || user?.email || 'client@example.com';
      const derivedFirst = firstname || user?.first_name || 'Client';
      const derivedLast = lastname || user?.last_name || 'Campus';
      const effectivePhone = validateAndFormatPhone(phone || user?.phone_number || user?.phone);

      console.log('[FedaPay] Initialisation avec les données:', {
        effectiveEmail,
        derivedFirst,
        derivedLast,
        effectivePhone,
        userId: user?.id
      });
      
      window.FedaPay.init(buttonRef.current, {
        public_key: 'pk_sandbox_ZXhGKFGNXwn853-mYF9pANmi',
        transaction: {
          amount: parseInt(amount, 10) || 1000,
          description: `Paiement plan épargne - ${effectiveEmail} - ${derivedFirst} ${derivedLast}`,
          currency: { iso: 'XOF' }
        },
        customer: {
          email: effectiveEmail,
          firstname: derivedFirst,
          lastname: derivedLast,
          phone_number: {
            number: effectivePhone || '97000000',
            country: 'BJ'
          }
        },
        metadata: {
          type: 'savings_plan_creation',
          user_id: user?.id || null,
          payment_type: 'savings_plan_creation'
        },

        modal: true,
        onSuccess: function(response) {
          console.log('[FedaPay] Paiement réussi ✅', response);
          
          // Nettoyer complètement FedaPay
          cleanupFedaPay();
          
          // Appeler directement le callback de succès
          if (typeof onSuccess === 'function') {
            console.log('[FedaPay] Appel du callback onSuccess...');
            onSuccess(response);
          } else {
            console.log('[FedaPay] Aucun callback onSuccess défini');
          }
        },
        onError: function(error) {
          console.error('[FedaPay] Erreur de paiement ❌', error);
          
          // Nettoyer complètement FedaPay même en cas d'erreur
          cleanupFedaPay();
          
          if (typeof onError === 'function') onError(error);
        },
        onClose: function() {
          console.log('[FedaPay] Modal fermée 🔒');
          
          // Nettoyage et réinitialisation même en fermeture
          cleanupFedaPay();
        }
      });
      
      setIsInitialized(true);
    } catch (e) {
      console.error('[FedaPay] Init error:', e);
    }
  }, [scriptLoaded, amount, email, firstname, lastname, phone, onSuccess, onError, isInitialized, user?.email, user?.first_name, user?.last_name, user?.phone_number, user?.phone, user?.id]);

  return (
    <button
      ref={buttonRef}
      disabled={!scriptLoaded}
      className="w-full p-4 border rounded bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-60 transition text-lg font-semibold"
    >
      💳 Payer {amount} FCFA - Frais de création
    </button>
  );
};

export default FedaPayButton;
