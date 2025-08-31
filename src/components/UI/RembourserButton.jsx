import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';

const RembourserButton = ({ loan, user, onSuccess, onError }) => {
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Vérifier que les données nécessaires sont présentes
    if (!loan || !user) {
      console.error('[FEDAPAY_CHECKOUT] Données manquantes:', { loan, user });
      return;
    }

    // Injecter le script FedaPay si pas encore présent
    const existingScript = document.getElementById('fedapay-checkout');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://cdn.fedapay.com/checkout.js?v=1.1.7';
      script.id = 'fedapay-checkout';
      script.onload = () => {
        setScriptLoaded(true);
        // Initialiser FedaPay une fois le script chargé
        initializeFedaPay();
      };
      document.body.appendChild(script);
    } else {
      // Si script déjà chargé, on init directement
      setScriptLoaded(true);
      initializeFedaPay();
    }
  }, [loan, user]);

  const initializeFedaPay = () => {
    if (!window.FedaPay || !buttonRef.current || !loan || !user) {
      return;
    }

    const phoneNumber = validateAndFormatPhone(user.phone_number || user.phone);
    
    const fedapayConfig = {
      public_key: 'pk_sandbox_ZXhGKFGNXwn853-mYF9pANmi',
      transaction: {
        amount: loan.remainingAmount || loan.amount,
        description: `Remboursement prêt #${loan.id} - User:${user.id}`,
        currency: { iso: 'XOF' }
      },
      customer: {
        email: user.email,
        lastname: user.full_name || user.name || 'Client',
        phone_number: {
          number: phoneNumber,
          country: 'CI' // Côte d'Ivoire
        }
      },
      metadata: {
        loan_id: loan.id,
        user_id: user.id,
        type: 'loan_repayment',
        purpose: 'remboursement_pret'
      },
      modal: true, // 👈 Cette ligne est cruciale pour ouvrir directement la modal
      onSuccess: (transaction) => {
        console.log('[FEDAPAY_CHECKOUT] Paiement réussi:', transaction);
        
        // Afficher un toast de succès
        toast.success('Remboursement effectué avec succès !');
        
        // Appeler le callback de succès
        onSuccess?.('Remboursement effectué avec succès');
        
        // Rediriger vers la page de succès
        const successUrl = `/remboursement/success?transaction_id=${transaction.id}&amount=${loan.remainingAmount || loan.amount}&loan_id=${loan.id}`;
        navigate(successUrl);
      },
      onError: (error) => {
        console.error('[FEDAPAY_CHECKOUT] Erreur de paiement:', error);
        
        // Analyser le type d'erreur
        let errorMessage = 'Paiement échoué';
        
        if (error.message?.includes('n\'est pas valide')) {
          errorMessage = 'Numéro de téléphone invalide. Veuillez vérifier vos informations.';
        } else if (error.message?.includes('création de la transaction')) {
          errorMessage = 'Erreur lors de la création de la transaction. Veuillez réessayer.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Afficher un toast d'erreur
        toast.error(`Erreur de paiement: ${errorMessage}`);
        
        // Appeler le callback d'erreur
        onError?.(errorMessage);
      },
      onCancel: () => {
        console.log('[FEDAPAY_CHECKOUT] Paiement annulé par l\'utilisateur');
        
        // Afficher un toast d'annulation
        toast.info('Paiement annulé');
        
        // Appeler le callback d'erreur
        onError?.('Paiement annulé par l\'utilisateur');
      }
    };

    console.log('[FEDAPAY_CHECKOUT] Configuration complète FedaPay:', JSON.stringify(fedapayConfig, null, 2));
    console.log('[FEDAPAY_CHECKOUT] Metadata envoyées:', fedapayConfig.metadata);

    window.FedaPay.init(buttonRef.current, fedapayConfig);
  };

  // Fonction pour valider et formater le numéro de téléphone
  const validateAndFormatPhone = (phone) => {
    if (!phone) {
      console.warn('[FEDAPAY_CHECKOUT] Aucun numéro de téléphone fourni, utilisation d\'un numéro de test');
      return '01234567'; // Numéro de test valide pour FedaPay
    }
    
    // Nettoyer le numéro
    let cleanPhone = phone.toString().replace(/\D/g, '');
    
    // Supprimer l'indicatif pays s'il est présent
    if (cleanPhone.startsWith('225')) {
      cleanPhone = cleanPhone.substring(3);
    }
    
    // Vérifier que le numéro a au moins 8 chiffres
    if (cleanPhone.length < 8) {
      console.warn('[FEDAPAY_CHECKOUT] Numéro de téléphone trop court, utilisation d\'un numéro de test');
      return '01234567';
    }
    
    // Vérifier que le numéro ne commence pas par des zéros multiples
    if (cleanPhone.startsWith('000') || cleanPhone === '97000000') {
      console.warn('[FEDAPAY_CHECKOUT] Numéro de téléphone invalide détecté, utilisation d\'un numéro de test');
      return '01234567';
    }
    
    return cleanPhone;
  };

  // Fonction pour formater le montant
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CI', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount / 100);
  };

  // Vérifier si les données sont disponibles
  if (!loan || !user) {
    return (
      <button
        disabled
        className="w-full p-4 border border-gray-300 rounded-xl bg-gray-400 text-white cursor-not-allowed"
      >
        Données manquantes
      </button>
    );
  }

  const amount = loan.remainingAmount || loan.amount;

  // Debug: Afficher les données du prêt
  console.log('[FEDAPAY_CHECKOUT] Données du prêt reçues:', {
    loanId: loan.id,
    amount: loan.amount,
    remainingAmount: loan.remainingAmount,
    paidAmount: loan.paidAmount,
    totalAmount: loan.totalAmount,
    finalAmount: amount
  });

  return (
    <div className="space-y-3">
      {/* Message d'information */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>💡 Information :</strong> Le paiement s'ouvrira directement dans une fenêtre sécurisée. Assurez-vous que votre numéro de téléphone est correct.
        </p>
      </div>
      
      {/* Bouton de remboursement */}
      <button
        ref={buttonRef}
        disabled={!scriptLoaded}
        className={`w-full p-4 border border-gray-300 rounded-xl transition-colors flex items-center justify-center space-x-2 ${
          scriptLoaded 
            ? 'bg-purple-600 text-white hover:bg-purple-700' 
            : 'bg-gray-400 text-gray-200 cursor-not-allowed'
        }`}
      >
        {scriptLoaded ? (
          <>
            <CreditCard className="w-5 h-5" />
            <span>Rembourser mon prêt</span>
          </>
        ) : (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            <span>Chargement...</span>
          </>
        )}
      </button>
    </div>
  );
};

export default RembourserButton;
