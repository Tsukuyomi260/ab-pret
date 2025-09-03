import React, { useEffect, useRef, useState } from 'react';

const FedaPayButton = ({ amount = 1000, email = 'client@example.com', firstname = 'Client', lastname = '', phone = '97000000', onSuccess, onError }) => {
  const buttonRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

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

  useEffect(() => {
    if (!scriptLoaded || !buttonRef.current || !window.FedaPay) return;

    try {
      window.FedaPay.init(buttonRef.current, {
        public_key: 'pk_sandbox_ZXhGKFGNXwn853-mYF9pANmi',
        transaction: {
          amount: parseInt(amount, 10) || 1000,
          description: 'Paiement du plan d\'épargne AB Campus Finance',
          currency: { iso: 'XOF' }
        },
        customer: {
          email: email || 'client@example.com',
          firstname: firstname || 'Client',
          lastname: lastname || '',
          phone_number: {
            number: (phone || '').toString().replace(/\s/g, '') || '97000000',
            country: 'BJ'
          }
        },
        modal: true,
        onSuccess: function(response) {
          console.log('[FedaPay] Paiement réussi ✅', response);
          if (typeof onSuccess === 'function') onSuccess(response);
        },
        onError: function(error) {
          console.error('[FedaPay] Erreur de paiement ❌', error);
          if (typeof onError === 'function') onError(error);
        },
        onClose: function() {
          console.log('[FedaPay] Modal fermée 🔒');
        }
      });
    } catch (e) {
      console.error('[FedaPay] Init error:', e);
    }
  }, [scriptLoaded, amount, email, firstname, lastname, phone, onSuccess, onError]);

  return (
    <button
      ref={buttonRef}
      disabled={!scriptLoaded}
      className="w-full p-4 border rounded bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-60 transition"
    >
      Payer {amount} FCFA - Frais de création
    </button>
  );
};

export default FedaPayButton;
