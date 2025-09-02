import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import toast from 'react-hot-toast';

const RembourserButton = ({ loan, onSuccess, onError, onCancel }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const navigate = useNavigate();
  const fakeButtonRef = useRef(null); // bouton invisible FedaPay
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const fedaPayInitialized = useRef(false); // Protection contre les appels multiples

  // Fonction pour nettoyer complètement FedaPay
  const cleanupFedaPay = () => {
    try {
      // Fermer et détruire l'instance FedaPay
      if (window.FedaPay) {
        if (window.FedaPay.close) window.FedaPay.close();
        if (window.FedaPay.destroy) window.FedaPay.destroy();
      }
      
      // Supprimer tous les éléments DOM FedaPay
      const fedapayElements = document.querySelectorAll(
        '.fedapay-modal, .fedapay-overlay, [class*="fedapay"], [id*="fedapay"]'
      );
      fedapayElements.forEach(element => {
        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
      
      // Supprimer les styles FedaPay
      const fedapayStyles = document.querySelectorAll('style[data-fedapay], link[href*="fedapay"]');
      fedapayStyles.forEach(style => {
        if (style && style.parentNode) {
          style.parentNode.removeChild(style);
        }
      });
      
      console.log('[FEDAPAY] Nettoyage complet effectué');
    } catch (e) {
      console.log('[FEDAPAY] Erreur lors du nettoyage:', e.message);
    }
  };

  useEffect(() => {
    // Charger le script FedaPay une seule fois
    const scriptAlready = document.getElementById('fedapay-checkout');

    const loadScript = () => {
      const script = document.createElement('script');
      script.src = 'https://cdn.fedapay.com/checkout.js?v=1.1.7';
      script.id = 'fedapay-checkout';
      script.onload = () => {
        setScriptLoaded(true);
      };
      script.onerror = () => {
        showError('Erreur de chargement du script FedaPay');
      };
      document.body.appendChild(script);
    };

    if (!scriptAlready) {
      loadScript();
    } else {
      setScriptLoaded(true);
    }

    // Nettoyage au démontage du composant
    return () => {
      cleanupFedaPay();
      fedaPayInitialized.current = false;
      setInitializing(false);
    };
  }, []);

  const handleClick = () => {
    if (!loan || !user || !window.FedaPay || !fakeButtonRef.current) {
      showError('Impossible d\'initialiser le paiement.');
      return;
    }

    // Protection contre les appels multiples
    if (fedaPayInitialized.current || initializing) {
      console.log('[FEDAPAY] Initialisation déjà en cours, ignoré');
      return;
    }

    const phone = validateAndFormatPhone(user.phone_number || user.phone);
    const amount = loan.remainingAmount || loan.amount;

    setInitializing(true);
    fedaPayInitialized.current = true;

    // Nettoyer toute instance précédente si elle existe
    if (window.FedaPay && window.FedaPay.destroy) {
      try {
        window.FedaPay.destroy();
      } catch (e) {
        console.log('[FEDAPAY] Nettoyage instance précédente:', e.message);
      }
    }

    window.FedaPay.init(fakeButtonRef.current, {
      public_key: 'pk_sandbox_ZXhGKFGNXwn853-mYF9pANmi',
      transaction: {
        amount,
        description: `Remboursement prêt #${loan.id} - User:${user.id}`,
        currency: { iso: 'XOF' }
      },
      customer: {
        email: user.email,
        lastname: user.full_name || user.name || 'Client',
        phone_number: {
          number: phone,
          country: 'CI'
        }
      },
      metadata: {
        loan_id: loan.id,
        user_id: user.id,
        type: 'loan_repayment'
      },
      modal: true,
      onSuccess: function (response) {
        console.log('[FEDAPAY] Paiement réussi ✅', response);
        
        // Nettoyer complètement FedaPay
        cleanupFedaPay();
        
        fedaPayInitialized.current = false; // Réinitialiser pour permettre un nouveau paiement
        setInitializing(false);
        
        toast.success('Remboursement effectué avec succès !');
        onSuccess?.('Remboursement effectué avec succès');

        // Redirection forcée avec rechargement complet de la page
        setTimeout(() => {
          window.location.assign('/dashboard?refresh=1');
        }, 500);
      },
      onError: function (error) {
        console.error('[FEDAPAY] Erreur paiement ❌', error);
        
        // Nettoyer complètement FedaPay même en cas d'erreur
        cleanupFedaPay();
        
        fedaPayInitialized.current = false; // Réinitialiser pour permettre un nouveau paiement
        setInitializing(false);
        
        const msg = error.message || 'Paiement échoué.';
        toast.error(`Erreur: ${msg}`);
        onError?.(msg);
      },
      onClose: function () {
        console.log('[FEDAPAY] Modal fermé');
        // Nettoyage et réinitialisation même en fermeture
        cleanupFedaPay();
        fedaPayInitialized.current = false; // Réinitialiser pour permettre un nouveau paiement
        setInitializing(false);
        onCancel?.();

        // Redirection forcée avec rechargement complet de la page
        setTimeout(() => {
          window.location.assign('/dashboard?refresh=1');
        }, 300);
      }
    });

    // On "click" le bouton invisible pour lancer le paiement
    setTimeout(() => {
      fakeButtonRef.current?.click();
      // Ne pas réinitialiser setInitializing(false) ici car on le fait dans les callbacks
    }, 300);
  };

  const validateAndFormatPhone = (phone) => {
    if (!phone) return '01234567';
    const clean = phone.replace(/[\s\-]/g, '');
    if (clean.startsWith('+225') || clean.startsWith('225')) return clean.slice(-8);
    if (clean.startsWith('0')) return clean.slice(1);
    return clean;
  };

  if (!loan || !loan.remainingAmount || loan.remainingAmount <= 0) {
    return (
      <button
        disabled
        className="w-full p-4 border rounded bg-gray-400 text-white cursor-not-allowed"
      >
        Aucun montant à rembourser
      </button>
    );
  }

  return (
    <>
      {/* Bouton invisible pour le système FedaPay */}
      <button ref={fakeButtonRef} style={{ display: 'none' }}>
        Payer
      </button>

      {/* Bouton visible de l'utilisateur */}
      <button
        onClick={handleClick}
        disabled={!scriptLoaded || initializing}
        className="w-full p-4 border rounded bg-green-600 text-white hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {initializing
          ? 'Initialisation du paiement...'
          : `Effectuer le remboursement - ${new Intl.NumberFormat('fr-CI', {
              style: 'currency',
              currency: 'XOF'
            }).format(loan.remainingAmount)}`}
      </button>
    </>
  );
};

export default RembourserButton;