import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RepaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [repaymentData, setRepaymentData] = useState(null);

  useEffect(() => {
    // Récupérer les données de remboursement depuis l'URL ou le state
    const searchParams = new URLSearchParams(location.search);
    const transactionId = searchParams.get('transaction_id');
    const amount = searchParams.get('amount');
    const loanId = searchParams.get('loan_id');

    if (transactionId && amount && loanId) {
      setRepaymentData({
        transactionId,
        amount: parseInt(amount),
        loanId
      });
    }
  }, [location]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CI', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount / 100);
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoToLoanHistory = () => {
    navigate('/loan-history');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Carte de succès */}
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          {/* Icône de succès */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Titre */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Remboursement réussi !
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            Votre prêt a été remboursé avec succès via FedaPay.
          </p>

          {/* Détails du remboursement */}
          {repaymentData && (
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Montant remboursé :</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(repaymentData.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ID Transaction :</span>
                  <span className="font-mono text-sm text-gray-500">
                    {repaymentData.transactionId.substring(0, 12)}...
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Prêt # :</span>
                  <span className="font-semibold text-gray-900">
                    {repaymentData.loanId}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Message de confirmation */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-green-800 text-sm">
              <strong>Confirmation :</strong> Votre prêt a été marqué comme remboursé dans notre système. 
              Vous recevrez bientôt un email de confirmation.
            </p>
          </div>

          {/* Boutons d'action */}
          <div className="space-y-3">
            <button
              onClick={handleGoToLoanHistory}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voir l'historique des prêts</span>
            </button>

            <button
              onClick={handleGoToDashboard}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Retour au tableau de bord</span>
            </button>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Si vous avez des questions, contactez notre support client.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RepaymentSuccess;


