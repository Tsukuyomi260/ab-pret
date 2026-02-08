import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLoans, getAllUsers, getPayments } from '../../utils/supabaseAPI';
import { supabase } from '../../utils/supabaseClient';
import { 
  Users, 
  CreditCard, 
  DollarSign,
  Activity,
  RefreshCw,
  CheckCircle,
  Clock,
  PiggyBank,
  Wallet,
  AlertCircle,
  TrendingDown,
  Award,
  BarChart3
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const Analytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    // Prêts
    totalLoans: 0,
    activeLoans: 0,
    completedLoans: 0,
    pendingLoans: 0,
    totalLoanAmount: 0,
    totalPaidAmount: 0,
    totalInterestCollected: 0,
    totalInterestNotCollected: 0,
    totalRemainingAmount: 0,
    // Épargne
    totalSavingsPlans: 0,
    activeSavingsPlans: 0,
    completedSavingsPlans: 0,
    totalSavingsAmount: 0,
    // Utilisateurs
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    // Performance
    averageLoanAmount: 0,
    averageRepaymentRate: 0,
    topBorrowers: []
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  // Mise à jour en temps réel : réagir aux changements sur les tables
  useEffect(() => {
    let refreshTimeout = null;
    const scheduleRefresh = () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => loadAnalytics(true), 500);
    };

    const channel = supabase
      .channel('analytics_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loans' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'savings_plans' }, scheduleRefresh)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[ANALYTICS] 🔴 Temps réel actif');
        }
      });

    return () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      supabase.removeChannel(channel);
    };
  }, []);

  const loadAnalytics = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      if (!silent) console.log('[ANALYTICS] 📊 Chargement des analytics...');

      // Charger toutes les données en parallèle
      const [usersResult, loansResult, paymentsResult, savingsResult] = await Promise.all([
        getAllUsers(),
        getLoans(),
        getPayments(),
        supabase.from('savings_plans').select('*')
      ]);

      if (!silent) console.log('[ANALYTICS] ✅ Données chargées');

      // Analyser les utilisateurs
      const users = usersResult.success ? usersResult.data : [];
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.status === 'approved').length;
      const pendingUsers = users.filter(u => u.status === 'pending').length;

      // Analyser les prêts
      const loans = loansResult.success ? loansResult.data : [];
      const payments = paymentsResult.success ? paymentsResult.data : [];

      // Prêts validés par l'admin (approved_at) = acceptés, tout sauf pending/rejected
      const validatedByAdmin = (l) => l.approved_at && l.status !== 'pending' && l.status !== 'rejected';
      const validatedLoans = loans.filter(validatedByAdmin);

      const totalLoans = loans.length;
      const activeLoans = loans.filter(l => l.status === 'active' || l.status === 'approved').length;
      const completedLoans = loans.filter(l => l.status === 'completed').length;
      const pendingLoans = loans.filter(l => l.status === 'pending').length;
      // Total prêté = montant total des prêts validés (principal uniquement, sans intérêts ni pénalités)
      const totalLoanAmount = validatedLoans.reduce((sum, l) => sum + (l.amount || 0), 0);

      // Calculer les paiements
      const totalPaidAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const totalRemainingAmount = totalLoanAmount - totalPaidAmount;

      // Intérêts collectés = somme des intérêts des prêts validés et entièrement remboursés (status completed)
      const completedValidatedLoans = validatedLoans.filter(l => l.status === 'completed');
      const totalInterestCollected = completedValidatedLoans.reduce((sum, l) => {
        const principal = l.amount || 0;
        const rate = (l.interest_rate || 0) / 100;
        return sum + Math.round(principal * rate);
      }, 0);

      // Intérêts pas encore collectés = somme des intérêts des prêts validés mais pas encore remboursés (en cours)
      const notCompletedValidatedLoans = validatedLoans.filter(l => l.status !== 'completed');
      const totalInterestNotCollected = notCompletedValidatedLoans.reduce((sum, l) => {
        const principal = l.amount || 0;
        const rate = (l.interest_rate || 0) / 100;
        return sum + Math.round(principal * rate);
      }, 0);

      // Calculer le taux de remboursement moyen (sur le principal validé)
      const averageRepaymentRate = totalLoanAmount > 0 
        ? Math.round((totalPaidAmount / totalLoanAmount) * 100) 
        : 0;

      // Montant moyen des prêts validés (principal uniquement)
      const averageLoanAmount = validatedLoans.length > 0 
        ? Math.round(totalLoanAmount / validatedLoans.length) 
        : 0;

      // Top emprunteurs (par montant total emprunté = principal des prêts validés uniquement)
      const borrowerStats = {};
      validatedLoans.forEach(loan => {
        const userId = loan.user_id;
        if (!borrowerStats[userId]) {
          borrowerStats[userId] = {
            userId,
            userName: `${loan.users?.first_name || 'Utilisateur'} ${loan.users?.last_name || 'Inconnu'}`,
            totalBorrowed: 0,
            loansCount: 0,
            completedLoans: 0
          };
        }
        borrowerStats[userId].totalBorrowed += loan.amount || 0;
        borrowerStats[userId].loansCount++;
        if (loan.status === 'completed') {
          borrowerStats[userId].completedLoans++;
        }
      });

      const topBorrowers = Object.values(borrowerStats)
        .sort((a, b) => b.totalBorrowed - a.totalBorrowed)
        .slice(0, 5);

      // Analyser l'épargne
      const savings = savingsResult.data || [];
      const totalSavingsPlans = savings.length;
      const activeSavingsPlans = savings.filter(s => s.status === 'active').length;
      const completedSavingsPlans = savings.filter(s => s.status === 'completed').length;
      const totalSavingsAmount = savings.reduce((sum, s) => sum + (s.current_balance || 0), 0);

      setAnalytics({
        totalLoans,
        activeLoans,
        completedLoans,
        pendingLoans,
        totalLoanAmount,
        totalPaidAmount,
        totalInterestCollected,
        totalInterestNotCollected,
        totalRemainingAmount,
        totalSavingsPlans,
        activeSavingsPlans,
        completedSavingsPlans,
        totalSavingsAmount,
        totalUsers,
        activeUsers,
        pendingUsers,
        averageLoanAmount,
        averageRepaymentRate,
        topBorrowers
      });

    } catch (error) {
      console.error('[ANALYTICS] ❌ Erreur:', error);
      setError(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadAnalytics}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-colors"
          >
            <RefreshCw size={18} />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 pb-24">
      {/* Header Moderne */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
                <BarChart3 size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-montserrat">Analytics</h1>
                <p className="text-sm sm:text-base text-gray-600 font-montserrat">Vue d'ensemble des performances</p>
              </div>
            </div>
            
            <button
              onClick={loadAnalytics}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow"
            >
              <RefreshCw size={18} className="text-gray-600" />
              <span className="hidden sm:inline text-sm font-medium text-gray-700">Actualiser</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-2 mb-4 text-gray-500 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent" />
            <span>Chargement des analytics...</span>
          </div>
        )}
        {/* Stats Principales - Prêts */}
        <div className={`mb-6 transition-opacity duration-200 ${loading ? 'opacity-75' : ''}`}>
          <h2 className="text-xl font-bold text-gray-900 font-montserrat mb-4">📊 Prêts</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Total prêts */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <CreditCard size={20} className="sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.totalLoans}</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Total prêts</p>
            </div>

            {/* Prêts actifs */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-white group">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Activity size={20} className="sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{analytics.activeLoans}</p>
              <p className="text-xs sm:text-sm text-blue-100 mt-1">Actifs</p>
            </div>

            {/* Remboursés */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-green-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle size={20} className="sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.completedLoans}</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Remboursés</p>
            </div>

            {/* En attente */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-yellow-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Clock size={20} className="sm:w-6 sm:h-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.pendingLoans}</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">En attente</p>
            </div>
          </div>
        </div>

        {/* Montants */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 font-montserrat mb-4">💰 Montants</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Total prêté */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign size={18} className="text-purple-600" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Total prêté</p>
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{formatCurrency(analytics.totalLoanAmount)}</p>
            </div>

            {/* Intérêts collectés (prêts validés et entièrement remboursés) */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle size={18} className="text-green-600" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Intérêts collectés</p>
              </div>
              <p className="text-lg sm:text-xl font-bold text-green-600">{formatCurrency(analytics.totalInterestCollected)}</p>
            </div>

            {/* Intérêts à percevoir (prêts validés pas encore remboursés) */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingDown size={18} className="text-orange-600" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Intérêts à percevoir</p>
              </div>
              <p className="text-lg sm:text-xl font-bold text-orange-600">{formatCurrency(analytics.totalInterestNotCollected)}</p>
            </div>

            {/* Voir statistiques détaillées */}
            <button
              type="button"
              onClick={() => navigate('/admin/analytics/detailed')}
              className="w-full text-left bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-white group border-0 cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                  <BarChart3 size={18} className="text-white" />
                </div>
                <p className="text-xs sm:text-sm text-green-100 font-medium">Statistiques détaillées</p>
              </div>
              <p className="text-sm sm:text-base font-semibold text-green-100">Voir les statistiques détaillées</p>
              <p className="text-xs text-green-200/90 mt-1">Graphiques, filtres par période, comptabilité</p>
            </button>
          </div>
        </div>

        {/* Épargne */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 font-montserrat mb-4">🏦 Épargne</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Total plans */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-purple-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <PiggyBank size={20} className="sm:w-6 sm:h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.totalSavingsPlans}</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Plans total</p>
            </div>

            {/* Plans actifs */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-green-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Activity size={20} className="sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.activeSavingsPlans}</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Actifs</p>
            </div>

            {/* Plans terminés */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle size={20} className="sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.completedSavingsPlans}</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Terminés</p>
            </div>

            {/* Total épargné */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-white group">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Wallet size={20} className="sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <p className="text-lg sm:text-xl font-bold">{formatCurrency(analytics.totalSavingsAmount)}</p>
              <p className="text-xs sm:text-sm text-purple-100 mt-1">Total épargné</p>
            </div>
          </div>
        </div>

        {/* Utilisateurs */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 font-montserrat mb-4">👥 Utilisateurs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {/* Total */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users size={18} className="text-blue-600" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Total</p>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.totalUsers}</p>
            </div>

            {/* Actifs */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle size={18} className="text-green-600" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Actifs</p>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{analytics.activeUsers}</p>
            </div>

            {/* En attente */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock size={18} className="text-yellow-600" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">En attente</p>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{analytics.pendingUsers}</p>
            </div>
          </div>
        </div>

        {/* Top emprunteurs */}
        {analytics.topBorrowers.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 font-montserrat flex items-center gap-2">
                <Award size={24} className="text-orange-600" />
                Top 5 Emprunteurs
              </h2>
            </div>
            
            <div className="divide-y divide-gray-100">
              {analytics.topBorrowers.map((borrower, index) => (
                <div key={index} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-bold text-gray-900 truncate">{borrower.userName}</p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {borrower.loansCount} prêt{borrower.loansCount > 1 ? 's' : ''} • {borrower.completedLoans} remboursé{borrower.completedLoans > 1 ? 's' : ''}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm sm:text-base font-bold text-gray-900">{formatCurrency(borrower.totalBorrowed)}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
