import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PiggyBank, 
  Users, 
  TrendingUp, 
  DollarSign,
  Eye,
  Search,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Mail,
  Phone,
  Calendar,
  Wallet,
  Target,
  TrendingDown,
  Award,
  Activity
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { supabase } from '../../utils/supabaseClient';

const ABEpargne = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingsPlans, setSavingsPlans] = useState([]);
  const [stats, setStats] = useState({
    totalPlans: 0,
    totalSaved: 0,
    activePlans: 0,
    completedPlans: 0,
    suspendedPlans: 0,
    averageProgress: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    loadSavingsData();
  }, []);

  const loadSavingsData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[ADMIN_AB_EPARGNE] 📥 Chargement des plans d\'épargne...');

      // Récupérer tous les plans d'épargne
      const { data: plans, error: plansError } = await supabase
        .from('savings_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (plansError) {
        console.error('[ADMIN_AB_EPARGNE] ❌ Erreur plans:', plansError);
        setError(plansError.message || 'Erreur lors du chargement des plans');
        throw plansError;
      }

      console.log('[ADMIN_AB_EPARGNE] ✅ Plans chargés:', plans);
      console.log('[ADMIN_AB_EPARGNE] 📊 Nombre de plans:', plans?.length || 0);

      // Récupérer les IDs utilisateurs uniques
      const userIds = [...new Set(plans.map(p => p.user_id).filter(Boolean))];
      console.log('[ADMIN_AB_EPARGNE] 👥 IDs utilisateurs:', userIds);

      // Récupérer les infos des utilisateurs
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, phone_number')
        .in('id', userIds);

      if (usersError) {
        console.error('[ADMIN_AB_EPARGNE] ⚠️ Erreur utilisateurs:', usersError);
        // On continue même si les utilisateurs ne sont pas chargés
      }

      console.log('[ADMIN_AB_EPARGNE] ✅ Utilisateurs chargés:', users?.length || 0);

      // Créer un map des utilisateurs par ID
      const usersMap = {};
      (users || []).forEach(user => {
        usersMap[user.id] = user;
      });

      // Joindre les données manuellement
      const plansWithUsers = plans.map(plan => ({
        ...plan,
        users: usersMap[plan.user_id] || null
      }));

      console.log('[ADMIN_AB_EPARGNE] ✅ Plans avec utilisateurs:', plansWithUsers);

      // Formater les données
      const formattedPlans = (plansWithUsers || []).map(plan => {
        // Utiliser total_amount_target ou target_amount selon ce qui existe
        const targetAmount = plan.total_amount_target || plan.target_amount || 0;
        const currentBalance = plan.current_balance || 0;
        const progress = targetAmount > 0 
          ? Math.round((currentBalance / targetAmount) * 100) 
          : 0;

        return {
          ...plan,
          user: plan.users,
          target_amount: targetAmount,
          current_balance: currentBalance,
          monthly_amount: plan.fixed_amount || plan.monthly_amount || 0,
          progress: Math.min(progress, 100),
          daysActive: Math.floor((new Date() - new Date(plan.created_at)) / (1000 * 60 * 60 * 24)),
          isOverdue: plan.is_overdue || false,
          isSuspended: plan.is_suspended || false
        };
      });
      
      console.log('[ADMIN_AB_EPARGNE] 📋 Plans formatés:', formattedPlans);

      setSavingsPlans(formattedPlans);

      // Calculer les statistiques
      const activePlans = formattedPlans.filter(p => p.status === 'active').length;
      const completedPlans = formattedPlans.filter(p => p.status === 'completed').length;
      const suspendedPlans = formattedPlans.filter(p => p.is_suspended).length;
      const totalSaved = formattedPlans.reduce((sum, p) => sum + (p.current_balance || 0), 0);
      const avgProgress = formattedPlans.length > 0
        ? Math.round(formattedPlans.reduce((sum, p) => sum + p.progress, 0) / formattedPlans.length)
        : 0;

      setStats({
        totalPlans: formattedPlans.length,
        totalSaved,
        activePlans,
        completedPlans,
        suspendedPlans,
        averageProgress: avgProgress
      });

    } catch (error) {
      console.error('[ADMIN_AB_EPARGNE] ❌ Erreur lors du chargement:', error);
      setError(error.message || 'Une erreur est survenue');
      // Même en cas d'erreur, on initialise avec un tableau vide
      setSavingsPlans([]);
      setStats({
        totalPlans: 0,
        totalSaved: 0,
        activePlans: 0,
        completedPlans: 0,
        suspendedPlans: 0,
        averageProgress: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (plan) => {
    if (plan.is_suspended) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
          <XCircle size={14} />
          Suspendu
        </span>
      );
    }
    if (plan.is_overdue) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
          <AlertCircle size={14} />
          En retard
        </span>
      );
    }
    if (plan.status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          <CheckCircle size={14} />
          Terminé
        </span>
      );
    }
    if (plan.status === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
          <Activity size={14} />
          Actif
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
        <Clock size={14} />
        {plan.status}
      </span>
    );
  };

  const filteredPlans = savingsPlans.filter(plan => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      plan.user?.first_name?.toLowerCase().includes(term) ||
      plan.user?.last_name?.toLowerCase().includes(term) ||
      plan.user?.email?.toLowerCase().includes(term) ||
      plan.user?.phone_number?.includes(term)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={loadSavingsData}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors"
            >
              <RefreshCw size={18} />
              Réessayer
            </button>
            <button
              onClick={() => navigate('/admin')}
              className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
            >
              Retour au dashboard
            </button>
          </div>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
            <p className="text-xs text-gray-500 font-mono break-all">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 pb-24">
      {/* Header Moderne */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <PiggyBank size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-montserrat">AB Epargne</h1>
                <p className="text-gray-600 font-montserrat">Gestion des comptes d'épargne</p>
              </div>
            </div>
            
            <button
              onClick={loadSavingsData}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow"
            >
              <RefreshCw size={18} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Actualiser</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards - Design Moderne */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Plans Actifs */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Activity size={24} className="text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 font-medium">Plans Actifs</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activePlans}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">Total plans</span>
              <span className="text-sm font-semibold text-gray-700">{stats.totalPlans}</span>
            </div>
          </div>

          {/* Card 2: Total Épargné */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-white group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Wallet size={24} className="text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-green-100 font-medium">Total Épargné</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalSaved)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-4 border-t border-white/20">
              <TrendingUp size={16} className="text-green-200" />
              <span className="text-sm text-green-100">Progression moyenne: {stats.averageProgress}%</span>
            </div>
          </div>

          {/* Card 3: Statuts */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-600" />
                  <span className="text-sm text-gray-600">Terminés</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.completedPlans}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle size={18} className="text-red-600" />
                  <span className="text-sm text-gray-600">Suspendus</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.suspendedPlans}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-purple-600" />
                  <span className="text-sm text-gray-600">Taux de réussite</span>
                </div>
                <span className="text-lg font-bold text-purple-600">
                  {stats.totalPlans > 0 ? Math.round((stats.completedPlans / stats.totalPlans) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent font-montserrat"
            />
          </div>
        </div>

        {/* Liste des Plans - Design Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 font-montserrat">
              Plans d'épargne ({filteredPlans.length})
            </h2>
          </div>

          {filteredPlans.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <PiggyBank size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">Aucun plan d'épargne trouvé</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 text-green-600 hover:text-green-700 font-medium"
                >
                  Effacer la recherche
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
                >
                  <div className="p-6">
                    {/* Header du plan */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {plan.user?.first_name?.[0] || '?'}{plan.user?.last_name?.[0] || ''}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 font-montserrat">
                            {plan.user?.first_name || 'Inconnu'} {plan.user?.last_name || ''}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Mail size={14} />
                              {plan.user?.email || 'N/A'}
                            </div>
                            {plan.user?.phone_number && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Phone size={14} />
                                {plan.user.phone_number}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {getStatusBadge(plan)}
                    </div>

                    {/* Grille d'informations */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Target size={16} className="text-blue-600" />
                          <p className="text-xs text-gray-600 font-medium">Objectif</p>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(plan.target_amount)}</p>
                      </div>

                      <div className="bg-green-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Wallet size={16} className="text-green-600" />
                          <p className="text-xs text-gray-600 font-medium">Épargné</p>
                        </div>
                        <p className="text-lg font-bold text-green-700">{formatCurrency(plan.current_balance || 0)}</p>
                      </div>

                      <div className="bg-purple-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign size={16} className="text-purple-600" />
                          <p className="text-xs text-gray-600 font-medium">Mensualité</p>
                        </div>
                        <p className="text-lg font-bold text-purple-700">{formatCurrency(plan.monthly_amount || 0)}</p>
                      </div>

                      <div className="bg-orange-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar size={16} className="text-orange-600" />
                          <p className="text-xs text-gray-600 font-medium">Prochain dépôt</p>
                        </div>
                        <p className="text-sm font-bold text-orange-700">
                          {plan.next_deposit_date 
                            ? new Date(plan.next_deposit_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
                            : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Progression</span>
                        <span className="text-sm font-bold text-green-600">{plan.progress}%</span>
                      </div>
                      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500"
                          style={{ width: `${plan.progress}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                      </div>
                    </div>

                    {/* Footer avec infos supplémentaires */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Créé il y a {plan.daysActive} jours</span>
                        {plan.is_overdue && plan.days_overdue > 0 && (
                          <span className="text-orange-600 font-medium">
                            ⚠️ {plan.days_overdue} jour(s) de retard
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => setSelectedPlan(plan)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg group"
                      >
                        <Eye size={16} />
                        <span className="text-sm font-medium">Détails</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de détails */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Détails du plan</h3>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Infos utilisateur */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Users size={18} />
                  Informations client
                </h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Nom:</span> {selectedPlan.user?.first_name} {selectedPlan.user?.last_name}</p>
                  <p><span className="font-medium">Email:</span> {selectedPlan.user?.email}</p>
                  <p><span className="font-medium">Téléphone:</span> {selectedPlan.user?.phone_number || 'N/A'}</p>
                </div>
              </div>

              {/* Détails financiers */}
              <div className="bg-green-50 rounded-2xl p-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign size={18} />
                  Détails financiers
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Objectif</p>
                    <p className="font-bold text-lg">{formatCurrency(selectedPlan.target_amount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Épargné</p>
                    <p className="font-bold text-lg text-green-600">{formatCurrency(selectedPlan.current_balance || 0)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Mensualité</p>
                    <p className="font-bold">{formatCurrency(selectedPlan.monthly_amount || 0)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Fréquence</p>
                    <p className="font-bold capitalize">{selectedPlan.deposit_frequency || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Taux d'intérêt</p>
                    <p className="font-bold">{selectedPlan.interest_rate || 0}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Intérêts accumulés</p>
                    <p className="font-bold text-purple-600">{formatCurrency(selectedPlan.accumulated_interest || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Dates importantes */}
              <div className="bg-blue-50 rounded-2xl p-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar size={18} />
                  Dates importantes
                </h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Créé le:</span> {new Date(selectedPlan.created_at).toLocaleDateString('fr-FR')}</p>
                  <p><span className="font-medium">Prochain dépôt:</span> {selectedPlan.next_deposit_date ? new Date(selectedPlan.next_deposit_date).toLocaleDateString('fr-FR') : 'N/A'}</p>
                  {selectedPlan.is_overdue && (
                    <p className="text-orange-600 font-medium">⚠️ En retard depuis {selectedPlan.days_overdue} jour(s)</p>
                  )}
                </div>
              </div>

              {/* Progression visuelle */}
              <div className="bg-purple-50 rounded-2xl p-4">
                <h4 className="font-bold text-gray-900 mb-3">Progression</h4>
                <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                    style={{ width: `${selectedPlan.progress}%` }}
                  ></div>
                </div>
                <p className="text-center font-bold text-2xl text-green-600">{selectedPlan.progress}%</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ABEpargne;
