import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../../config/backend';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeft, Plus, Minus, Wallet, Calendar, Target, TrendingUp } from 'lucide-react';
import FedaPayDepotButton from '../UI/FedaPayDepotButton';

const PlanEpargne = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        setPlan(result.plan);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du plan...</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pt-4">
        <div className="flex items-center">
          <button onClick={() => navigate('/ab-epargne')} className="flex items-center">
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
            <p className="text-3xl font-bold">{(plan.current_balance || 0).toLocaleString()} F</p>
          </div>
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
        
        <div className="flex justify-between text-sm text-blue-100">
          <span>Plan actif depuis {formatDate(plan.start_date)}</span>
          <span>Prochain dépôt : {formatDate(plan.next_deposit_date)}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-md">
          <p className="text-gray-600 text-sm">Dépôt prévu</p>
          <p className="text-lg font-bold text-gray-800">{plan.fixed_amount?.toLocaleString()} F</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <p className="text-gray-600 text-sm">Durée restante</p>
          <p className="text-lg font-bold text-gray-800">{getDaysRemaining()} jours</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <FedaPayDepotButton plan={plan} />
        
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
            <span className="font-medium">{plan.fixed_amount?.toLocaleString()} F</span>
          </div>
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
            <span className="font-medium">{plan.completed_deposits || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Progression</span>
            <span className="font-medium text-blue-600">{plan.completion_percentage || 0}%</span>
          </div>
          <div className="border-t pt-3 flex justify-between">
            <span className="text-gray-600">Objectif d'épargne</span>
            <span className="font-semibold text-blue-600">
              {plan.total_amount_target?.toLocaleString()} F
            </span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-white rounded-xl p-6 mt-4 shadow-md">
        <h3 className="font-semibold text-gray-800 mb-4">Informations importantes</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Date de début</span>
            <span className="font-medium">{formatDate(plan.start_date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date de fin prévue</span>
            <span className="font-medium">{formatDate(plan.end_date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Prochain dépôt</span>
            <span className="font-medium text-blue-600">{formatDate(plan.next_deposit_date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total déposé</span>
            <span className="font-medium">{(plan.total_deposited || 0).toLocaleString()} F</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanEpargne;