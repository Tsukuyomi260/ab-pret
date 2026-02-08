import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { X, ArrowLeft, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const RepaymentCancel = () => {
  const { showError } = useNotifications();
  useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const transactionId = searchParams.get('transaction_id');
  const amount = searchParams.get('amount');
  const loanId = searchParams.get('loan_id');
  const userId = searchParams.get('user_id');

  useEffect(() => {
    // Afficher une notification d'annulation
    showError('Le paiement a été annulé.');
  }, [showError]);

  const handleRetry = () => {
    setLoading(true);
    // Rediriger vers la page de remboursement pour réessayer
    setTimeout(() => {
      navigate('/remboursement');
      setLoading(false);
    }, 1000);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 min-h-screen">
      {/* Section Hero - En-tête principal */}
      <div className="relative overflow-hidden">
        {/* Background avec gradient animé - Thème annulation (jaune/orange) */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 via-orange-600 to-red-500 opacity-10 animate-gradient"></div>
        
        {/* Couche de profondeur supplémentaire */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent"></div>

        {/* Contenu Header */}
        <div className="relative px-4 lg:px-8 py-8 lg:py-12 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-8">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm border-white/30"
              >
                <ArrowLeft size={20} />
                <span>Retour au Dashboard</span>
              </Button>
            </div>

            {/* Section Hero - En-tête principal */}
            <div className="text-center mb-8 lg:mb-12">
              {/* Titre principal */}
              <h1 className="text-4xl lg:text-6xl font-bold text-orange-900 font-montserrat mb-4">
                Paiement Annulé{' '}
                <span className="inline-block">
                  ⚠️
                </span>
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal centré */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <Card title="Détails de l'annulation" className="bg-white/90 backdrop-blur-sm border-white/20">
          <div className="text-center py-8">
            {/* Icône d'annulation */}
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="w-12 h-12 text-orange-600" />
            </div>

            {/* Message principal */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Le paiement a été annulé
            </h2>

            <p className="text-gray-600 mb-6 text-lg">
              Votre paiement de{' '}
              <strong>{amount ? formatCurrency(parseInt(amount)) : 'N/A'}</strong> a été annulé.
              Aucun montant n'a été débité de votre compte.
            </p>

            {/* Détails techniques */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Détails techniques :</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Transaction ID :</strong> {transactionId || 'N/A'}</p>
                <p><strong>Prêt ID :</strong> {loanId || 'N/A'}</p>
                <p><strong>Utilisateur ID :</strong> {userId || 'N/A'}</p>
                <p><strong>Montant :</strong> {amount ? formatCurrency(parseInt(amount)) : 'N/A'}</p>
                <p><strong>Statut :</strong> <span className="text-orange-600 font-medium">Annulé</span></p>
              </div>
            </div>

            {/* Actions possibles */}
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Que pouvez-vous faire ?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Réessayer le paiement maintenant</li>
                  <li>• Retourner au dashboard pour plus tard</li>
                  <li>• Vérifier les informations de votre compte Mobile Money</li>
                  <li>• Contacter le support si vous avez des questions</li>
                </ul>
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  onClick={handleRetry}
                  disabled={loading}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Redirection...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      <span>Réessayer le paiement</span>
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleBackToDashboard}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Retour au Dashboard
                </Button>
              </div>
            </div>

            {/* Information importante */}
            <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
              <h3 className="font-semibold text-green-900 mb-2">Information importante :</h3>
              <p className="text-sm text-green-800">
                Aucun montant n'a été débité de votre compte. Vous pouvez réessayer le paiement 
                à tout moment sans aucun frais supplémentaire.
              </p>
            </div>

            {/* Support */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">
                Besoin d'aide ? Contactez notre support :
              </p>
              <div className="flex justify-center space-x-4 text-sm">
                <a href="mailto:support@campusfinance.com" className="text-primary-600 hover:text-primary-700">
                  support@campusfinance.com
                </a>
                <span className="text-gray-400">|</span>
                <a href="tel:+2250700000000" className="text-primary-600 hover:text-primary-700">
                  +225 07 00 00 00 00
                </a>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RepaymentCancel;
