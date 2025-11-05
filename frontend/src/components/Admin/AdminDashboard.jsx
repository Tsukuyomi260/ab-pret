import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllUsers, getLoans, getAnalyticsData } from '../../utils/supabaseAPI';
import { useRealtimeNotifications } from '../../hooks/useRealtimeNotifications';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Eye,
  Home,
  PiggyBank,
  Wallet,
  Activity,
  RefreshCw,
  ArrowRight,
  DollarSign,
  Target,
  Award,
  TrendingDown
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { supabase } from '../../utils/supabaseClient';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isConnected } = useRealtimeNotifications();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLoans: 0,
    totalAmount: 0,
    pendingRequests: 0,
    activeLoans: 0,
    completedLoans: 0,
    totalSavings: 0,
    activeSavingsPlans: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
      try {
        setLoading(true);
      setError(null);
      console.log('[ADMIN_DASHBOARD] 📥 Chargement des données...');
        
      // Charger toutes les données en parallèle
      const [usersResult, loansResult, savingsResult] = await Promise.all([
          getAllUsers(),
          getLoans(),
        supabase.from('savings_plans').select('*')
      ]);

      console.log('[ADMIN_DASHBOARD] ✅ Données chargées');

      // Traiter les utilisateurs
      const totalUsers = usersResult.success ? usersResult.data.length : 0;

      // Traiter les prêts
      let totalLoans = 0;
      let totalAmount = 0;
      let pendingRequests = 0;
      let activeLoans = 0;
      let completedLoans = 0;
      let recentLoans = [];

      if (loansResult.success) {
        const loans = loansResult.data || [];
        totalLoans = loans.length;
        // Ne compter que les prêts validés/approuvés (active ou approved)
        const approvedLoans = loans.filter(l => l.status === 'active' || l.status === 'approved' || l.status === 'completed');
        totalAmount = approvedLoans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
        pendingRequests = loans.filter(l => l.status === 'pending').length;
        activeLoans = loans.filter(l => l.status === 'active' || l.status === 'approved').length;
        completedLoans = loans.filter(l => l.status === 'completed').length;
        
        // Les 5 dernières activités de prêts
        recentLoans = loans.slice(0, 5).map(loan => ({
            id: loan.id,
          type: 'loan',
          status: loan.status,
            user: {
              firstName: loan.users?.first_name || 'Utilisateur',
              lastName: loan.users?.last_name || 'Inconnu',
            },
            amount: loan.amount || 0,
          date: loan.created_at,
          description: loan.purpose || 'Prêt'
          }));
        }

      // Traiter l'épargne
      let totalSavings = 0;
      let activeSavingsPlans = 0;
      let recentSavings = [];

      if (savingsResult.data) {
        const savings = savingsResult.data || [];
        totalSavings = savings.reduce((sum, plan) => sum + (plan.current_balance || 0), 0);
        activeSavingsPlans = savings.filter(p => p.status === 'active').length;
        
        // Les 3 dernières activités d'épargne
        recentSavings = savings.slice(0, 3).map(plan => ({
          id: plan.id,
          type: 'savings',
          status: plan.status,
          amount: plan.current_balance || 0,
          target: plan.total_amount_target || 0,
          date: plan.created_at,
          description: 'Plan d\'épargne'
          }));
        }

      // Combiner et trier les activités récentes
      const allActivities = [...recentLoans, ...recentSavings]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 8);

      setStats({
        totalUsers,
        totalLoans,
        totalAmount,
        pendingRequests,
        activeLoans,
        completedLoans,
        totalSavings,
        activeSavingsPlans
      });

      setRecentActivities(allActivities);

      } catch (error) {
      console.error('[ADMIN_DASHBOARD] ❌ Erreur:', error);
      setError(error.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

  const getActivityIcon = (activity) => {
    if (activity.type === 'loan') {
      if (activity.status === 'pending') return <Clock size={16} className="text-yellow-600" />;
      if (activity.status === 'active' || activity.status === 'approved') return <Activity size={16} className="text-blue-600" />;
      if (activity.status === 'completed') return <CheckCircle size={16} className="text-green-600" />;
    }
    if (activity.type === 'savings') {
      return <PiggyBank size={16} className="text-purple-600" />;
    }
    return <CreditCard size={16} className="text-gray-600" />;
  };

  const getActivityBadge = (activity) => {
    if (activity.type === 'loan') {
      if (activity.status === 'pending') {
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-semibold">En attente</span>;
      }
      if (activity.status === 'active' || activity.status === 'approved') {
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-semibold">Actif</span>;
      }
      if (activity.status === 'completed') {
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-semibold">Remboursé</span>;
      }
    }
    if (activity.type === 'savings') {
      return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-semibold">Épargne</span>;
    }
    return null;
  };

  const quickActions = [
    {
      title: 'AB Pret',
      description: 'Gérer les demandes de prêts',
      icon: CreditCard,
      color: 'from-blue-500 to-purple-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      path: '/admin/loan-requests',
      badge: stats.pendingRequests > 0 ? `${stats.pendingRequests} en attente` : null
    },
    {
      title: 'AB Epargne',
      description: 'Gérer les comptes d\'épargne',
      icon: PiggyBank,
      color: 'from-green-500 to-emerald-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      path: '/admin/ab-epargne',
      badge: stats.activeSavingsPlans > 0 ? `${stats.activeSavingsPlans} actifs` : null
    },
    {
      title: 'Analytics',
      description: 'Voir les statistiques',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      path: '/admin/analytics'
    },
    {
      title: 'Utilisateurs',
      description: 'Gérer les clients',
      icon: Users,
      color: 'from-purple-500 to-pink-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      path: '/admin/user-management'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadDashboardData}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
          >
            <RefreshCw size={18} />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-24">
      {/* Header Moderne */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <Home size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-montserrat">Tableau de bord</h1>
                <p className="text-sm sm:text-base text-gray-600 font-montserrat">
                  Bonjour {user?.first_name || 'Admin'}
                </p>
          </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isConnected && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-green-700">En ligne</span>
                </div>
              )}
              <button
                onClick={loadDashboardData}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow"
              >
                <RefreshCw size={18} className="text-gray-600" />
                <span className="hidden sm:inline text-sm font-medium text-gray-700">Actualiser</span>
              </button>
            </div>
          </div>
                    </div>
                  </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Total Utilisateurs */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Users size={20} className="sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Utilisateurs</p>
          </div>

          {/* Prêts actifs */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-white group">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Activity size={20} className="sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
            <p className="text-2xl sm:text-3xl font-bold">{stats.activeLoans}</p>
            <p className="text-xs sm:text-sm text-blue-100 mt-1">Prêts actifs</p>
                  </div>

          {/* Montant total */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-green-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Wallet size={20} className="sm:w-6 sm:h-6 text-green-600" />
                      </div>
                    </div>
            <p className="text-lg sm:text-xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Prêts validés</p>
                  </div>

          {/* En attente */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Clock size={20} className="sm:w-6 sm:h-6 text-yellow-600" />
                      </div>
                    </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.pendingRequests}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">En attente</p>
                  </div>
                </div>

                {/* Actions rapides */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 font-montserrat mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden text-left"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative">
                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-xl ${action.iconBg} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon size={24} className={action.iconColor} />
                        </div>

                  {/* Badge si présent */}
                  {action.badge && (
                    <span className="absolute top-0 right-0 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full">
                      {action.badge}
                    </span>
                  )}

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 font-montserrat mb-2">
                    {action.title}
                        </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 font-montserrat mb-4">
                    {action.description}
                  </p>

                  {/* Arrow */}
                  <div className="flex items-center text-primary-600 font-semibold font-montserrat group-hover:translate-x-2 transition-transform duration-300">
                    <span className="text-sm">Accéder</span>
                    <ArrowRight size={16} className="ml-2" />
                  </div>
                        </div>
              </button>
            ))}
                      </div>
                    </div>
                    
        {/* Activités récentes */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 font-montserrat">Activités récentes</h2>
                            </div>
          
          <div className="divide-y divide-gray-100">
            {recentActivities.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <Activity size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">Aucune activité récente</p>
                            </div>
            ) : (
              recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => {
                    if (activity.type === 'loan') navigate('/admin/loan-requests');
                    if (activity.type === 'savings') navigate('/admin/ab-epargne');
                  }}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {getActivityIcon(activity)}
                  </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                          {activity.type === 'loan' 
                            ? `${activity.user?.firstName} ${activity.user?.lastName}` 
                            : activity.description}
                        </p>
                        {getActivityBadge(activity)}
                  </div>

                      <p className="text-xs sm:text-sm text-gray-600 mb-2">
                        {activity.type === 'loan' ? activity.description : `${formatCurrency(activity.amount)} / ${formatCurrency(activity.target)}`}
                      </p>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="font-bold text-gray-900">{formatCurrency(activity.amount)}</span>
                        <span>•</span>
                        <span>{new Date(activity.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    
                    <ArrowRight size={16} className="flex-shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>
            </div>
          </div>
    </div>
  );
};

export default AdminDashboard;
