import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Minus, Calendar, CreditCard, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FedaPayEpargneButton from '../UI/FedaPayEpargneButton';
import { BACKEND_URL } from '../../config/backend';

const ABEpargne = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('config');
  const [planConfig, setPlanConfig] = useState({
    montant: 500,
    frequence: '5',
    nombreMois: 6
  });
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Vérifier si on vient d'un paiement (rechargement après paiement)
  useEffect(() => {
    const checkPaymentReturn = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const reference = urlParams.get('reference');
      const status = urlParams.get('status');
      
      if (reference && status === 'approved') {
        console.log('[AB_EPARGNE] 🔄 Paiement détecté, redirection vers RetourEpargne');
        // Nettoyer l'URL et rediriger vers RetourEpargne
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate(`/ab-epargne/retour?reference=${reference}&status=approved`);
      return;
    }
    };

    checkPaymentReturn();
  }, [navigate]);
  
  const handleConfigSubmit = () => {
    setShowPayment(true);
  };

  const handleBackToHome = () => {
    navigate('/dashboard');
  };

  // Récupérer le plan d'épargne actif de l'utilisateur
  useEffect(() => {
    const fetchActivePlan = async () => {
      if (!user) {
        console.log('[AB_EPARGNE] ⏳ Pas d\'utilisateur connecté');
        setLoading(false);
        return;
      }
    
      try {
        setLoading(true);
        console.log('[AB_EPARGNE] 🔍 Recherche du plan actif pour user:', user.id);
        
        // Utiliser l'API backend au lieu de Supabase directement
        const backendUrl = BACKEND_URL;
        const url = `${backendUrl}/api/savings/plan-status?userId=${user.id}`;
        console.log('[AB_EPARGNE] 🌐 URL API:', url);
        
        const response = await fetch(url);
        console.log('[AB_EPARGNE] 📡 Status réponse:', response.status);
        
        const result = await response.json();
        console.log('[AB_EPARGNE] 📡 Réponse API complète:', result);

        if (result.success && result.plan) {
          console.log('[AB_EPARGNE] ✅ Plan actif trouvé:', result.plan);
          
          // Vérifier si le plan est personnalisé (ÉTAPE CRUCIALE)
          const isPersonalized = result.plan.personalized_at && 
                                 result.plan.personalized_at !== null &&
                                 result.plan.plan_name && 
                                 result.plan.plan_name.trim() !== '' && 
                                 result.plan.plan_name.trim() !== 'Plan Épargne' &&
                                 result.plan.goal;
          
          console.log('[AB_EPARGNE] 🔍 Vérification personnalisation:', {
            personalized_at: result.plan.personalized_at,
            plan_name: result.plan.plan_name,
            goal: result.plan.goal,
            isPersonalized
          });
          
          // FORCER la personnalisation si le plan n'est pas encore personnalisé
          if (!isPersonalized) {
            console.log('[AB_EPARGNE] ⚠️ Plan non personnalisé, redirection OBLIGATOIRE vers personnalisation');
            navigate(`/ab-epargne/personalize/${result.plan.id}`, { replace: true });
            return;
          }
          
          // Si personnalisé, rediriger vers le dashboard du plan
          console.log('[AB_EPARGNE] ✅ Plan personnalisé, redirection vers dashboard');
          navigate(`/ab-epargne/plan/${result.plan.id}`, { replace: true });
          return;
        } else {
          console.log('[AB_EPARGNE] ℹ️ Aucun plan actif trouvé, affichage de la config');
        }
      } catch (error) {
        console.error('[AB_EPARGNE] ❌ Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivePlan();
  }, [user, navigate]);


  const ConfigPage = () => (
    <div className="min-h-screen bg-gray-50 sm:bg-gray-100">
      {/* Navigation Bar - Style moneroo */}
      <div className="bg-gray-100 sm:bg-white rounded-b-2xl sm:rounded-none mb-4 sm:mb-6">
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-4">
          <button 
            onClick={handleBackToHome} 
            className="w-10 h-10 rounded-full bg-white sm:bg-gray-50 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-base sm:text-lg font-semibold text-gray-900">Configuration du Plan</h1>
          <div className="w-10"></div> {/* Spacer pour centrer le titre */}
        </div>
      </div>

      {/* Total Amount Section - Style moneroo */}
      <div className="text-center mb-6 sm:mb-8 px-4">
        <p className="text-sm text-gray-500 mb-2">Total amount</p>
        <p className="text-4xl sm:text-5xl font-bold text-blue-600">1 000 F CFA</p>
      </div>

      {/* Main Content Card - Style moneroo */}
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-lg sm:shadow-xl p-6 sm:p-8 mx-auto max-w-md sm:max-w-lg">

        {/* Montant à déposer */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Montant à déposer <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center bg-gray-50 rounded-xl p-4 border border-blue-200">
            <button 
              onClick={() => setPlanConfig({...planConfig, montant: Math.max(500, planConfig.montant - 100)})}
              className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Minus className="w-4 h-4 text-gray-600" />
            </button>
            <div className="flex-1 text-center">
              <input
                type="number"
                min="500"
                step="100"
                value={planConfig.montant}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 500;
                  setPlanConfig({...planConfig, montant: Math.max(500, value)});
                }}
                onFocus={(e) => {
                  e.target.select();
                }}
                onClick={(e) => {
                  e.target.select();
                }}
                className="w-full text-xl font-semibold text-gray-900 text-center bg-transparent border-none outline-none focus:outline-none cursor-pointer"
                style={{ width: `${Math.max(planConfig.montant.toString().length + 2, 6)}ch` }}
                placeholder="500"
              />
              <span className="text-gray-600 ml-1">F</span>
            </div>
            <button 
              onClick={() => setPlanConfig({...planConfig, montant: planConfig.montant + 100})}
              className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Minimum 500 F</p>
        </div>

        {/* Fréquence */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Fréquence de dépôt <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setPlanConfig({...planConfig, frequence: '5'})}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                planConfig.frequence === '5' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-blue-300'
              }`}
            >
              Tous les 5 jours
            </button>
            <button
              onClick={() => setPlanConfig({...planConfig, frequence: '10'})}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                planConfig.frequence === '10' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-blue-300'
              }`}
            >
              Tous les 10 jours
            </button>
          </div>
        </div>

        {/* Nombre de mois */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Durée (mois) <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center bg-gray-50 rounded-xl p-4 border border-blue-200">
            <button
              onClick={() => setPlanConfig({...planConfig, nombreMois: Math.max(1, planConfig.nombreMois - 1)})}
              className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Minus className="w-4 h-4 text-gray-600" />
            </button>
            <div className="flex-1 text-center">
              <span className="text-xl font-semibold text-gray-900">{planConfig.nombreMois}</span>
              <span className="text-gray-600 ml-1">mois</span>
            </div>
            <button 
              onClick={() => setPlanConfig({...planConfig, nombreMois: planConfig.nombreMois + 1})}
              className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Résumé */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Résumé de votre plan</h3>
          <div className="text-xs text-gray-600 space-y-2">
            <p>• Dépôt : {planConfig.montant.toLocaleString()} F tous les {planConfig.frequence} jours</p>
            <p>• Durée : {planConfig.nombreMois} mois</p>
            <p>• Taux d'intérêts : 5% par mois</p>
            <p>• Total déposé : {(planConfig.montant * (30 / parseInt(planConfig.frequence)) * planConfig.nombreMois).toLocaleString()} F</p>
            <p>• Intérêts estimés : {Math.round(planConfig.montant * (30 / parseInt(planConfig.frequence)) * planConfig.nombreMois * 0.05 * planConfig.nombreMois).toLocaleString()} F</p>
            <p className="font-semibold text-blue-600 pt-2 border-t border-gray-200">• Total avec intérêts : {Math.round(planConfig.montant * (30 / parseInt(planConfig.frequence)) * planConfig.nombreMois * (1 + 0.05 * planConfig.nombreMois)).toLocaleString()} F</p>
          </div>
        </div>

        {/* Pay Now Button - Style moneroo */}
        <button
          onClick={handleConfigSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold text-base shadow-md hover:shadow-lg transition-all duration-200 mb-6"
        >
          Pay now
        </button>

        {/* Footer - Style moneroo */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Powered by</p>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-blue-600">AB Campus Finance</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Offer your customers a tailor-made payment experience
          </p>
        </div>
      </div>

      {/* Payment Modal - Style moneroo */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-6">
              <CreditCard className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Paiement requis</h3>
              <p className="text-gray-600 text-sm">Frais de création du plan d'épargne</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center border border-gray-200">
              <span className="text-2xl font-bold text-gray-900">1 000 F</span>
            </div>
                    
            <div className="flex gap-3">
              <button
                onClick={() => setShowPayment(false)}
                className="flex-1 py-3 text-gray-600 font-medium hover:text-gray-800 transition-colors"
              >
                Annuler
              </button>
              <div className="flex-1">
                <FedaPayEpargneButton planConfig={planConfig} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const DashboardPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pt-4">
        <div className="flex items-center">
          <button onClick={handleBackToHome} className="flex items-center">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 ml-4">Mon Plan d'Épargne</h1>
                    </div>
                  </div>
                  
      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 mb-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
                      <div>
            <p className="text-blue-100 text-sm">Solde disponible</p>
            <p className="text-3xl font-bold">0 F</p>
                    </div>
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Wallet className="w-6 h-6" />
                  </div>
                </div>

        <div className="flex justify-between text-sm text-blue-100">
          <span>Plan actif depuis aujourd'hui</span>
          <span>Prochain dépôt : {planConfig.frequence} jours</span>
                </div>
              </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-md">
          <p className="text-gray-600 text-sm">Dépôt prévu</p>
          <p className="text-lg font-bold text-gray-800">{planConfig.montant.toLocaleString()} F</p>
              </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <p className="text-gray-600 text-sm">Durée restante</p>
          <p className="text-lg font-bold text-gray-800">{planConfig.nombreMois} mois</p>
              </div>
            </div>
                  
      {/* Action Buttons */}
            <div className="space-y-4">
        <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold shadow-lg flex items-center justify-center">
          <Plus className="w-5 h-5 mr-2" />
          Effectuer un Dépôt
        </button>
        
        <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-semibold shadow-lg flex items-center justify-center">
          <Minus className="w-5 h-5 mr-2" />
          Effectuer un Retrait
        </button>
                      </div>

      {/* Plan Details */}
      <div className="bg-white rounded-xl p-6 mt-6 shadow-md">
        <h3 className="font-semibold text-gray-800 mb-4">Détails du plan</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Montant par dépôt</span>
            <span className="font-medium">{planConfig.montant.toLocaleString()} F</span>
                      </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Fréquence</span>
            <span className="font-medium">Tous les {planConfig.frequence} jours</span>
                      </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Durée totale</span>
            <span className="font-medium">{planConfig.nombreMois} mois</span>
                    </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Taux d'intérêts</span>
            <span className="font-medium text-green-600">5% par mois</span>
                  </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total déposé</span>
            <span className="font-medium">
              {(planConfig.montant * (30 / parseInt(planConfig.frequence)) * planConfig.nombreMois).toLocaleString()} F
                        </span>
                      </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Intérêts estimés</span>
            <span className="font-medium text-green-600">
              {Math.round(planConfig.montant * (30 / parseInt(planConfig.frequence)) * planConfig.nombreMois * 0.05 * planConfig.nombreMois).toLocaleString()} F
                        </span>
                      </div>
          <div className="border-t pt-3 flex justify-between">
            <span className="text-gray-600">Objectif d'épargne</span>
            <span className="font-semibold text-blue-600">
              {Math.round(planConfig.montant * (30 / parseInt(planConfig.frequence)) * planConfig.nombreMois * (1 + 0.05 * planConfig.nombreMois)).toLocaleString()} F
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
  );

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen relative">
      {loading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 bg-white/95 shadow-lg rounded-full border border-gray-200">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-600">Vérification du plan...</span>
        </div>
      )}
      {currentPage === 'config' ? <ConfigPage /> : <DashboardPage />}
    </div>
  );
};

export default ABEpargne; 
