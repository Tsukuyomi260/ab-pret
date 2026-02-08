import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, GraduationCap, Home, Bike, Smartphone, Shirt, PartyPopper, Briefcase, UtensilsCrossed, Laptop, Plane, Gift, Heart, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BACKEND_URL } from '../../config/backend';
import toast from 'react-hot-toast';

const SAVINGS_GOALS = [
  { id: 'graduation', label: 'Préparation / Soutenance', icon: GraduationCap, emoji: '🎓', color: 'from-blue-500 to-indigo-600' },
  { id: 'rent', label: 'Loyer ou hébergement', icon: Home, emoji: '🏠', color: 'from-green-500 to-emerald-600' },
  { id: 'motorcycle', label: 'Achat de moto', icon: Bike, emoji: '🚴', color: 'from-orange-500 to-red-600' },
  { id: 'phone', label: 'Achat de téléphone', icon: Smartphone, emoji: '📱', color: 'from-purple-500 to-pink-600' },
  { id: 'clothes', label: 'Achat de vêtements / Accessoires', icon: Shirt, emoji: '👕', color: 'from-pink-500 to-rose-600' },
  { id: 'party', label: 'Achat de ticket de fête ou événement', icon: PartyPopper, emoji: '🎉', color: 'from-yellow-500 to-orange-600' },
  { id: 'project', label: 'Projet personnel', icon: Briefcase, emoji: '💼', color: 'from-indigo-500 to-blue-600' },
  { id: 'nutrition', label: 'Nutrition / Cantine', icon: UtensilsCrossed, emoji: '🍽️', color: 'from-red-500 to-pink-600' },
  { id: 'laptop', label: 'Achat d\'ordinateur / Matériel scolaire', icon: Laptop, emoji: '💻', color: 'from-gray-600 to-gray-800' },
  { id: 'travel', label: 'Voyage ou sortie', icon: Plane, emoji: '✈️', color: 'from-cyan-500 to-blue-600' },
  { id: 'gift', label: 'Cadeau ou surprise', icon: Gift, emoji: '🎁', color: 'from-purple-500 to-indigo-600' },
  { id: 'custom', label: 'Autre (personnalisé)', icon: Heart, emoji: '💰', color: 'from-blue-500 to-purple-600' },
];

const PersonalizePlan = () => {
  const navigate = useNavigate();
  const { planId } = useParams();
  const { user } = useAuth();
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [customGoal, setCustomGoal] = useState('');
  const [planName, setPlanName] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setPlan] = useState(null);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId || !user) return;

      try {
        const backendUrl = BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/savings/plan-status?planId=${planId}`);
        const result = await response.json();

        if (result.success && result.plan) {
          // Vérifier si le plan est déjà personnalisé
          const isPersonalized = result.plan.personalized_at && 
                                 result.plan.personalized_at !== null &&
                                 result.plan.plan_name && 
                                 result.plan.plan_name.trim() !== '' && 
                                 result.plan.plan_name.trim() !== 'Plan Épargne' &&
                                 result.plan.goal;
          
          console.log('[PERSONALIZE_PLAN] 🔍 Vérification personnalisation:', {
            personalized_at: result.plan.personalized_at,
            plan_name: result.plan.plan_name,
            goal: result.plan.goal,
            isPersonalized
          });
          
          // Si le plan est déjà personnalisé, rediriger vers le dashboard
          if (isPersonalized) {
            console.log('[PERSONALIZE_PLAN] ⚠️ Plan déjà personnalisé, redirection vers dashboard');
            navigate(`/ab-epargne/plan/${planId}`, { replace: true });
            return;
          }
          
          setPlan(result.plan);
          // Si le plan a déjà un nom (mais pas encore personnalisé), pré-remplir
          if (result.plan.plan_name && result.plan.plan_name.trim() !== 'Plan Épargne') {
            setPlanName(result.plan.plan_name);
            // Essayer de trouver le goal correspondant
            const goal = SAVINGS_GOALS.find(g => result.plan.plan_name.includes(g.label) || result.plan.goal === g.id);
            if (goal) {
              setSelectedGoal(goal.id);
            }
          }
        } else {
          console.error('[PERSONALIZE_PLAN] Plan non trouvé');
          toast.error('Plan non trouvé');
          navigate('/ab-epargne', { replace: true });
        }
      } catch (error) {
        console.error('[PERSONALIZE_PLAN] Erreur:', error);
        toast.error('Erreur de chargement du plan');
        navigate('/ab-epargne', { replace: true });
      }
    };

    fetchPlan();
  }, [planId, user, navigate]);

  const handleGoalSelect = (goalId) => {
    setSelectedGoal(goalId);
    const goal = SAVINGS_GOALS.find(g => g.id === goalId);
    if (goal && goalId !== 'custom') {
      // Générer un nom automatique basé sur le goal
      const generatedName = goal.id === 'graduation' 
        ? `Ma Soutenance ${new Date().getFullYear()}`
        : goal.id === 'motorcycle'
        ? 'Ma Moto'
        : goal.id === 'rent'
        ? 'Mon Loyer'
        : goal.id === 'phone'
        ? 'Mon Téléphone'
        : goal.id === 'laptop'
        ? 'Mon Ordinateur'
        : `Mon ${goal.label.replace('Achat de ', '').replace(' ou ', '/').split(' ')[0]}`;
      setPlanName(generatedName);
    } else if (goalId === 'custom') {
      setPlanName('');
    }
  };

  const handleSubmit = async () => {
    if (!selectedGoal) {
      toast.error('Veuillez sélectionner un objectif');
      return;
    }

    if (selectedGoal === 'custom' && !customGoal.trim()) {
      toast.error('Veuillez saisir votre objectif personnalisé');
      return;
    }

    if (!planName.trim()) {
      toast.error('Veuillez donner un nom à votre plan');
      return;
    }

    try {
      setLoading(true);

      const goalData = selectedGoal === 'custom' ? customGoal : SAVINGS_GOALS.find(g => g.id === selectedGoal)?.label;
      const goalId = selectedGoal === 'custom' ? 'custom' : selectedGoal;

      console.log('[PERSONALIZE_PLAN] 📝 Envoi de la personnalisation au backend...', {
        planId,
        planName: planName.trim(),
        goal: goalId,
        goalLabel: goalData
      });

      // Utiliser l'API backend au lieu de Supabase directement (plus rapide et fiable)
      const backendUrl = BACKEND_URL;
      
      // Créer un AbortController pour timeout (30 secondes max)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes timeout
      
      try {
        const response = await fetch(`${backendUrl}/api/savings/personalize-plan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId: planId,
            planName: planName.trim(),
            goal: goalId,
            goalLabel: goalData
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const result = await response.json();

        if (!response.ok || !result.success) {
          console.error('[PERSONALIZE_PLAN] ❌ Erreur API:', result);
          toast.error(result.error || 'Erreur lors de la sauvegarde');
          return;
        }

        console.log('[PERSONALIZE_PLAN] ✅ Plan personnalisé avec succès:', result.plan);

        toast.success('Plan personnalisé avec succès ! 🎉');
        
        // Redirection vers le tableau de bord du plan (utiliser replace pour éviter le retour)
        setTimeout(() => {
          navigate(`/ab-epargne/plan/${planId}`, { replace: true });
        }, 500);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          console.error('[PERSONALIZE_PLAN] ❌ Timeout: La requête a pris trop de temps');
          toast.error('La requête a pris trop de temps. Veuillez vérifier votre connexion et réessayer.');
        } else if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
          console.error('[PERSONALIZE_PLAN] ❌ Erreur réseau:', fetchError);
          toast.error('Erreur de connexion au serveur. Vérifiez votre connexion internet.');
        } else {
          console.error('[PERSONALIZE_PLAN] ❌ Erreur:', fetchError);
          toast.error('Erreur lors de la personnalisation. Veuillez réessayer.');
        }
      }
    } catch (error) {
      console.error('[PERSONALIZE_PLAN] ❌ Erreur inattendue:', error);
      toast.error('Une erreur inattendue est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 sm:bg-gray-100">
      {/* Navigation Bar */}
      <div className="bg-gray-100 sm:bg-white rounded-b-2xl sm:rounded-none mb-4 sm:mb-6">
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white sm:bg-gray-50 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-base sm:text-lg font-semibold text-gray-900">Personnalisez votre plan</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-lg sm:shadow-xl p-6 sm:p-8 mx-auto max-w-md sm:max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Choisissez votre objectif</h2>
          <p className="text-gray-600 text-sm">Donnez un nom à votre plan d'épargne</p>
        </div>

        {/* Goals Grid */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Objectif d'épargne <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {SAVINGS_GOALS.map((goal) => {
              const Icon = goal.icon;
              const isSelected = selectedGoal === goal.id;
              return (
                <button
                  key={goal.id}
                  onClick={() => handleGoalSelect(goal.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${goal.color} flex items-center justify-center text-white text-lg`}>
                      {goal.emoji}
                    </div>
                    {goal.id !== 'custom' && (
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                    )}
                  </div>
                  <p className={`text-xs font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                    {goal.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Goal Input */}
        {selectedGoal === 'custom' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Votre objectif personnalisé <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              placeholder="Ex: Épargner pour un événement spécial..."
              className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50"
            />
          </div>
        )}

        {/* Plan Name Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Nom de votre plan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="Ex: Ma Moto, Ma Soutenance 2025..."
            className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50"
          />
          <p className="text-xs text-gray-500 mt-1">Ce nom s'affichera sur votre tableau de bord</p>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !selectedGoal || !planName.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-base shadow-md hover:shadow-lg transition-all duration-200 mb-6"
        >
          {loading ? 'Enregistrement...' : 'Continuer'}
        </button>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Personnalisez votre expérience d'épargne
          </p>
        </div>
      </div>
    </div>
  );
};

export default PersonalizePlan;

