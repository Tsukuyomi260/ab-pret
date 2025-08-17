import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createLoanRepayment } from '../../utils/supabaseAPI';
import { checkFedaPayPaymentStatus } from '../../utils/fedaPayService';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const PaymentCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('');
  const [transactionData, setTransactionData] = useState(null);

  useEffect(() => {
    const handlePaymentCallback = async () => {
      try {
        // Récupérer les paramètres de l'URL
        const urlParams = new URLSearchParams(location.search);
        const transactionId = urlParams.get('transaction_id');
        const loanId = urlParams.get('loan_id');
        const userId = urlParams.get('user_id');
        const status = urlParams.get('status');

        console.log('[PAYMENT_CALLBACK] Paramètres reçus:', {
          transactionId,
          loanId,
          userId,
          status
        });

        if (!transactionId || !loanId || !userId) {
          throw new Error('Paramètres manquants');
        }

        // Vérifier le statut du paiement avec FedaPay
        const paymentResult = await checkFedaPayPaymentStatus(transactionId);
        
        if (paymentResult.success) {
          const fedapayData = paymentResult.data;
          console.log('[PAYMENT_CALLBACK] Données FedaPay:', fedapayData);

          if (fedapayData.status === 'approved' || fedapayData.status === 'completed') {
            // Paiement réussi
            setStatus('success');
            setMessage('Paiement effectué avec succès !');
            setTransactionData(fedapayData);

            // Enregistrer le remboursement dans la base de données
            const repaymentData = {
              loan_id: loanId,
              user_id: userId,
              amount: fedapayData.amount / 100, // Convertir de centimes vers FCFA
              payment_method: 'fedapay',
              fedapay_transaction_id: transactionId,
              status: 'completed',
              payment_date: fedapayData.paid_at || new Date().toISOString(),
              description: 'Remboursement de prêt via FedaPay',
              fedapay_data: fedapayData
            };

            const repaymentResult = await createLoanRepayment(repaymentData);
            
            if (!repaymentResult.success) {
              console.error('[PAYMENT_CALLBACK] Erreur lors de l\'enregistrement:', repaymentResult.error);
            }

            // Rediriger vers le dashboard après 3 secondes
            setTimeout(() => {
              navigate('/dashboard', { 
                state: { message: 'Remboursement effectué avec succès !' }
              });
            }, 3000);

          } else if (fedapayData.status === 'failed' || fedapayData.status === 'cancelled') {
            // Paiement échoué
            setStatus('error');
            setMessage('Le paiement a échoué. Veuillez réessayer.');
            setTransactionData(fedapayData);

            // Rediriger vers la page de remboursement après 3 secondes
            setTimeout(() => {
              navigate('/repayment');
            }, 3000);

          } else {
            // Statut inconnu
            setStatus('error');
            setMessage('Statut de paiement inconnu. Veuillez contacter le support.');
          }

        } else {
          throw new Error(paymentResult.error || 'Erreur lors de la vérification du paiement');
        }

      } catch (error) {
        console.error('[PAYMENT_CALLBACK] Erreur:', error);
        setStatus('error');
        setMessage('Une erreur est survenue lors du traitement du paiement.');
        
        // Rediriger vers la page de remboursement après 3 secondes
        setTimeout(() => {
          navigate('/repayment');
        }, 3000);
      }
    };

    handlePaymentCallback();
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
        <div className="text-center">
          
          {/* Icône de statut */}
          <div className="mb-6">
            {status === 'processing' && (
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            )}
          </div>

          {/* Titre */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {status === 'processing' && 'Traitement du paiement...'}
            {status === 'success' && 'Paiement réussi !'}
            {status === 'error' && 'Paiement échoué'}
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {/* Détails de la transaction */}
          {transactionData && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-gray-800">
                    {transactionData.transaction_id.substring(0, 12)}...
                  </span>
                </div>
                {transactionData.amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Montant:</span>
                    <span className="font-semibold">
                      {formatCurrency(transactionData.amount / 100)}
                    </span>
                  </div>
                )}
                {transactionData.paid_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="text-gray-800">
                      {new Date(transactionData.paid_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bouton de retour */}
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Retour au dashboard
          </button>

          {/* Message de redirection automatique */}
          <p className="text-xs text-gray-500 mt-4">
            Redirection automatique dans 3 secondes...
          </p>

        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;



