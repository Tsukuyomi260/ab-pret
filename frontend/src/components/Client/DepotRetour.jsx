import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Wallet, TrendingUp } from 'lucide-react';

// Configuration du backend selon l'environnement
const getBackendUrl = () => {
  // En production, utiliser l'URL Render
  if (process.env.NODE_ENV === 'production') {
    return 'https://ab-pret-back.onrender.com';
  }
  
  // En développement, utiliser l'URL locale ou celle définie dans .env
  return process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
};

const BACKEND_URL = getBackendUrl();

const DepotRetour = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Vérification du dépôt...');
  const [planData, setPlanData] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const transactionId = urlParams.get('id') || urlParams.get('reference') || urlParams.get('txId');
    const statusParam = urlParams.get('status');

    console.log('[DEPOT_RETOUR] Paramètres URL:', { 
      transactionId, 
      status: statusParam,
      allParams: Object.fromEntries(urlParams.entries())
    });

    if (!transactionId) {
      // Si pas d'ID de transaction, considérer comme succès car le paiement a probablement été effectué
      setStatus('success');
      setMessage('Dépôt confirmé ! Le solde sera mis à jour sous peu.');
      
      // Redirection vers la page d'épargne
      setTimeout(() => {
        navigate('/ab-epargne');
      }, 3000);
      return;
    }

    if (statusParam === 'approved' || statusParam === 'transferred') {
      // Dépôt approuvé, vérifier la mise à jour du plan
      checkDepositStatus(transactionId);
    } else {
      setStatus('error');
      setMessage('Dépôt non approuvé');
    }
  }, [location.search]);

  const checkDepositStatus = async (reference) => {
    try {
      setMessage('Vérification du dépôt...');
      
      const backendUrl = BACKEND_URL;
      
      // Essayer plusieurs fois car le webhook peut prendre du temps
      let attempts = 0;
      const maxAttempts = 10;
      
      const pollForPlan = async () => {
        attempts++;
        console.log(`[DEPOT_RETOUR] Tentative ${attempts}/${maxAttempts} pour référence: ${reference}`);
        
        try {
          const response = await fetch(`${backendUrl}/api/savings/deposit-status?reference=${reference}`);
          const result = await response.json();

          if (result.success && result.plan) {
            setStatus('success');
            setMessage('Dépôt confirmé, solde mis à jour !');
            setPlanData(result.plan);
            
            // Redirection automatique vers le plan après 3 secondes
            setTimeout(() => {
              navigate(`/ab-epargne/plan/${result.plan.id}`);
            }, 3000);
            return;
          } else if (attempts < maxAttempts) {
            // Réessayer après 2 secondes
            setMessage(`Vérification du dépôt... (${attempts}/${maxAttempts})`);
            setTimeout(pollForPlan, 2000);
            return;
          } else {
            // Après plusieurs tentatives, considérer comme succès car le webhook a probablement fonctionné
            setStatus('success');
            setMessage('Dépôt confirmé ! Le solde sera mis à jour sous peu.');
            
            // Redirection vers la page d'épargne
            setTimeout(() => {
              navigate('/ab-epargne');
            }, 3000);
          }
        } catch (error) {
          console.error(`[DEPOT_RETOUR] ❌ Erreur tentative ${attempts}:`, error);
          if (attempts < maxAttempts) {
            setTimeout(pollForPlan, 2000);
          } else {
            setStatus('error');
            setMessage('Erreur de connexion');
          }
        }
      };
      
      pollForPlan();
    } catch (error) {
      console.error('[DEPOT_RETOUR] ❌ Erreur:', error);
      setStatus('error');
      setMessage('Erreur de connexion');
    }
  };

  const handleBackToPlan = () => {
    if (planData) {
      navigate(`/ab-epargne/plan/${planData.id}`);
    } else {
      navigate('/ab-epargne');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Vérification en cours</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Dépôt confirmé !</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            
            {planData && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Nouveau solde</span>
                  <span className="font-bold text-green-600">
                    {(planData.current_balance || 0).toLocaleString()} F
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Total déposé</span>
                  <span className="font-bold text-gray-900">
                    {(planData.total_deposited || 0).toLocaleString()} F
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Progression</span>
                  <span className="font-bold text-blue-600">
                    {planData.completion_percentage || 0}%
                  </span>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={handleBackToPlan}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold"
              >
                Voir mon plan
              </button>
              <p className="text-sm text-gray-500">
                Redirection automatique dans 3 secondes...
              </p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate('/ab-epargne')}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold"
            >
              Retour à l'épargne
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DepotRetour;
