import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createPayment, updateLoanStatus } from '../../utils/supabaseAPI';
import { useNotifications } from '../../context/NotificationContext';

const RepaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError, addNotification } = useNotifications();
  const [repaymentData, setRepaymentData] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Récupérer les données de remboursement depuis l'URL ou le state
    const searchParams = new URLSearchParams(location.search);
    const transactionId = searchParams.get('transaction_id');
    const amount = searchParams.get('amount');
    const loanId = searchParams.get('loan_id');

    if (transactionId && amount && loanId) {
      const data = {
        transactionId,
        amount: parseInt(amount),
        loanId
      };
      setRepaymentData(data);
      
      // Traiter le remboursement automatiquement
      processRepayment(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const processRepayment = async (data) => {
    if (processing) return;
    
    try {
      setProcessing(true);
      console.log('[REPAYMENT_SUCCESS] Traitement du remboursement:', data);

      // 1. Créer l'enregistrement de paiement
      const paymentData = {
        loan_id: data.loanId,
        user_id: user.id,
        amount: data.amount,
        payment_method: 'fedapay',
        fedapay_transaction_id: data.transactionId,
        status: 'completed',
        payment_date: new Date().toISOString(),
        description: `Remboursement complet du prêt #${data.loanId}`,
        metadata: {
          fedapay_data: {
            transaction_id: data.transactionId,
            amount: data.amount,
            payment_date: new Date().toISOString()
          },
          payment_type: 'loan_repayment',
          app_source: 'ab_pret_web'
        }
      };

      const paymentResult = await createPayment(paymentData);
      
      if (!paymentResult.success) {
        throw new Error('Erreur lors de la création du paiement: ' + paymentResult.error);
      }

      console.log('[REPAYMENT_SUCCESS] Paiement créé:', paymentResult.data);

      // 2. Mettre à jour le statut du prêt à "completed"
      const loanUpdateResult = await updateLoanStatus(data.loanId, 'completed');
      
      if (!loanUpdateResult.success) {
        throw new Error('Erreur lors de la mise à jour du prêt: ' + loanUpdateResult.error);
      }

      console.log('[REPAYMENT_SUCCESS] Prêt mis à jour:', loanUpdateResult.data);
      
      // 2.5. Synchroniser le statut depuis le backend (vérifie si vraiment complètement remboursé)
      try {
        let backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
        const syncResponse = await fetch(`${backendUrl}/api/sync-loan-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            loanId: data.loanId
          })
        });
        
        if (syncResponse.ok) {
          const syncResult = await syncResponse.json();
          if (syncResult.updated) {
            console.log('[REPAYMENT_SUCCESS] ✅ Statut synchronisé et corrigé par le backend');
          } else {
            console.log('[REPAYMENT_SUCCESS] ℹ️ Statut vérifié - prêt pas encore entièrement remboursé');
          }
        }
      } catch (syncError) {
        console.warn('[REPAYMENT_SUCCESS] ⚠️ Erreur synchronisation statut:', syncError);
        // Ne pas bloquer le processus
      }
      
      // 3. Déclencher immédiatement les notifications (client + admin) via FCM
      // Note: Le webhook FedaPay devrait aussi envoyer les notifications, mais on les envoie ici pour être sûr
      try {
        // Essayer d'utiliser l'URL ngrok si disponible (détectée depuis window.location si on est sur ngrok)
        let backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
        
        // Si on est sur ngrok (détecté depuis l'URL actuelle), utiliser la même base pour le backend
        const currentHost = window.location.hostname;
        if (currentHost.includes('ngrok') || currentHost.includes('ngrok-free')) {
          // Essayer de construire l'URL ngrok backend depuis l'URL frontend
          const protocol = window.location.protocol;
          const port = '5000'; // Port backend par défaut
          // Si le frontend est sur ngrok, le backend devrait être sur le même tunnel ou un autre tunnel
          // Pour l'instant, on essaie avec localhost et on laisse le webhook gérer
          console.log('[REPAYMENT_SUCCESS] ⚠️ Détection ngrok, notifications gérées par webhook');
        }
        
        console.log('[REPAYMENT_SUCCESS] 📢 Tentative envoi notifications via:', backendUrl);
        const notifyResponse = await fetch(`${backendUrl}/api/notify-repayment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            loanId: data.loanId,
            userId: user.id,
            amount: data.amount
          })
        });
        
        if (notifyResponse.ok) {
          console.log('[REPAYMENT_SUCCESS] ✅ Notifications envoyées immédiatement');
        } else {
          const errorText = await notifyResponse.text();
          console.warn('[REPAYMENT_SUCCESS] ⚠️ Erreur envoi notifications:', errorText);
          console.log('[REPAYMENT_SUCCESS] ℹ️ Les notifications seront gérées par le webhook FedaPay');
        }
      } catch (notifyError) {
        console.error('[REPAYMENT_SUCCESS] ⚠️ Erreur déclenchement notifications:', notifyError);
        console.log('[REPAYMENT_SUCCESS] ℹ️ Les notifications seront gérées par le webhook FedaPay (toutes les 30 secondes max)');
        // Ne pas bloquer le processus si les notifications échouent
      }
      
      showSuccess('Remboursement traité avec succès ! Le prêt a été marqué comme remboursé.');
      
    } catch (error) {
      console.error('[REPAYMENT_SUCCESS] Erreur lors du traitement:', error);
      showError('Erreur lors du traitement du remboursement: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

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
              <strong>Confirmation :</strong> 
              {processing ? (
                'Traitement du remboursement en cours...'
              ) : (
                'Votre prêt a été marqué comme remboursé dans notre système. Vous recevrez bientôt un email de confirmation.'
              )}
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


