import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ContactButton from '../UI/ContactButton';
import { getLoans, getPayments } from '../../utils/supabaseAPI';
import { supabase } from '../../utils/supabaseClient';
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  Plus,
  Wallet,
  Star,
  Award,
  DollarSign,
  RefreshCw,
  ArrowRight,
  PiggyBank,
  Home as HomeIcon,
  GraduationCap,
  TrendingUp,
  Activity
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalLoaned: 0,
    totalRepaid: 0,
    amountToRepay: 0,
    activeLoans: 0,
    nextPayment: 0,
    daysUntilNextPayment: 0,
    dueDate: null,
    loyaltyScore: 0,
    savingsBalance: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, [user?.id]);

    const loadStats = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
      setError(null);
        
        const loansResult = await getLoans(user.id);
        const paymentsResult = await getPayments(user.id);
      
      // Récupérer le plan d'épargne actif (prendre celui avec le plus grand solde)
      const { data: savingsPlans, error: savingsError } = await supabase
        .from('savings_plans')
        .select('current_balance')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('current_balance', { ascending: false });
      
      // Prendre le plan avec le plus grand solde
      const savingsBalance = savingsPlans && savingsPlans.length > 0 
        ? Math.max(...savingsPlans.map(plan => plan.current_balance || 0))
        : 0;

        if (loansResult.success && paymentsResult.success) {
          const loans = loansResult.data || [];
          const payments = paymentsResult.data || [];

          const totalLoaned = loans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
          const totalRepaid = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
          const activeLoans = loans.filter(loan => loan.status === 'active').length;
          const amountToRepay = totalLoaned - totalRepaid;

          let nextPayment = 0;
          let daysUntilNextPayment = 0;
          let dueDate = null;
          
          const activeLoan = loans.find(loan => loan.status === 'active');
          if (activeLoan) {
            const principalAmount = parseFloat(activeLoan.amount) || 0;
            const interestRate = parseFloat(activeLoan.interest_rate) || 0;
            
            if (principalAmount > 0) {
              const totalDue = Math.round(principalAmount * (1 + (interestRate / 100)));
              nextPayment = totalDue;
            }

            // Le décompte commence à partir de la date d'approbation, pas de la demande
            if (activeLoan.approved_at) {
              const approvedDate = new Date(activeLoan.approved_at);
              const durationDays = parseInt(activeLoan.duration_months || activeLoan.duration, 10) || 30;
              
              dueDate = new Date(approvedDate);
              dueDate.setDate(dueDate.getDate() + durationDays);
              
              const now = new Date();
              now.setHours(0, 0, 0, 0);
              dueDate.setHours(0, 0, 0, 0);
              
              const msRemaining = dueDate.getTime() - now.getTime();
              daysUntilNextPayment = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
            }
        }

        // Calculer le score de fidélité
          const loanById = new Map(loans.map(l => [l.id, l]));
          const completedPayments = payments.filter(p => (p.status || '').toLowerCase() === 'completed');
          const onTimeLoanIds = new Set();

          completedPayments.forEach(p => {
            const loan = loanById.get(p.loan_id);
            if (!loan) return;
            
            // Le décompte commence à partir de la date d'approbation, pas de la demande
            const startDate = loan.approved_at ? new Date(loan.approved_at) : null;
            if (!startDate) return; // Prêt non approuvé, on ignore
            
            const durationDays = parseInt(loan.duration_months || loan.duration || 30, 10);
            const loanDue = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
            loanDue.setHours(23, 59, 59, 999);

            const payDate = new Date(p.payment_date || p.created_at || new Date());
            const payDateNorm = new Date(payDate);
            payDateNorm.setHours(0, 0, 0, 0);

            const isOnTime = payDateNorm.getTime() <= loanDue.getTime();
            if (isOnTime) {
              onTimeLoanIds.add(p.loan_id);
            }
          });

          loans.forEach(l => {
            const s = (l.status || '').toLowerCase();
            if ((s === 'completed' || s === 'remboursé') && !onTimeLoanIds.has(l.id)) {
              onTimeLoanIds.add(l.id);
            }
          });

          const loyaltyScore = Math.max(0, Math.min(5, onTimeLoanIds.size));

      setStats({
            totalLoaned,
            totalRepaid,
            amountToRepay,
            activeLoans,
            nextPayment,
            daysUntilNextPayment,
            dueDate,
          loyaltyScore,
          savingsBalance
          });
        }
      } catch (error) {
      console.error('[DASHBOARD] Erreur:', error);
      setError('Erreur lors du chargement des données');
      } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadStats}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
          >
            <RefreshCw size={18} />
            Réessayer
          </button>
            </div>
      </div>
    );
  }

  const services = [
    {
      id: 'ab-pret',
      title: 'AB Prêt',
      description: 'Demander un prêt rapide',
      icon: CreditCard,
      color: 'from-blue-500 to-purple-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      path: '/loan-request',
      badge: stats.activeLoans > 0 ? `${stats.activeLoans} actif${stats.activeLoans > 1 ? 's' : ''}` : null
    },
    {
      id: 'ab-epargne',
      title: 'AB Épargne',
      description: 'Épargner intelligemment',
      icon: PiggyBank,
      color: 'from-green-500 to-emerald-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      path: '/ab-epargne'
    },
    {
      id: 'ab-logement',
      title: 'AB Logement',
      description: 'Votre maison de rêve',
      icon: HomeIcon,
      color: 'from-purple-500 to-indigo-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      path: '/ab-logement'
    },
    {
      id: 'coaching',
      title: 'Coaching Finance',
      description: 'Développez votre business',
      icon: GraduationCap,
      color: 'from-orange-500 to-red-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      path: '/coaching-finance'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-24">
      {/* Header Moderne */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <HomeIcon size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-montserrat">Tableau de bord</h1>
                <p className="text-sm sm:text-base text-gray-600 font-montserrat">
                  Bonjour {user?.first_name || user?.user_metadata?.first_name || 'Utilisateur'} 👋
                </p>
              </div>
            </div>

            <button
              onClick={loadStats}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors text-sm"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
          </div>
                  </div>
                </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Score de fidélité */}
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white rounded-2xl shadow-lg border border-yellow-400/50 p-4 sm:p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 sm:p-3 bg-white/20 rounded-xl">
                <Award size={20} />
              </div>
              <span className="text-xs font-medium text-yellow-100">Score</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold font-montserrat mb-1">
              {stats.loyaltyScore}
            </p>
            <p className="text-sm text-yellow-100 font-montserrat">/ 5 points</p>
            <div className="flex mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                  className={`w-3 h-3 sm:w-4 sm:h-4 ${i < stats.loyaltyScore ? 'text-white fill-current' : 'text-yellow-300/30'}`} 
                            />
                          ))}
                        </div>
                      </div>

          {/* Prêts actifs */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-xl">
                <CreditCard size={20} className="text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-500">Actifs</span>
                  </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 font-montserrat mb-1">
              {stats.activeLoans}
            </p>
            <p className="text-sm text-gray-600 font-montserrat">Prêt{stats.activeLoans > 1 ? 's' : ''} en cours</p>
                </div>
                
          {/* Compte Épargne */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 sm:p-3 bg-green-100 rounded-xl">
                <PiggyBank size={20} className="text-green-600" />
              </div>
              <span className="text-xs font-medium text-gray-500">Compte Épargne</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 font-montserrat mb-1">
              {formatCurrency(stats.savingsBalance)}
            </p>
            <p className="text-sm text-gray-600 font-montserrat">Solde disponible</p>
      </div>

          {/* Prochain paiement */}
          <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl shadow-lg border border-orange-400/50 p-4 sm:p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 sm:p-3 bg-white/20 rounded-xl">
                <Clock size={20} />
              </div>
              <span className="text-xs font-medium text-orange-100">
                {stats.daysUntilNextPayment < 0 ? 'Retard' : stats.daysUntilNextPayment === 0 ? 'Aujourd\'hui' : `${stats.daysUntilNextPayment}j`}
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold font-montserrat mb-1">
              {formatCurrency(stats.nextPayment)}
            </p>
            <p className="text-sm text-orange-100 font-montserrat">Prochain paiement</p>
              </div>
            </div>

        {/* Actions Rapides */}
        <h2 className="text-xl font-bold text-gray-900 font-montserrat mb-4">Nos Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => navigate(service.path)}
              className="relative flex flex-col items-start p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group overflow-hidden text-left"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative z-10 flex items-center justify-between w-full mb-4">
                <div className={`p-3 ${service.iconBg} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon size={24} className={service.iconColor} />
                </div>
                {service.badge && (
                  <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-sm">
                    {service.badge}
                  </span>
                )}
            </div>

              <h3 className="relative z-10 text-lg font-bold text-gray-900 font-montserrat mb-1">{service.title}</h3>
              <p className="relative z-10 text-sm text-gray-600 font-montserrat mb-4">{service.description}</p>

              <ArrowRight size={20} className="absolute bottom-6 right-6 text-gray-400 group-hover:text-blue-600 transition-all duration-300 group-hover:translate-x-1" />
            </button>
          ))}
          </div>

        {/* Bouton principal */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate('/loan-request')}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Plus size={24} />
            <span>Nouvelle demande de prêt</span>
          </button>
          </div>
      </div>
      
      <ContactButton />
      </div>
  );
};

export default ClientDashboard;
