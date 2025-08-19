import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const RembourserButton = ({ loan, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CI', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount / 100);
  };

  const handleRembourser = async () => {
    if (!loan || !user) {
      onError?.('Données manquantes pour le remboursement');
      return;
    }

    setLoading(true);
    try {
      console.log('[REMBOURSER_BUTTON] Début du remboursement:', {
        loanId: loan.id,
        userId: user.id,
        amount: loan.remaining_amount || loan.amount
      });

      // Créer la transaction FedaPay
      const response = await fetch('/api/fedapay/create-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: loan.remaining_amount || loan.amount,
          loanId: loan.id,
          userId: user.id,
          description: `Remboursement prêt #${loan.id}`,
          customerEmail: user.email,
          customerName: user.full_name || user.name,
          customerPhone: user.phone
        })
      });

      const result = await response.json();

      if (!result.success) {
        console.error('[REMBOURSER_BUTTON] Erreur serveur:', result);
        toast.error(`Erreur: ${result?.details || result?.error}`);
        throw new Error(result.error || result.details || 'Erreur lors de la création de la transaction');
      }

      console.log('[REMBOURSER_BUTTON] Transaction créée:', result);

      // Stocker les données de transaction et rediriger directement
      setTransactionData({
        transactionId: result.transaction_id,
        publicKey: result.public_key,
        amount: loan.remaining_amount || loan.amount,
        currency: 'XOF'
      });
      
      // Redirection directe vers FedaPay
      const paymentWindow = window.open(
        result.url,
        'FedaPay Payment',
        'width=500,height=700,scrollbars=yes,resizable=yes'
      );

      // Surveiller la fermeture de la fenêtre
      const checkClosed = setInterval(() => {
        if (paymentWindow.closed) {
          clearInterval(checkClosed);
          // Vérifier le statut de la transaction
          checkTransactionStatus(result.transaction_id, loan.id);
        }
      }, 1000);

    } catch (error) {
      console.error('[REMBOURSER_BUTTON] Erreur:', error);
      toast.error(`Erreur: ${error.message || 'Erreur lors du remboursement'}`);
      onError?.(error.message || 'Erreur lors du remboursement');
    } finally {
      setLoading(false);
    }
  };



  const checkTransactionStatus = async (transactionId, loanId) => {
    try {
      console.log('[REMBOURSER_BUTTON] Vérification du statut:', transactionId);

      const response = await fetch(`/api/fedapay/transaction/${transactionId}`);
      const result = await response.json();

      if (result.success && result.transaction.status === 'approved') {
        console.log('[REMBOURSER_BUTTON] Paiement approuvé');
        
        // Rediriger vers la page de succès
        const successUrl = `/remboursement/success?transaction_id=${transactionId}&amount=${loan.remaining_amount || loan.amount}&loan_id=${loanId}`;
        navigate(successUrl);
        
        onSuccess?.('Remboursement effectué avec succès');
      } else {
        console.log('[REMBOURSER_BUTTON] Paiement non approuvé:', result.transaction?.status);
        onError?.('Le paiement n\'a pas été approuvé');
      }
    } catch (error) {
      console.error('[REMBOURSER_BUTTON] Erreur vérification statut:', error);
      onError?.('Erreur lors de la vérification du paiement');
    }
  };



  return (
    <>
      <button
        onClick={handleRembourser}
        disabled={loading}
        className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            <span>Traitement en cours...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            <span>Effectuer le remboursement</span>
          </>
        )}
      </button>
    </>
  );
};

export default RembourserButton;
