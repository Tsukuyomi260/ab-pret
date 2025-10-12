import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { getLoans, getPayments } from '../../utils/supabaseAPI';
import { 
  Star, 
  Award, 
  Target, 
  TrendingUp, 
  Gift, 
  Percent, 
  Phone, 
  CheckCircle, 
  Clock, 
  ArrowLeft,
  Info,
  Trophy,
  Zap,
  Crown,
  Diamond,
  Sparkles,
  BookOpen,
  Lightbulb,
  X
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const LoyaltyScore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [activeTab, setActiveTab] = useState('overview');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Données du score de fidélité dynamiques
  const [loyaltyData, setLoyaltyData] = useState({
    currentScore: 0,
    maxScore: 5, // Score maximum de 5 points
    level: 'Bronze',
    nextLevel: 'Silver',
    pointsToNextLevel: 1,
    completedLoans: 0,
    loansForNextBonus: 1,
    totalSavings: 0,
    phoneCreditEarned: 0,
    nextReward: 'Premier bonus après 1 remboursement',
    history: []
  });

  const levels = [
    { name: 'Bronze', minScore: 0, maxScore: 1, color: 'from-amber-600 to-amber-800', icon: Star },
    { name: 'Silver', minScore: 2, maxScore: 2, color: 'from-gray-400 to-gray-600', icon: Award },
    { name: 'Gold', minScore: 3, maxScore: 3, color: 'from-yellow-400 to-yellow-600', icon: Trophy },
    { name: 'Platinum', minScore: 4, maxScore: 4, color: 'from-blue-400 to-blue-600', icon: Crown },
    { name: 'Diamond', minScore: 5, maxScore: 5, color: 'from-purple-400 to-purple-600', icon: Diamond }
  ];

  const currentLevel = levels.find(level => 
    loyaltyData.currentScore >= level.minScore && loyaltyData.currentScore <= level.maxScore
  );

  const getLevelColor = (score) => {
    const level = levels.find(l => score >= l.minScore && score <= l.maxScore);
    return level ? level.color : 'from-gray-400 to-gray-600';
  };

  const getLevelIcon = (score) => {
    const level = levels.find(l => score >= l.minScore && score <= l.maxScore);
    return level ? level.icon : Star;
  };

  // Fonction pour calculer le score de fidélité basé sur les remboursements
  const calculateLoyaltyScore = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Récupérer les prêts et paiements de l'utilisateur
      const [loansResult, paymentsResult] = await Promise.all([
        getLoans(user.id),
        getPayments(user.id)
      ]);

      if (loansResult.success && paymentsResult.success) {
        const loans = loansResult.data || [];
        const payments = paymentsResult.data || [];

        // +1 point UNIQUEMENT si remboursement avant la date d'échéance
        // Préparer un index des prêts par id pour récupérer dates/durée
        const loanById = new Map(
          loans.map(loan => [loan.id, loan])
        );

        const completedPayments = payments.filter(p => (p.status || '').toLowerCase() === 'completed');

        // Ensemble des prêts remboursés à temps (unique par prêt)
        const onTimeLoanIds = new Set();

        // Historique: premier paiement à temps par prêt
        const firstOnTimePaymentByLoan = new Map();

        completedPayments.forEach(p => {
            const loan = loanById.get(p.loan_id);
            if (!loan) return;

            const loanCreatedAt = new Date(loan.created_at || new Date());
          const durationDays = parseInt(loan.duration_months || loan.duration || 30, 10);
            const dueDate = new Date(loanCreatedAt.getTime() + durationDays * 24 * 60 * 60 * 1000);

            const paymentDate = new Date(p.payment_date || p.created_at || new Date());
            const isOnTime = paymentDate.getTime() <= dueDate.getTime();

            if (isOnTime) {
            onTimeLoanIds.add(p.loan_id);
            const existing = firstOnTimePaymentByLoan.get(p.loan_id);
            if (!existing || paymentDate.getTime() < existing.paymentDate.getTime()) {
              firstOnTimePaymentByLoan.set(p.loan_id, { id: p.id, paymentDate });
            }
          }
        });

        // Score borné à 5, +1 par prêt remboursé à temps
        const currentScore = Math.max(0, Math.min(5, onTimeLoanIds.size));

        // Historique construit à partir du premier paiement à temps par prêt
        const history = Array.from(firstOnTimePaymentByLoan.entries()).map(([loanId, info]) => ({
          id: info.id,
          date: info.paymentDate.toISOString(),
          points: 1,
          action: `Remboursement à temps du prêt #${loanId}`
        }));

        // Nombre de prêts terminés (status 'completed' ou 'remboursé')
        const completedLoansCount = loans.filter(l => {
          const s = (l.status || '').toLowerCase();
          return s === 'completed' || s === 'remboursé';
        }).length;

        // Déterminer le prochain niveau
        const nextLevelDef = levels.find(level => level.minScore > currentScore) || levels[levels.length - 1];
        const pointsToNextLevel = Math.max(0, (nextLevelDef.minScore ?? currentScore) - currentScore);

        // Récompense suivante (texte)
        const nextReward = currentScore >= 5 ? 'Score maximum atteint' : '1 remboursement à temps = +1 point';

        setLoyaltyData({
          currentScore,
          maxScore: 5,
          level: (levels.find(l => currentScore >= l.minScore && currentScore <= l.maxScore)?.name) || 'Bronze',
          nextLevel: nextLevelDef.name,
          pointsToNextLevel,
          completedLoans: completedLoansCount,
          loansForNextBonus: Math.max(0, 1),
          totalSavings: 0,
          phoneCreditEarned: 0,
          nextReward,
          history
        });
      }
    } catch (error) {
      console.error('[LOYALTY] Erreur lors du calcul du score:', error);
      showError('Erreur lors du chargement du score de fidélité');
    } finally {
      setLoading(false);
    }
  }, [user?.id, showError]);

  // Charger les données au montage du composant
  useEffect(() => {
    calculateLoyaltyScore();
  }, [calculateLoyaltyScore]);

  const benefits = [
    {
      title: 'Réduction de 2% sur les frais',
      description: 'Économisez sur tous vos prêts futurs',
      icon: Percent,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Forfait d\'internet',
      description: 'Recevez un forfait internet sur le numéro de votre choix',
      icon: Phone,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Traitement prioritaire',
      description: 'Vos demandes sont traitées en priorité',
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Taux d\'intérêt préférentiels',
      description: 'Bénéficiez de taux réduits sur vos prêts',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Remboursez un prêt',
      description: 'Remboursez votre prêt dans les délais impartis',
      icon: Target,
      color: 'from-blue-500 to-blue-600'
    },
    {
      step: 2,
      title: 'Gagnez 1 point',
      description: 'Votre score de fidélité augmente de 1 point',
      icon: CheckCircle,
      color: 'from-green-500 to-green-600'
    },
    {
      step: 3,
      title: 'Progressez vers le niveau supérieur',
      description: 'Atteignez le niveau suivant avec plus de remboursements',
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600'
    },
    {
      step: 4,
      title: 'Débloquez les avantages',
      description: 'Profitez de réductions et de forfaits gratuits',
      icon: Gift,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft size={20} />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 font-montserrat">
                  Score de Fidélité
                </h1>
                <p className="text-sm text-gray-600 font-montserrat">
                  Programme de récompenses et avantages
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => setShowInfoModal(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Info size={20} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {loading ? (
            <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl">
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement du score de fidélité...</p>
              </div>
            </Card>
          ) : (
          <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl">
            <div className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className={`p-6 rounded-full bg-gradient-to-br ${getLevelColor(loyaltyData.currentScore)}`}>
                  {React.createElement(getLevelIcon(loyaltyData.currentScore), { 
                    size: 48, 
                    className: "text-white" 
                  })}
                </div>
              </div>
              
              <h2 className="text-4xl font-bold text-gray-900 font-montserrat mb-2">
                {loyaltyData.currentScore}/5
              </h2>
              <p className="text-xl font-semibold text-gray-700 font-montserrat mb-4">
                Niveau {currentLevel?.name}
              </p>
              
              {/* Note informative pour les comptes existants */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 max-w-md mx-auto">
                <div className="flex items-center space-x-2 mb-2">
                  <Info size={16} className="text-blue-600" />
                  <p className="text-sm font-medium text-blue-800">Système mis à jour</p>
                </div>
                <p className="text-xs text-blue-700">
                  Le système de score de fidélité a été mis à jour. Tous les comptes commencent maintenant à 0/5 points. 
                  Votre progression se fera à partir de vos prochains remboursements.
                </p>
              </div>
              
                             <div className="w-full max-w-md mx-auto mb-6">
                 <div className="flex justify-between text-sm text-gray-600 mb-2">
                   <span>Progression vers {loyaltyData.nextLevel}</span>
                   <span>{loyaltyData.pointsToNextLevel} point{loyaltyData.pointsToNextLevel > 1 ? 's' : ''} restant{loyaltyData.pointsToNextLevel > 1 ? 's' : ''}</span>
                 </div>
                 <div className="w-full bg-gray-200 rounded-full h-3">
                   <motion.div 
                     className={`h-3 rounded-full bg-gradient-to-r ${getLevelColor(loyaltyData.currentScore)}`}
                     initial={{ width: 0 }}
                     animate={{ width: `${(loyaltyData.currentScore / loyaltyData.maxScore) * 100}%` }}
                     transition={{ duration: 1, delay: 0.5 }}
                   />
                 </div>
                 <p className="text-xs text-gray-500 mt-1">{Math.round((loyaltyData.currentScore / loyaltyData.maxScore) * 100)}% du score maximum atteint</p>
               </div>

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{loyaltyData.completedLoans}</p>
                  <p className="text-sm text-gray-600">Prêts terminés</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{loyaltyData.loansForNextBonus}</p>
                  <p className="text-sm text-gray-600">Pour le bonus</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(loyaltyData.totalSavings)}</p>
                  <p className="text-sm text-gray-600">Économies</p>
                </div>
              </div>
            </div>
          </Card>
          )}
        </motion.div>

        {/* Navigation des onglets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: Target },
              { id: 'benefits', label: 'Avantages', icon: Gift },
              { id: 'how-it-works', label: 'Comment ça marche', icon: BookOpen },
              { id: 'history', label: 'Historique', icon: Clock }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {React.createElement(tab.icon, { size: 16 })}
                <span className="font-montserrat">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Contenu des onglets */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Prochain objectif */}
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold font-montserrat mb-2">Prochain objectif</h3>
                      <p className="text-blue-100">Terminez votre 4ème prêt pour débloquer le bonus</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-full">
                      <Target size={24} />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progression</span>
                        <span>{loyaltyData.completedLoans}/4 prêts</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-white h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(loyaltyData.completedLoans / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                    <Button
                      variant="white"
                      onClick={() => navigate('/loan-request')}
                      className="whitespace-nowrap"
                    >
                      Demander un prêt
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Récompenses disponibles */}
              <div className="grid grid-cols-1 gap-6">
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold font-montserrat mb-1">Forfait internet</h3>
                        <p className="text-purple-100 text-sm">Prochaine récompense</p>
                      </div>
                      <div className="p-2 bg-white/20 rounded-full">
                        <Phone size={20} />
                      </div>
                    </div>
                    <p className="text-lg font-semibold">
                      {loyaltyData.nextReward}
                    </p>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'benefits' && (
            <motion.div
              key="benefits"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                      <div className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-lg ${benefit.bgColor}`}>
                            {React.createElement(benefit.icon, { 
                              size: 24, 
                              className: benefit.color 
                            })}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 font-montserrat mb-2">
                              {benefit.title}
                            </h3>
                            <p className="text-gray-600 font-montserrat">
                              {benefit.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'how-it-works' && (
            <motion.div
              key="how-it-works"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Lightbulb size={20} className="text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 font-montserrat">
                        Comment fonctionne le programme de fidélité ?
                      </h3>
                    </div>
                    <p className="text-gray-700 font-montserrat">
                      Notre programme de fidélité récompense les clients qui remboursent leurs prêts 
                      dans les délais. Plus vous êtes fidèle, plus vous bénéficiez d'avantages exclusifs.
                    </p>
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {howItWorks.map((step, index) => (
                    <motion.div
                      key={step.step}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="text-center hover:shadow-lg transition-all duration-200">
                        <div className="p-6">
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${step.color} text-white font-bold text-lg mb-4`}>
                            {step.step}
                          </div>
                          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${step.color} text-white mb-4`}>
                            {React.createElement(step.icon, { size: 24 })}
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 font-montserrat mb-2">
                            {step.title}
                          </h4>
                          <p className="text-gray-600 font-montserrat text-sm">
                            {step.description}
                          </p>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Sparkles size={20} className="text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 font-montserrat">
                        Avantages cumulatifs
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CheckCircle size={16} className="text-green-600" />
                          <span className="text-sm font-montserrat">Score de fidélité +1 point</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle size={16} className="text-green-600" />
                          <span className="text-sm font-montserrat">Réduction de 2% sur les frais</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CheckCircle size={16} className="text-green-600" />
                          <span className="text-sm font-montserrat">Forfait internet gratuit</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle size={16} className="text-green-600" />
                          <span className="text-sm font-montserrat">Traitement prioritaire</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 font-montserrat mb-4">
                    Historique des points
                  </h3>
                  <div className="space-y-4">
                    {loyaltyData.history.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-full">
                            <TrendingUp size={16} className="text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 font-montserrat">
                              {item.action}
                            </p>
                            <p className="text-sm text-gray-600 font-montserrat">
                              {new Date(item.date).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            +{item.points} points
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal d'information */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowInfoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 font-montserrat">
                  À propos du score de fidélité
                </h3>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4 text-sm text-gray-700 font-montserrat">
                <p>
                  Le score de fidélité est un programme de récompenses qui vous permet de bénéficier 
                  d'avantages exclusifs en fonction de votre historique de remboursement.
                </p>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Comment gagner des points :</h4>
                  <ul className="space-y-1 text-blue-800">
                    <li>• Rembourser un prêt dans les délais impartis</li>
                    <li>• +1 point par remboursement à temps</li>
                    <li>• Score maximum : 5 points</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Avantages débloqués :</h4>
                  <ul className="space-y-1 text-green-800">
                    <li>• Réduction de 2% sur les frais</li>
                    <li>• Forfait internet gratuit</li>
                    <li>• Traitement prioritaire</li>
                    <li>• Taux d'intérêt préférentiels</li>
                  </ul>
                </div>

                <p className="text-xs text-gray-500">
                  Les avantages sont cumulatifs et s'appliquent automatiquement 
                  une fois les conditions remplies.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoyaltyScore; 