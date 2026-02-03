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
  Activity,
  CreditCard,
  ArrowLeft
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { supabase } from '../../utils/supabaseClient';
import toast from 'react-hot-toast';

const ABEpargne = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' ou 'withdrawals'

  useEffect(() => {
    loadSavingsData();
    loadWithdrawalRequests();
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

  const loadWithdrawalRequests = async () => {
    try {
      console.log('[ADMIN_AB_EPARGNE] 📥 Chargement des demandes de retrait...');

      // Récupérer toutes les demandes de retrait
      const { data: requests, error: requestsError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('[ADMIN_AB_EPARGNE] ❌ Erreur demandes:', requestsError);
        throw requestsError;
      }

      console.log('[ADMIN_AB_EPARGNE] ✅ Demandes chargées:', requests);

      // Récupérer les IDs utilisateurs et plans
      const userIds = [...new Set(requests.map(r => r.user_id).filter(Boolean))];
      const planIds = [...new Set(requests.map(r => r.savings_plan_id).filter(Boolean))];

      // Récupérer les infos des utilisateurs
      const { data: users } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, phone_number')
        .in('id', userIds);

      // Récupérer les infos des plans
      const { data: plans } = await supabase
        .from('savings_plans')
        .select('id, target_amount, current_balance')
        .in('id', planIds);

      // Créer des maps
      const usersMap = {};
      (users || []).forEach(user => {
        usersMap[user.id] = user;
      });

      const plansMap = {};
      (plans || []).forEach(plan => {
        plansMap[plan.id] = plan;
      });

      // Joindre les données
      const requestsWithData = requests.map(request => ({
        ...request,
        user: usersMap[request.user_id] || null,
        plan: plansMap[request.savings_plan_id] || null
      }));

      setWithdrawalRequests(requestsWithData);
      console.log('[ADMIN_AB_EPARGNE] ✅ Demandes formatées:', requestsWithData);
    } catch (error) {
      console.error('[ADMIN_AB_EPARGNE] ❌ Erreur chargement demandes:', error);
    }
  };

  const handleApproveWithdrawal = async (withdrawal) => {
    try {
      console.log('[ADMIN_AB_EPARGNE] ✅ Approbation retrait:', withdrawal.id);
      
      // Mettre à jour le statut de la demande
      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'approved',
          processed_at: new Date().toISOString(),
          processed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', withdrawal.id);

      if (updateError) throw updateError;

      // Remettre le plan à zéro
      const { error: planError } = await supabase
        .from('savings_plans')
        .update({
          current_balance: 0,
          target_amount: 0,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', withdrawal.savings_plan_id);

      if (planError) throw planError;

      // Créer une notification pour le client
      await supabase
        .from('notifications')
        .insert([{
          user_id: withdrawal.user_id,
          title: 'Retrait approuvé',
          message: `Votre retrait de ${formatCurrency(withdrawal.amount)} a été approuvé et transféré.`,
          type: 'withdrawal_approved',
          data: {
            withdrawal_id: withdrawal.id,
            amount: withdrawal.amount
          }
        }]);

      toast.success('Retrait approuvé avec succès !');
      setSelectedWithdrawal(null);
      
      // Recharger les données
      loadWithdrawalRequests();
      loadSavingsData();
    } catch (error) {
      console.error('[ADMIN_AB_EPARGNE] ❌ Erreur approbation:', error);
      toast.error('Erreur lors de l\'approbation du retrait');
    }
  };

  const handleRejectWithdrawal = async (withdrawal, reason) => {
    try {
      console.log('[ADMIN_AB_EPARGNE] ❌ Rejet retrait:', withdrawal.id);
      
      // Mettre à jour le statut de la demande
      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString(),
          processed_by: (await supabase.auth.getUser()).data.user?.id,
          notes: reason
        })
        .eq('id', withdrawal.id);

      if (updateError) throw updateError;

      // Remettre le plan en actif
      const { error: planError } = await supabase
        .from('savings_plans')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', withdrawal.savings_plan_id);

      if (planError) throw planError;

      // Créer une notification pour le client
      await supabase
        .from('notifications')
        .insert([{
          user_id: withdrawal.user_id,
          title: 'Retrait refusé',
          message: `Votre demande de retrait a été refusée. Raison: ${reason}`,
          type: 'withdrawal_rejected',
          data: {
            withdrawal_id: withdrawal.id,
            reason: reason
          }
        }]);

      toast.success('Demande rejetée');
      setSelectedWithdrawal(null);
      
      // Recharger les données
      loadWithdrawalRequests();
      loadSavingsData();
    } catch (error) {
      console.error('[ADMIN_AB_EPARGNE] ❌ Erreur rejet:', error);
      toast.error('Erreur lors du rejet de la demande');
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
        {loading && (
          <div className="flex items-center justify-center gap-2 py-2 mb-4 text-gray-500 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent" />
            <span>Chargement des données...</span>
          </div>
        )}
        {/* Stats Cards - Design Moderne */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 transition-opacity duration-200 ${loading ? 'opacity-75' : ''}`}>
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

        {/* Onglets de navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('plans')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'plans'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <PiggyBank size={20} />
              <span>Plans d'épargne</span>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                activeTab === 'plans' ? 'bg-white/20' : 'bg-gray-200 text-gray-700'
              }`}>
                {savingsPlans.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'withdrawals'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <CreditCard size={20} />
              <span>Demandes de retrait</span>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                activeTab === 'withdrawals' ? 'bg-white/20' : 'bg-gray-200 text-gray-700'
              }`}>
                {withdrawalRequests.filter(r => r.status === 'pending').length}
              </span>
            </button>
          </div>
        </div>

        {/* Barre de recherche */}
        {activeTab === 'plans' && (
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
        )}
              
        {/* Liste des Plans - Design Cards */}
        {activeTab === 'plans' && (
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
        )}

        {/* Liste des Demandes de Retrait */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 font-montserrat">
                Demandes de retrait ({withdrawalRequests.length})
              </h2>
            </div>

            {withdrawalRequests.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <CreditCard size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">Aucune demande de retrait</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {withdrawalRequests.map((request) => (
                  <div key={request.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="p-6">
                      {/* Header avec statut */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                            <span className="text-xl font-bold text-green-700">
                              {request.user?.first_name?.[0]}{request.user?.last_name?.[0]}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {request.user?.first_name} {request.user?.last_name}
                            </h3>
                            <p className="text-sm text-gray-500">{request.user?.email}</p>
                          </div>
                        </div>
                        
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          request.status === 'pending'
                            ? 'bg-orange-100 text-orange-700'
                            : request.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {request.status === 'pending' ? '⏳ En attente' : request.status === 'approved' ? '✅ Approuvé' : '❌ Refusé'}
                        </span>
                      </div>

                      {/* Informations de retrait */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-blue-50 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Wallet size={16} className="text-blue-600" />
                            <p className="text-xs text-gray-600 font-medium">Montant</p>
                          </div>
                          <p className="text-lg font-bold text-blue-700">{formatCurrency(request.amount || 0)}</p>
                        </div>

                        <div className="bg-purple-50 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Phone size={16} className="text-purple-600" />
                            <p className="text-xs text-gray-600 font-medium">Numéro</p>
                          </div>
                          <p className="text-sm font-bold text-purple-700">{request.recipient_phone}</p>
                        </div>

                        <div className="bg-green-50 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Users size={16} className="text-green-600" />
                            <p className="text-xs text-gray-600 font-medium">Nom</p>
                          </div>
                          <p className="text-sm font-bold text-green-700">{request.recipient_name}</p>
                        </div>

                        <div className="bg-orange-50 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar size={16} className="text-orange-600" />
                            <p className="text-xs text-gray-600 font-medium">Date</p>
                          </div>
                          <p className="text-xs font-bold text-orange-700">
                            {new Date(request.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      {request.status === 'pending' && (
                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => handleApproveWithdrawal(request)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
                          >
                            <CheckCircle size={18} />
                            <span>Approuver</span>
                          </button>
                          <button
                            onClick={() => setSelectedWithdrawal(request)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
                          >
                            <XCircle size={18} />
                            <span>Refuser</span>
                          </button>
                        </div>
                      )}

                      {request.status !== 'pending' && request.processed_at && (
                        <div className="pt-4 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            Traité le {new Date(request.processed_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {request.notes && (
                            <p className="text-sm text-gray-600 mt-2">
                              <span className="font-semibold">Note:</span> {request.notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de rejet */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Refuser la demande</h3>
                <button
                  onClick={() => setSelectedWithdrawal(null)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Êtes-vous sûr de vouloir refuser la demande de retrait de <span className="font-bold">{selectedWithdrawal.user?.first_name} {selectedWithdrawal.user?.last_name}</span> ?
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison du refus
                </label>
                <textarea
                  id="rejection-reason"
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Expliquez pourquoi vous refusez cette demande..."
                ></textarea>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedWithdrawal(null)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-semibold"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    const reason = document.getElementById('rejection-reason').value;
                    if (!reason.trim()) {
                      toast.error('Veuillez indiquer une raison');
                      return;
                    }
                    handleRejectWithdrawal(selectedWithdrawal, reason);
                  }}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-semibold"
                >
                  Confirmer le refus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails plan */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8">
            <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-3xl z-10">
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
            
            <div className="p-6 pb-32 space-y-6 max-h-[calc(90vh-80px)] overflow-y-auto">
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
