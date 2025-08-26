import React, { useEffect, useRef, useState } from 'react';

const FedaPaySimpleButton = () => {
  const buttonRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.fedapay.com/checkout.js?v=1.1.7';
    script.id = 'fedapay-checkout';

    script.onload = () => {
      setScriptLoaded(true);
      if (window.FedaPay && buttonRef.current) {
        window.FedaPay.init(buttonRef.current, {
          public_key: 'pk_sandbox_ZXhGKFGNXwn853-mYF9pANmi',
          transaction: {
            amount: 1000,
            description: 'Paiement rapide',
            currency: { iso: 'XOF' }
          },
          customer: {
            email: 'client@example.com',
            lastname: 'Nom'
          },
          modal: true,
          onSuccess: function (response) {
            console.log('[FedaPay] Paiement réussi ✅', response);
            // 👉 Ajoute ici une redirection ou action après paiement
          },
          onError: function (error) {
            console.error('[FedaPay] Erreur de paiement ❌', error);
            // 👉 Affiche une alerte ou message d’erreur à l’utilisateur
          },
          onClose: function () {
            console.log('[FedaPay] Modal fermée 🔒');
          }
        });
      }
    };

    if (!document.getElementById('fedapay-checkout')) {
      document.body.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, []);

  return (
    <button
      ref={buttonRef}
      disabled={!scriptLoaded}
      className="w-full p-4 border rounded bg-violet-600 text-white hover:bg-green-700 transition"
    >
      Payer 1000 FCFA- Frais de création
    </button>
  );
};

export default FedaPaySimpleButton;
