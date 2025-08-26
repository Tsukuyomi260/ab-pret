import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';

const RembourserButton = ({ loan, user, onSuccess, onError }) => {
  const buttonRef = useRef(null);
  const navigate = useNavigate();

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
        // Initialiser FedaPay une fois le script chargé
        initializeFedaPay();
      };
      document.body.appendChild(script);
    } else {
      // Si script déjà chargé, on init directement
      initializeFedaPay();
    }
  }, [loan, user]);

  const initializeFedaPay = () => {
    if (!window.FedaPay || !buttonRef.current || !loan || !user) {
      return;
    }

    console.log('[FEDAPAY_CHECKOUT] Initialisation avec données:', {
      loanId: loan.id,
      userId: user.id,
      amount: loan.remainingAmount || loan.amount,
      customerEmail: user.email,
      calculation: `Montant original: ${loan.amount}, Montant avec intérêts: ${loan.totalAmount}, Montant payé: ${loan.paidAmount}, Montant à rembourser: ${loan.remainingAmount}`
    });

    window.FedaPay.init(buttonRef.current, {
      public_key: 'pk_live_3ZqlymxZDICZhLHG5pH5Iaz_', // 
      transaction: {
        amount: loan.remainingAmount || loan.amount,
        description: `Remboursement prêt #${loan.id}`,
        currency: { iso: 'XOF' }
      },
      customer: {
        email: user.email,
        lastname: user.full_name || user.name || 'Client',
        phone_number: {
          number: user.phone?.replace('+225', '') || '97000000',
          country: 'CI' // Côte d'Ivoire
        }
      },
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
        
        // Afficher un toast d'erreur
        toast.error(`Erreur de paiement: ${error.message || 'Paiement échoué'}`);
        
        // Appeler le callback d'erreur
        onError?.(error.message || 'Paiement échoué');
      },
      onCancel: () => {
        console.log('[FEDAPAY_CHECKOUT] Paiement annulé par l\'utilisateur');
        
        // Afficher un toast d'annulation
        toast.info('Paiement annulé');
        
        // Appeler le callback d'erreur
        onError?.('Paiement annulé par l\'utilisateur');
      }
    });
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
    <button
      ref={buttonRef}
      className="w-full p-4 border border-gray-300 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
    >
      <CreditCard className="w-5 h-5" />
      <span>Rembourser mon prêt</span>
    </button>
  );
};

export default RembourserButton;
