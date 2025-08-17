import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Loader, X, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RembourserButton = ({ loan, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
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
        throw new Error(result.error || result.details || 'Erreur lors de la création de la transaction');
      }

      console.log('[REMBOURSER_BUTTON] Transaction créée:', result);

      // Stocker les données de transaction et afficher le modal
      setTransactionData({
        transactionId: result.transaction_id,
        publicKey: result.public_key,
        amount: loan.remaining_amount || loan.amount,
        currency: 'XOF'
      });
      
      setPaymentUrl(result.url);
      setShowPaymentModal(true);

    } catch (error) {
      console.error('[REMBOURSER_BUTTON] Erreur:', error);
      onError?.(error.message || 'Erreur lors du remboursement');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayment = () => {
    if (paymentUrl) {
      // Ouvrir dans une nouvelle fenêtre
      const paymentWindow = window.open(
        paymentUrl,
        'FedaPay Payment',
        'width=500,height=700,scrollbars=yes,resizable=yes'
      );

      // Surveiller la fermeture de la fenêtre
      const checkClosed = setInterval(() => {
        if (paymentWindow.closed) {
          clearInterval(checkClosed);
          // Vérifier le statut de la transaction
          checkTransactionStatus(transactionData.transactionId, loan.id);
        }
      }, 1000);

      setShowPaymentModal(false);
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

  const handleCloseModal = () => {
    setShowPaymentModal(false);
    setPaymentUrl('');
    setTransactionData(null);
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

      {/* Modal de paiement FedaPay */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md flex flex-col">
            {/* En-tête */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">F</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Paiement FedaPay</h3>
                  <p className="text-sm text-gray-600">
                    Montant: {formatCurrency(loan.remaining_amount || loan.amount)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <ExternalLink className="w-8 h-8 text-blue-600" />
                </div>
                
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    Redirection vers FedaPay
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Vous allez être redirigé vers FedaPay pour effectuer le paiement de{' '}
                    <strong>{formatCurrency(loan.remaining_amount || loan.amount)}</strong>.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h5 className="font-semibold text-blue-900 mb-2">Informations de sécurité :</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Le paiement se fait sur les serveurs sécurisés de FedaPay</li>
                    <li>• Vos données bancaires ne sont jamais stockées chez nous</li>
                    <li>• Vous recevrez une confirmation par email</li>
                  </ul>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleOpenPayment}
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Continuer</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RembourserButton;
