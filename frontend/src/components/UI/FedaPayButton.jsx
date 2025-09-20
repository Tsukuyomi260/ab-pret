import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const FedaPayButton = ({
  amount = 1000,
  email = 'client@example.com',
  firstname = 'Client',
  lastname = '',
  phone = '97000000',
  onSuccess = null,
  onError = null
}) => {
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

  // Charger le script checkout.js une seule fois
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
      const effectivePhone = validateAndFormatPhone(
        phone || user?.phone_number || user?.phone
      );

      console.log('[FedaPay] Initialisation avec:', {
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
          description: `Remboursement prêt - ${effectiveEmail} - ${derivedFirst} ${derivedLast}`,
          currency: { iso: 'XOF' },

          custom_metadata: {
            paymentType: 'loan_repayment',
            user_id: String(user?.id || '')
          }
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
        modal: true,

        // ✅ Le callback fiable
        onComplete: ({ reason, transaction }) => {
          console.log('[FedaPay] >>> onComplete déclenché', reason, transaction);

          if (reason === window.FedaPay.CHECKOUT_COMPLETED) {
            const txId = transaction?.reference || transaction?.id;  // 👈 Priorité à la référence
            cleanupFedaPay();

            if (txId) {
              console.log('[FedaPay] Redirection vers /repayment/success avec reference=', txId);
              // Utiliser React Router au lieu de window.location.href
              if (typeof onSuccess === 'function') {
                onSuccess({ transaction: { reference: txId } });
              }
            } else {
              console.warn('[FedaPay] Pas de transaction ID reçu.');
            }
          } else {
            console.warn('[FedaPay] Paiement non complété, reason=', reason);
          }
        },

        onError: function (error) {
          console.error('[FedaPay] Erreur de paiement ❌', error);
          cleanupFedaPay();
          if (typeof onError === 'function') {
            onError(error);
          }
        },

        onClose: function () {
          console.log('[FedaPay] Modal fermée 🔒');
          cleanupFedaPay();
        }
      });

      setIsInitialized(true);
    } catch (e) {
      console.error('[FedaPay] Init error:', e);
    }
  }, [scriptLoaded, amount, email, firstname, lastname, phone, isInitialized, user, onSuccess, onError]);

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
