import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle, XCircle, Loader } from 'lucide-react';

const TestFedaPay = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, failed
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    // Simuler un délai de chargement
    const timer = setTimeout(() => {
      setStatus('loading');
      setAmount(searchParams.get('amount') || '50000');
      setTransactionId(searchParams.get('transaction_id') || 'mock_123');
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchParams]);

  const handlePaymentSuccess = async () => {
    setStatus('success');
    
    try {
      // Appeler directement l'API de traitement du remboursement
      const loanId = searchParams.get('loan_id');
      const userId = searchParams.get('user_id');
      
      console.log('🔄 Traitement du remboursement simulé...', {
        loanId,
        userId,
        amount,
        transactionId
      });

      // Simuler l'appel au webhook FedaPay
      const webhookResponse = await fetch('/api/fedapay/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction: {
            id: transactionId,
            status: 'approved',
            amount: parseInt(amount),
            payment_method: 'mobile_money',
            paid_at: new Date().toISOString(),
            metadata: {
              loan_id: loanId,
              user_id: userId,
              type: 'loan_repayment'
            }
          }
        })
      });

      const webhookResult = await webhookResponse.json();
      console.log('✅ Webhook traité:', webhookResult);

      // Redirection après traitement
      setTimeout(() => {
        const successUrl = `/remboursement/success?transaction_id=${transactionId}&amount=${amount}&loan_id=${loanId}`;
        navigate(successUrl);
      }, 2000);

    } catch (error) {
      console.error('❌ Erreur traitement remboursement:', error);
      setStatus('failed');
    }
  };

  const handlePaymentFailure = async () => {
    setStatus('failed');
    
    try {
      // Appeler directement l'API de traitement de l'échec
      const loanId = searchParams.get('loan_id');
      const userId = searchParams.get('user_id');
      
      console.log('🔄 Traitement de l\'échec de paiement simulé...', {
        loanId,
        userId,
        amount,
        transactionId
      });

      // Simuler l'appel au webhook FedaPay avec statut échoué
      const webhookResponse = await fetch('/api/fedapay/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction: {
            id: transactionId,
            status: 'failed',
            amount: parseInt(amount),
            failure_reason: 'Paiement refusé par l\'utilisateur',
            failed_at: new Date().toISOString(),
            metadata: {
              loan_id: loanId,
              user_id: userId,
              type: 'loan_repayment'
            }
          }
        })
      });

      const webhookResult = await webhookResponse.json();
      console.log('❌ Webhook échec traité:', webhookResult);

      // Redirection après traitement
      setTimeout(() => {
        const failureUrl = `/remboursement/failure?transaction_id=${transactionId}&amount=${amount}&loan_id=${loanId}`;
        navigate(failureUrl);
      }, 2000);

    } catch (error) {
      console.error('❌ Erreur traitement échec:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CI', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount / 100);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">FedaPay Simulation</h1>
            <p className="text-gray-600">Page de paiement simulée pour les tests</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Montant à payer</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(amount)}</p>
              <p className="text-xs text-gray-500 mt-2">Transaction: {transactionId}</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handlePaymentSuccess}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Simuler Paiement Réussi</span>
            </button>

            <button
              onClick={handlePaymentFailure}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <XCircle className="w-5 h-5" />
              <span>Simuler Paiement Échoué</span>
            </button>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            <p>⚠️ Cette page simule FedaPay pour les tests</p>
            <p>En production, vous seriez redirigé vers FedaPay réel</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        {status === 'success' ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">Paiement Réussi !</h2>
            <p className="text-green-700 mb-4">Redirection en cours...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-900 mb-2">Paiement Échoué</h2>
            <p className="text-red-700 mb-4">Redirection en cours...</p>
          </>
        )}

        <div className="flex items-center justify-center">
          <Loader className="w-6 h-6 animate-spin text-gray-600" />
        </div>
      </motion.div>
    </div>
  );
};

export default TestFedaPay; 