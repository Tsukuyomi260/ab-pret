import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BACKEND_URL } from '../../config/backend';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../utils/fetchWithAuth';

const RetourEpargne = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);
  const [pollingCount, setPollingCount] = useState(0);
  const [progress, setProgress] = useState(0);

  const backendUrl = BACKEND_URL;

  useEffect(() => {
    const pollForPlan = async () => {
      try {
        // Récupérer les paramètres depuis l'URL
        const urlParams = new URLSearchParams(location.search);
        const planId = urlParams.get("planId");
        const reference = urlParams.get("reference");
        const paymentStatus = urlParams.get("status");
        
        if ((!planId && !reference) || paymentStatus !== 'approved') {
          setError('Paiement non confirmé');
          setStatus('error');
          return;
        }

        console.log('[RETOUR_EPARGNE] 🔍 Polling pour planId:', planId, 'ou reference:', reference);

        // Polling vers l'endpoint de vérification
        let endpoint;
        if (planId) {
          // Si on a un planId, chercher directement par ID
          endpoint = `${backendUrl}/api/savings/plan-status?planId=${planId}`;
        } else if (reference && reference.startsWith('temp_')) {
          // Si c'est une référence temporaire, chercher par user_id
          endpoint = `${backendUrl}/api/savings/plan-status?userId=${user?.id}`;
        } else {
          // Sinon chercher par référence
          endpoint = `${backendUrl}/api/savings/plan-status?reference=${reference}`;
        }
          
        const response = await fetch(endpoint);
        const data = await response.json();

        console.log('[RETOUR_EPARGNE] 📡 Réponse API:', data);

        if (data.success && data.plan) {
          console.log('[RETOUR_EPARGNE] ✅ Plan trouvé');
          setPlan(data.plan);
          setStatus('success');
          
          // Vérifier si le plan est déjà personnalisé
          // CRITÈRE PRINCIPAL : personalized_at doit être présent et non null
          // Le plan_name doit être différent du nom par défaut "Plan Épargne"
          const isPersonalized = data.plan.personalized_at && 
                                 data.plan.personalized_at !== null &&
                                 data.plan.plan_name && 
                                 data.plan.plan_name.trim() !== '' && 
                                 data.plan.plan_name.trim() !== 'Plan Épargne' &&
                                 data.plan.goal;
          
          console.log('[RETOUR_EPARGNE] 🔍 Vérification personnalisation:', {
            personalized_at: data.plan.personalized_at,
            plan_name: data.plan.plan_name,
            goal: data.plan.goal,
            isPersonalized
          });
          
          // Redirection automatique vers personnalisation ou plan après 2 secondes
          // FORCER la personnalisation si le plan n'est pas encore personnalisé
          setTimeout(() => {
            if (isPersonalized) {
              console.log('[RETOUR_EPARGNE] 🚀 Plan déjà personnalisé, redirection vers PlanEpargne...');
              navigate(`/ab-epargne/plan/${data.plan.id}`, { replace: true });
            } else {
              console.log('[RETOUR_EPARGNE] 🚀 Plan non personnalisé, redirection OBLIGATOIRE vers PersonalizePlan...');
              // Utiliser replace: true pour éviter que l'utilisateur puisse revenir en arrière
              navigate(`/ab-epargne/personalize/${data.plan.id}`, { replace: true });
            }
          }, 2000);
        } else {
          const newCount = pollingCount + 1;
          console.log('[RETOUR_EPARGNE] ⏳ Plan pas encore créé, tentative:', newCount);
          setPollingCount(newCount);
          
          // Mettre à jour la barre de progression (max 30 tentatives = 100%)
          setProgress(Math.min((newCount / 30) * 100, 100));
          
          // Arrêter le polling après 30 tentatives → fallback manuel
          if (newCount >= 30) {
            console.log('[RETOUR_EPARGNE] Timeout polling, tentative traitement manuel...');
            setMessage && setMessage('Finalisation en cours...');
            try {
              const savedConfig = JSON.parse(sessionStorage.getItem('pending_savings_plan_config') || '{}');
              const manualRes = await fetchWithAuth(`${backendUrl}/api/savings/process-plan-manually`, {
                method: 'POST',
                body: JSON.stringify({
                  transaction_reference: reference || planId,
                  fixed_amount: savedConfig.fixed_amount,
                  frequency_days: savedConfig.frequency_days,
                  duration_months: savedConfig.duration_months
                })
              });
              const manualData = await manualRes.json();
              if (manualData.success && manualData.plan) {
                console.log('[RETOUR_EPARGNE] ✅ Plan créé manuellement:', manualData.plan.id);
                sessionStorage.removeItem('pending_savings_plan_config');
                setPlan(manualData.plan);
                setStatus('success');
                setTimeout(() => {
                  navigate(`/ab-epargne/personalize/${manualData.plan.id}`, { replace: true });
                }, 2000);
                return;
              }
            } catch (manualError) {
              console.error('[RETOUR_EPARGNE] Erreur fallback manuel:', manualError);
            }
            setError('Le plan n\'a pas été créé dans les temps. Veuillez contacter le support.');
            setStatus('error');
            return;
          }
          
          // Attendre 10 secondes avant le prochain polling
          setTimeout(pollForPlan, 10000);
        }
      } catch (error) {
        console.error('[RETOUR_EPARGNE] ❌ Erreur lors du polling:', error);
        
        // Incrémenter le compteur même en cas d'erreur
        setPollingCount(prev => prev + 1);
        
        // Arrêter le polling après 30 tentatives même en cas d'erreurs
        if (pollingCount >= 30) {
          setError('Erreur de connexion persistante. Veuillez contacter le support.');
          setStatus('error');
          return;
        }
        
        // Relancer le polling même en cas d'erreur (500, timeout, etc.)
        setTimeout(pollForPlan, 10000);
      }
    };

    pollForPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, navigate]);

  const handleRetry = () => {
    setStatus('loading');
    setError(null);
    setPollingCount(0);
    window.location.reload();
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Paiement confirmé !
            </h2>
            <p className="text-gray-600 mb-4">
              Création de votre plan d'épargne en cours...
            </p>
            <div className="text-sm text-gray-500">
              Tentative {pollingCount + 1}/30 • {Math.round(progress)}% complété
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-400 text-center">
              Vérification de la création du plan...
            </div>
            <p className="text-xs text-gray-500">
              Veuillez patienter, cela ne prendra que quelques instants...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Erreur de création
            </h2>
            <p className="text-gray-600 mb-4">
              {error || 'Une erreur est survenue lors de la création de votre plan.'}
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
            <button
              onClick={handleGoToDashboard}
              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success' && plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Plan créé avec succès !
            </h2>
            <p className="text-gray-600 mb-4">
              Votre plan d'épargne est maintenant actif.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Détails du plan :</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Montant par dépôt :</span>
                <span className="font-medium">{plan.fixed_amount?.toLocaleString()} F</span>
              </div>
              <div className="flex justify-between">
                <span>Objectif total :</span>
                <span className="font-medium">{plan.total_amount_target?.toLocaleString()} F</span>
              </div>
              <div className="flex justify-between">
                <span>Statut :</span>
                <span className="font-medium text-green-600 capitalize">{plan.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Progression :</span>
                <span className="font-medium">{plan.completion_percentage || 0}%</span>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 mb-4">
            Redirection automatique vers votre plan...
          </div>
          
          <button
            onClick={() => navigate(`/ab-epargne/plan/${plan.id}`)}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Voir mon plan maintenant
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default RetourEpargne;