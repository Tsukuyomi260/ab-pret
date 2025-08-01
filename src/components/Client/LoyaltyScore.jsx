import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
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
  Heart,
  Calendar,
  DollarSign,
  Users,
  Shield,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  Play,
  BookOpen,
  Lightbulb,
  X
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const LoyaltyScore = () => {
  const navigate = useNavigate();
  const { showSuccess } = useNotifications();
  const [activeTab, setActiveTab] = useState('overview');
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Données du score de fidélité
  const [loyaltyData, setLoyaltyData] = useState({
    currentScore: 75,
    maxScore: 100,
    level: 'Gold',
    nextLevel: 'Platinum',
    pointsToNextLevel: 1,
    completedLoans: 3,
    loansForNextBonus: 1,
    totalSavings: 15000,
    phoneCreditEarned: 500,
    nextReward: 'Forfait d\'appel 500 FCFA',
    history: [
      {
        id: 1,
        date: '2024-01-15',
        action: 'Prêt remboursé avant échéance',
        points: 5,
        type: 'bonus'
      },
      {
        id: 2,
        date: '2024-01-10',
        action: 'Prêt remboursé avant échéance',
        points: 5,
        type: 'bonus'
      },
      {
        id: 3,
        date: '2024-01-05',
        action: 'Prêt remboursé avant échéance',
        points: 5,
        type: 'bonus'
      }
    ]
  });

  const levels = [
    { name: 'Bronze', minScore: 0, maxScore: 25, color: 'from-amber-600 to-amber-800', icon: Star },
    { name: 'Silver', minScore: 26, maxScore: 50, color: 'from-gray-400 to-gray-600', icon: Award },
    { name: 'Gold', minScore: 51, maxScore: 75, color: 'from-yellow-400 to-yellow-600', icon: Trophy },
    { name: 'Platinum', minScore: 76, maxScore: 90, color: 'from-blue-400 to-blue-600', icon: Crown },
    { name: 'Diamond', minScore: 91, maxScore: 100, color: 'from-purple-400 to-purple-600', icon: Diamond }
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

  const benefits = [
    {
      title: 'Réduction de 2% sur les frais',
      description: 'Économisez sur tous vos prêts futurs',
      icon: Percent,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Forfait d\'appel gratuit',
      description: 'Recevez un crédit téléphonique sur le numéro de votre choix',
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
      title: 'Effectuez 4 prêts',
      description: 'Demandez et obtenez 4 prêts consécutifs',
      icon: Target,
      color: 'from-blue-500 to-blue-600'
    },
    {
      step: 2,
      title: 'Remboursez à temps',
      description: 'Remboursez chaque prêt avant l\'échéance',
      icon: CheckCircle,
      color: 'from-green-500 to-green-600'
    },
    {
      step: 3,
      title: 'Gagnez 5 points',
      description: 'Votre score de fidélité augmente de 5 points',
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
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
                {loyaltyData.currentScore}/100
              </h2>
              <p className="text-xl font-semibold text-gray-700 font-montserrat mb-4">
                Niveau {currentLevel?.name}
              </p>
              
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
                 <p className="text-xs text-gray-500 mt-1">75% du score maximum atteint</p>
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
              className="space-y-6"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold font-montserrat mb-1">Réduction active</h3>
                        <p className="text-green-100 text-sm">2% sur tous vos prêts</p>
                      </div>
                      <div className="p-2 bg-white/20 rounded-full">
                        <Percent size={20} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold">
                      {formatCurrency(loyaltyData.totalSavings)} économisés
                    </p>
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold font-montserrat mb-1">Forfait d'appel</h3>
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
              <div className="space-y-6">
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
                          <span className="text-sm font-montserrat">Score de fidélité +5 points</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle size={16} className="text-green-600" />
                          <span className="text-sm font-montserrat">Réduction de 2% sur les frais</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CheckCircle size={16} className="text-green-600" />
                          <span className="text-sm font-montserrat">Forfait d'appel gratuit</span>
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
                    <li>• Rembourser 4 prêts consécutifs avant échéance</li>
                    <li>• +5 points par cycle de 4 prêts</li>
                    <li>• Score maximum : 100 points</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Avantages débloqués :</h4>
                  <ul className="space-y-1 text-green-800">
                    <li>• Réduction de 2% sur les frais</li>
                    <li>• Forfait d'appel gratuit</li>
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