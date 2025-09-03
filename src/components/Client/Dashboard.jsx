import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../UI/Card';
import Button from '../UI/Button';
import NotificationBell from '../UI/NotificationBell';
import SavingsPlanGuard from '../Common/SavingsPlanGuard';
import { getLoans, getPayments } from '../../utils/supabaseAPI';
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  Plus,
  History,
  Wallet,
  Star,
  Target,
  Award,
  ArrowUpRight,
  Shield,
  Bell,
  BookOpen,
  Eye,
  TrendingUp,
  DollarSign,
  Info,
  X,
  Phone,
  Zap,
  CheckCircle2,
  Heart,
  GraduationCap
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { notifications } = useNotifications();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalLoaned: 0,
    totalRepaid: 0,
    amountToRepay: 0,
    activeLoans: 0,
    creditScore: 750,
    nextPayment: 0,
    daysUntilNextPayment: 0,
    dueDate: null,
    loyaltyScore: 0
  });
  const [recentLoans, setRecentLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Animations CSS personnalisées
  const gradientAnimation = `
    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes pulse-glow {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(1.05); }
    }
    @keyframes slide-in-right {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes bounce-in {
      0% { transform: scale(0.3); opacity: 0; }
      50% { transform: scale(1.05); }
      70% { transform: scale(0.9); }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    @keyframes shine {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .animate-gradient {
      background-size: 200% 200%;
      animation: gradient 8s ease infinite;
    }
    .animate-pulse-glow {
      animation: pulse-glow 2s ease-in-out infinite;
    }
    .animate-slide-in-right {
      animation: slide-in-right 0.6s ease-out;
    }
    .animate-bounce-in {
      animation: bounce-in 0.8s ease-out;
    }
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }
    .animate-shine {
      animation: shine 2s ease-in-out infinite;
    }
  `;



  useEffect(() => {
    const loadStats = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Récupérer les prêts de l'utilisateur
        const loansResult = await getLoans(user.id);
        const paymentsResult = await getPayments(user.id);

        if (loansResult.success && paymentsResult.success) {
          const loans = loansResult.data || [];
          const payments = paymentsResult.data || [];

          // Calculer les statistiques
          const totalLoaned = loans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
          const totalRepaid = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
          const activeLoans = loans.filter(loan => loan.status === 'active').length;
          const amountToRepay = totalLoaned - totalRepaid;

          // Calculer le prochain paiement (si des prêts actifs existent)
          let nextPayment = 0;
          let daysUntilNextPayment = 0;
          let dueDate = null;
          
          const activeLoan = loans.find(loan => loan.status === 'active');
          if (activeLoan) {
            // Calculer le montant total à payer à l'échéance
            const principalAmount = parseFloat(activeLoan.amount) || 0;
            const interestRate = parseFloat(activeLoan.interest_rate) || 0;
            
            if (principalAmount > 0) {
              // Calculer le total avec intérêts
              const totalDue = Math.round(principalAmount * (1 + (interestRate / 100)));
              nextPayment = totalDue;
            } else if (activeLoan.monthly_payment) {
              nextPayment = activeLoan.monthly_payment;
            }

            // Calculer la date d'échéance exacte: created_at + duration (en jours)
            const loanDate = new Date(activeLoan.created_at);
            // Utiliser duration_months qui contient en fait le nombre de jours
            const durationDays = parseInt(activeLoan.duration_months || activeLoan.duration, 10) || 30;
            
            // S'assurer que la date est calculée correctement
            dueDate = new Date(loanDate);
            dueDate.setDate(dueDate.getDate() + durationDays);
            
            // Vérifier si la date d'échéance est fixe (comme le 8 de chaque mois)
            // Si c'est le cas, calculer la prochaine occurrence du 8
            const now = new Date();
            const currentDay = now.getDate();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            
            // Si on est avant le 8 du mois, l'échéance est le 8 du mois courant
            // Si on est après le 8, l'échéance est le 8 du mois prochain
            let fixedDueDate = new Date(currentYear, currentMonth, 8);
            if (currentDay > 8) {
              fixedDueDate = new Date(currentYear, currentMonth + 1, 8);
            }
            
            // Utiliser la date fixe si elle est plus proche que la date calculée
            if (fixedDueDate.getTime() < dueDate.getTime()) {
              dueDate = fixedDueDate;
            }
            
            // Calculer les jours restants jusqu'à l'échéance
            // Réinitialiser l'heure à minuit pour un calcul précis des jours
            now.setHours(0, 0, 0, 0);
            dueDate.setHours(0, 0, 0, 0);
            
            const msRemaining = dueDate.getTime() - now.getTime();
            const daysRemaining = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
            daysUntilNextPayment = daysRemaining;
            
            // Debug: Afficher les calculs pour vérification
            console.log('[DASHBOARD] Calcul de la date d\'échéance:', {
              loanId: activeLoan.id,
              created_at: activeLoan.created_at,
              loanDate: loanDate.toISOString(),
              duration: activeLoan.duration,
              duration_months: activeLoan.duration_months,
              durationDays: durationDays,
              calculatedDueDate: dueDate.toISOString(),
              fixedDueDate: fixedDueDate.toISOString(),
              now: now.toISOString(),
              currentDay: currentDay,
              daysRemaining: daysRemaining,
              daysUntilNextPayment: daysUntilNextPayment
            });
          }

          // Pour les comptes existants, score de fidélité à 0
          // Le nouveau système commence à 0 pour tous les comptes
          let creditScore = 0; // Score de base à 0 pour tous les comptes existants
          
          // Note: Les prêts et paiements passés ne comptent plus pour le score de fidélité
          // Seuls les nouveaux remboursements (après cette mise à jour) compteront

          // Calculer le score de fidélité: +1 par prêt remboursé à temps (max 5)
          const loanById = new Map(loans.map(l => [l.id, l]));
          const completedPayments = payments.filter(p => (p.status || '').toLowerCase() === 'completed');
          const onTimeLoanIds = new Set();

          completedPayments.forEach(p => {
            const loan = loanById.get(p.loan_id);
            if (!loan) return;
            const created = new Date(loan.created_at || new Date());
            const durationDays = parseInt(loan.duration_months || loan.duration || 30, 10);
            // due date inclusive: fin de journée
            const loanDue = new Date(created.getTime() + durationDays * 24 * 60 * 60 * 1000);
            loanDue.setHours(23, 59, 59, 999);

            const payDate = new Date(p.payment_date || p.created_at || new Date());
            // normaliser le paiement au début de journée pour éviter les faux négatifs
            const payDateNorm = new Date(payDate);
            payDateNorm.setHours(0, 0, 0, 0);

            const isOnTime = payDateNorm.getTime() <= loanDue.getTime();
            if (isOnTime) {
              onTimeLoanIds.add(p.loan_id);
            }
          });

          // Fallback: si prêt marqué remboursé, compter 1 point même sans paiement 'completed'
          loans.forEach(l => {
            const s = (l.status || '').toLowerCase();
            if ((s === 'completed' || s === 'remboursé') && !onTimeLoanIds.has(l.id)) {
              onTimeLoanIds.add(l.id);
            }
          });

          const loyaltyScore = Math.max(0, Math.min(5, onTimeLoanIds.size));

          console.log('[DASHBOARD] Fidélité', {
            userId: user.id,
            paymentsCompleted: completedPayments.length,
            onTimeLoansCount: onTimeLoanIds.size,
            loyaltyScore
          });

      setStats({
            totalLoaned,
            totalRepaid,
            amountToRepay,
            activeLoans,
            creditScore,
            nextPayment,
            daysUntilNextPayment,
            dueDate,
            loyaltyScore
          });

          // Formater les prêts récents pour l'affichage
          const formattedLoans = loans.slice(0, 3).map(loan => {
            // Calculer le montant payé pour ce prêt
            const loanPayments = payments.filter(payment => payment.loan_id === loan.id);
            const paidAmount = loanPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
            const progress = loan.amount > 0 ? Math.round((paidAmount / loan.amount) * 100) : 0;

            // Calculer la date d'échéance exacte (paiement unique à la fin de la durée)
            let nextPaymentDate = null;
            if (loan.status === 'active') {
              const loanDate = new Date(loan.created_at);
              // Utiliser duration_months qui contient en fait le nombre de jours
              const durationDays = parseInt(loan.duration_months || loan.duration, 10) || 30;
              
              // Calculer la date d'échéance précise
              const loanDueDate = new Date(loanDate);
              loanDueDate.setDate(loanDueDate.getDate() + durationDays);
              nextPaymentDate = loanDueDate;
            }

            return {
              id: loan.id,
              purpose: loan.purpose || 'Non spécifié',
              amount: loan.amount || 0,
              status: loan.status || 'pending',
              requestDate: loan.created_at,
              category: loan.loan_type || 'other',
              monthlyPayment: loan.monthly_payment || 0,
              totalAmount: loan.amount || 0,
              paidAmount,
              progress,
              nextPaymentDate: nextPaymentDate ? nextPaymentDate.toISOString().split('T')[0] : null
            };
          });

          setRecentLoans(formattedLoans);
        } else {
          console.error('[DASHBOARD] Erreur lors du chargement des données:', {
            loans: loansResult.error,
            payments: paymentsResult.error
          });
        }
      } catch (error) {
        console.error('[DASHBOARD] Erreur lors du chargement des statistiques:', error.message);
      } finally {
      setLoading(false);
      }
    };

    loadStats();
  }, [user?.id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'repaid':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'pending':
        return 'En attente';
      case 'repaid':
        return 'Remboursé';
      default:
        return 'Inconnu';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'education':
        return <BookOpen className="w-6 h-6 text-blue-600" />;
      case 'equipment':
        return <CreditCard className="w-6 h-6 text-green-600" />;
      case 'housing':
        return <Target className="w-6 h-6 text-purple-600" />;
      default:
        return <DollarSign className="w-6 h-6 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50 flex items-center justify-center">
        <motion.div 
          className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <SavingsPlanGuard>
      <div className="bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50">
        <style>{gradientAnimation}</style>
      
      {/* Header mobile optimisé */}
      <div className="relative bg-white/80 backdrop-blur-sm border-b border-accent-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xl font-bold text-secondary-900 font-montserrat"
          >
            Bonjour,{' '}
            <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
              {user?.user_metadata?.first_name || user?.first_name || 'Utilisateur'}
            </span>
            {' '}👋
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <NotificationBell />
              </motion.div>
            </div>
      </div>

      {/* Contenu principal optimisé mobile */}
      <div className="px-4 py-6 space-y-4">

        {/* Bouton d'action principal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center"
              >
                <Button 
                  onClick={() => navigate('/loan-request')}
            className="w-full max-w-sm bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl transform transition-all duration-200 py-4 px-6 rounded-2xl font-semibold"
                >
            <Plus size={20} className="mr-3" />
            Demander un nouveau prêt
                </Button>
            </motion.div>

        {/* Cartes métriques - Design Moderne */}
              <motion.div 
          className="grid grid-cols-2 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Score de crédit */}
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group cursor-pointer"
            onClick={() => navigate('/loyalty-score')}
          >
            <div className="relative overflow-hidden bg-gradient-to-r from-gray-800 via-gray-900 to-black rounded-3xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 h-40">
              {/* Effet de brillance */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              
              <div className="relative text-center h-full flex flex-col justify-center">
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Award size={20} className="text-yellow-400" />
                  </div>
                </div>
                <p className="text-gray-300 font-montserrat text-xs mb-1">Score de fidélité</p>
                <span className="text-xl font-bold text-white">{stats.loyaltyScore}</span>
                <p className="text-gray-400 text-xs">/ 5 points</p>
                
                {/* Étoiles */}
                <div className="flex justify-center mt-2 mb-3">
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                        className={`w-3 h-3 ${i < stats.loyaltyScore ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                            />
                          ))}
                        </div>
                      </div>

                {/* Barre de progression */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">Progression</span>
                    <span className="text-yellow-400 text-xs">+1</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div 
                      className="bg-gradient-to-r from-green-400 via-yellow-400 to-orange-400 h-1 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (stats.loyaltyScore / 5) * 100)}%` }}
                      />
                    </div>
                  </div>
                    </div>
                  </div>
              </motion.div>

              {/* Prochain paiement */}
              <motion.div 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group cursor-pointer"
          >
            <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-red-600 rounded-3xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 h-40">
              {/* Effet de brillance */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              
              <div className="relative text-center h-full flex flex-col justify-center">
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Bell size={20} className="text-white" />
                  </div>
                </div>
                <p className="text-orange-100 font-montserrat text-xs mb-1">Prochain paiement</p>
                <p className="text-xl font-bold text-white mb-1">{formatCurrency(stats.nextPayment)}</p>
                
                {/* Espace pour équilibrer avec la carte score */}
                <div className="h-8 mb-2"></div>
                
                <div className="flex items-center justify-center space-x-1">
                  <Clock size={14} className="text-orange-200" />
                  <span className="text-xs text-orange-200">
                    {(() => {
                      if (stats.daysUntilNextPayment === 0) {
                        return "Aujourd'hui";
                      } else if (stats.daysUntilNextPayment < 0) {
                        return `En retard de ${Math.abs(stats.daysUntilNextPayment)} jour${Math.abs(stats.daysUntilNextPayment) > 1 ? 's' : ''}`;
                      } else {
                        return `${stats.daysUntilNextPayment} jour${stats.daysUntilNextPayment > 1 ? 's' : ''}`;
                      }
                    })()}
                  </span>
                </div>
                
                {/* Barre de progression pour équilibrer */}
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-orange-200 text-xs">
                      {stats.dueDate ? stats.dueDate.toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'short' 
                      }) : 'Échéance'}
                    </span>
                    <span className="text-white text-xs">
                      {stats.daysUntilNextPayment < 0 ? '🚨' : stats.daysUntilNextPayment === 0 ? '⚠️' : '⏰'}
                    </span>
                  </div>
                  <div className="w-full bg-orange-300/30 rounded-full h-1">
                    <div 
                      className="bg-white h-1 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(() => {
                          if (stats.daysUntilNextPayment < 0) return 100; // En retard = barre pleine
                          if (stats.daysUntilNextPayment === 0) return 90; // Aujourd'hui = presque pleine
                          return Math.max(0, 100 - (stats.daysUntilNextPayment * 2)); // Décroissant selon les jours restants
                        })()}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Section Nos Services - Design Moderne */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-center">
            <h3 className="text-xl font-bold text-secondary-900 font-montserrat mb-2">
              Nos services
            </h3>
            <p className="text-sm text-neutral-600 font-montserrat">
              Découvrez nos solutions spécialisées
            </p>
      </div>

          <div className="space-y-4">
            {/* AB Épargne */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group cursor-pointer"
              onClick={() => navigate('/ab-epargne')}
            >
              <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                {/* Effet de brillance */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <BookOpen size={28} className="text-white" />
                  </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">★</span>
              </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white font-montserrat">AB Épargne</h4>
                      <p className="text-blue-100 text-sm font-montserrat">Épargnez intelligemment</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">💎</div>
                    <div className="text-xs text-blue-200">Premium</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* AB Logement */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group cursor-pointer"
              onClick={() => navigate('/ab-logement')}
            >
              <div className="relative overflow-hidden bg-gradient-to-r from-purple-500 via-purple-600 to-violet-600 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                {/* Effet de brillance */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <Target size={28} className="text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">🏠</span>
                      </div>
                      </div>
                      <div>
                      <h4 className="text-lg font-bold text-white font-montserrat">AB Logement</h4>
                      <p className="text-purple-100 text-sm font-montserrat">Votre maison de rêve</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">🏡</div>
                    <div className="text-xs text-purple-200">Nouveau</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Coaching et Finance Entrepreneuriale */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group cursor-pointer"
              onClick={() => navigate('/coaching-finance')}
            >
              <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                {/* Effet de brillance */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <GraduationCap size={28} className="text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">🔥</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white font-montserrat">Coaching et Finance Entrepreneuriale</h4>
                      <p className="text-orange-100 text-sm font-montserrat">Développez votre business</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">🚀</div>
                    <div className="text-xs text-orange-200">Expert</div>
                  </div>
                </div>
              </div>
            </motion.div>


          </div>


          </motion.div>
      </div>
      </div>
    </SavingsPlanGuard>
  );
};

export default ClientDashboard;