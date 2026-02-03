import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../../config/backend';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeft, Plus, Minus, Wallet, Calendar, Target, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';
import FedaPayDepotButton from '../UI/FedaPayDepotButton';
import WithdrawalRequestModal from '../UI/WithdrawalRequestModal';
import toast from 'react-hot-toast';

const PlanEpargne = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        
        // Utiliser l'API backend au lieu de Supabase directement
        const backendUrl = BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/savings/plan-status?planId=${id}`);
        const result = await response.json();

        if (!result.success) {
          console.error('[PLAN_EPARGNE] ❌ Erreur récupération plan:', result.error);
          setError('Plan non trouvé ou accès refusé');
          return;
        }

        // VÉRIFICATION CRUCIALE : Bloquer l'accès si le plan n'est pas personnalisé
        const isPersonalized = result.plan.personalized_at && 
                               result.plan.personalized_at !== null &&
                               result.plan.plan_name && 
                               result.plan.plan_name.trim() !== '' && 
                               result.plan.plan_name.trim() !== 'Plan Épargne' &&
                               result.plan.goal;
        
        console.log('[PLAN_EPARGNE] 🔍 Vérification personnalisation:', {
          personalized_at: result.plan.personalized_at,
          plan_name: result.plan.plan_name,
          goal: result.plan.goal,
          isPersonalized
        });
        
        if (!isPersonalized) {
          console.log('[PLAN_EPARGNE] ⚠️ Accès bloqué : Plan non personnalisé, redirection vers personnalisation');
          // Rediriger immédiatement vers la page de personnalisation
          navigate(`/ab-epargne/personalize/${result.plan.id}`, { replace: true });
          return;
        }

        setPlan(result.plan);
        
        // Calculer le pourcentage de progression
        const currentBalance = result.plan.current_balance || 0;
        const targetAmount = result.plan.total_amount_target || result.plan.target_amount || 1;
        const percentage = Math.min((currentBalance / targetAmount) * 100, 100);
        setProgress(percentage);
        
        // Déclencher l'animation de célébration si 100%
        if (percentage >= 100 && !showCelebration) {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 5000);
        }
      } catch (error) {
        console.error('[PLAN_EPARGNE] ❌ Erreur:', error);
        setError('Erreur de chargement du plan');
      } finally {
        setLoading(false);
      }
    };

    if (user && id) {
      fetchPlan();
    }
  }, [user, id]);

  // Composant pour le cercle de progression
  const CircularProgress = ({ percentage, size = 200 }) => {
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    
    // Couleur en fonction du pourcentage
    const getColor = () => {
      if (percentage >= 100) return '#10b981'; // Vert
      if (percentage >= 75) return '#3b82f6'; // Bleu
      if (percentage >= 50) return '#f59e0b'; // Orange
      return '#ef4444'; // Rouge
    };

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          {/* Cercle de fond */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="12"
            fill="none"
          />
          {/* Cercle de progression */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor()}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Texte au centre */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold" style={{ color: getColor() }}>
            {Math.round(percentage)}%
          </span>
          <span className="text-xs text-gray-500 mt-1">complété</span>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/ab-epargne')}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold"
          >
            Retour à l'épargne
          </button>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        {loading ? (
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du plan...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Plan non trouvé</h2>
            <p className="text-gray-600 mb-6">Ce plan d'épargne n'existe pas ou vous n'y avez pas accès.</p>
            <button
              onClick={() => navigate('/ab-epargne')}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold"
            >
              Retour à l'épargne
            </button>
          </div>
        )}
      </div>
    );
  }

  // Fonction pour calculer les jours restants
  const getDaysRemaining = () => {
    if (!plan.end_date) return 0;
    const endDate = new Date(plan.end_date);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Vérifier si le plan est éligible au retrait
  const isEligibleForWithdrawal = () => {
    if (!plan) return false;
    
    const isActive = plan.status === 'active';
    const targetAmount = plan.total_amount_target || plan.target_amount || 0;
    const isCompleted = plan.current_balance >= targetAmount;
    const noDelay = !plan.is_overdue;
    const notPendingWithdrawal = plan.status !== 'withdrawal_pending';
    
    return isActive && isCompleted && noDelay && notPendingWithdrawal;
  };

  const handleWithdrawalClick = () => {
    if (!isEligibleForWithdrawal()) {
      if (plan.status === 'withdrawal_pending') {
        toast.info('Votre demande de retrait est en cours de traitement');
      } else if (plan.is_overdue) {
        toast.error('Vous ne pouvez pas effectuer de retrait car vous avez des retards de dépôt');
      } else {
        const targetAmount = plan.total_amount_target || plan.target_amount || 0;
        if (plan.current_balance < targetAmount) {
          toast.error('Vous devez atteindre votre objectif d\'épargne avant de pouvoir retirer');
        } else {
          toast.error('Retrait non disponible pour ce plan');
        }
      }
      return;
    }
    
    setShowWithdrawalModal(true);
  };

  const handleWithdrawalSuccess = (message) => {
    toast.success(message);
    setShowWithdrawalModal(false);
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  // Nom du plan (personnalisé ou par défaut)
  const planName = plan.plan_name || 'Mon Plan d\'Épargne';
  const targetAmount = plan.total_amount_target || plan.target_amount || 0;
  const currentBalance = plan.current_balance || 0;

  return (
    <div className="min-h-screen bg-gray-50 sm:bg-gray-100">
      {/* Navigation Bar */}
      <div className="bg-gray-100 sm:bg-white rounded-b-2xl sm:rounded-none">
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-4">
          <button 
            onClick={() => navigate('/ab-epargne')} 
            className="w-10 h-10 rounded-full bg-white sm:bg-gray-50 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-base sm:text-lg font-semibold text-gray-900">{planName}</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 pb-6">
        {/* Solde actuel - Style moneroo */}
        <div className="text-center mb-6 mt-6">
          <p className="text-sm text-gray-500 mb-1">Solde actuel</p>
          <p className="text-4xl sm:text-5xl font-bold text-blue-600">{currentBalance.toLocaleString()} F CFA</p>
        </div>

        {/* Boutons d'action - En haut, bien visibles */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <FedaPayDepotButton plan={plan} />
          <button 
            onClick={handleWithdrawalClick}
            disabled={!isEligibleForWithdrawal()}
            className={`py-4 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center ${
              isEligibleForWithdrawal()
                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Minus className="w-5 h-5 mr-2" />
            Retrait
          </button>
        </div>

        {/* Cercle de progression - Style moderne */}
        <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-lg p-6 sm:p-8 mb-6 flex flex-col items-center">
          <CircularProgress percentage={progress} size={180} />
          {progress >= 100 && (
            <div className="mt-4 flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">Objectif atteint ! 🎉</span>
            </div>
          )}
        </div>

        {/* Informations détaillées - Style moneroo */}
        <div className="bg-white rounded-2xl sm:rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails du plan</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Montant total prévu</span>
              <span className="text-sm font-semibold text-gray-900">{targetAmount.toLocaleString()} F</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Montant déjà épargné</span>
              <span className="text-sm font-semibold text-blue-600">{currentBalance.toLocaleString()} F</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Prochain dépôt à effectuer</span>
              <span className="text-sm font-semibold text-gray-900">{plan.fixed_amount?.toLocaleString()} F</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Date du dernier dépôt</span>
              <span className="text-sm font-medium text-gray-700">{formatDate(plan.last_deposit_date || plan.start_date)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Statut du plan</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                plan.status === 'active' ? 'bg-green-100 text-green-700' :
                plan.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                plan.status === 'interrupted' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {plan.status === 'active' ? 'En cours' :
                 plan.status === 'completed' ? 'Réussi' :
                 plan.status === 'interrupted' ? 'Interrompu' :
                 plan.status}
              </span>
            </div>
          </div>
        </div>

        {/* Détails supplémentaires */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails du plan</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Fréquence</span>
              <span className="font-medium">Tous les {plan.frequency_days} jours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Durée totale</span>
              <span className="font-medium">{plan.duration_months} mois</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taux d'intérêt</span>
              <span className="font-medium text-green-600">{plan.interest_rate || 5}% par mois</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dépôts effectués</span>
              <span className="font-medium">{plan.completed_deposits || 0} / {plan.total_deposits_required || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Prochain dépôt</span>
              <span className="font-medium text-blue-600">{formatDate(plan.next_deposit_date)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Animation de célébration */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold text-blue-600 mb-2">Félicitations !</h2>
            <p className="text-xl text-gray-700">Objectif atteint ! 🎊</p>
          </div>
        </div>
      )}

      {/* Modal de demande de retrait */}
      {showWithdrawalModal && (
        <WithdrawalRequestModal
          plan={plan}
          onClose={() => setShowWithdrawalModal(false)}
          onSuccess={handleWithdrawalSuccess}
        />
      )}
    </div>
  );
};

export default PlanEpargne;
