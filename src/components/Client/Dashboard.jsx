import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../UI/Card';
import Button from '../UI/Button';
import NotificationBell from '../UI/NotificationBell';
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
  Activity,
  BarChart3,
  Percent,
  Gift,
  Rocket,
  TrendingUp,
  DollarSign,
  Info,
  X,
  Phone,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { notifications, addNotification, markAsRead, showSuccess } = useNotifications();
  const [stats, setStats] = useState({
    totalLoaned: 0,
    totalRepaid: 0,
    amountToRepay: 0,
    activeLoans: 0,
    creditScore: 750,
    nextPayment: 0,
    daysUntilNextPayment: 0
  });

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

  // Données fictives pour les prêts récents
  const recentLoans = [
    {
      id: 1,
      amount: 120000,
      purpose: 'Achat d\'ordinateur portable',
      status: 'active',
      requestDate: '2024-01-10',
      monthlyPayment: 20000,
      remainingAmount: 80000,
      nextPaymentDate: '2024-02-10',
      category: 'education',
      progress: 33
    },
    {
      id: 2,
      amount: 80000,
      purpose: 'Frais de scolarité',
      status: 'completed',
      requestDate: '2023-09-15',
      monthlyPayment: 16000,
      remainingAmount: 0,
      nextPaymentDate: null,
      category: 'education',
      progress: 100
    },
    {
      id: 3,
      amount: 150000,
      purpose: 'Démarrage d\'activité commerciale',
      status: 'pending',
      requestDate: '2024-01-15',
      monthlyPayment: 25000,
      remainingAmount: 150000,
      nextPaymentDate: null,
      category: 'business',
      progress: 0
    }
  ];

  const [loading, setLoading] = useState(true);
  const [showLoyaltyInfo, setShowLoyaltyInfo] = useState(false);

  useEffect(() => {
    // Simulation des données (à remplacer par des appels API)
    setTimeout(() => {
      setStats({
        totalLoaned: 350000,
        totalRepaid: 280000,
        amountToRepay: 70000,
        activeLoans: 1,
        creditScore: 750,
        nextPayment: 20000,
        daysUntilNextPayment: 5
      });
      
      setLoading(false);

      // Notification de bienvenue (une seule fois)
      // setTimeout(() => {
      //   addNotification({
      //     type: 'success',
      //     title: 'Bienvenue !',
      //     message: 'Votre tableau de bord a été mis à jour avec les dernières informations.',
      //     action: 'Voir les détails'
      //   });
      //   showSuccess('Bienvenue ! Votre tableau de bord a été mis à jour.');
      // }, 2000);
    }, 1000);
  }, []); // Dépendances vides pour éviter les boucles infinies

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'completed': return 'text-green-600 bg-green-100 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'rejected': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'completed': return 'Remboursé';
      case 'pending': return 'En attente';
      case 'rejected': return 'Rejeté';
      default: return 'Inconnu';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'education': return <BookOpen className="w-4 h-4" />;
      case 'business': return <Target className="w-4 h-4" />;
      case 'health': return <Shield className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50 pt-0">
      <style>{gradientAnimation}</style>
      
      {/* Section Hero - En-tête principal */}
      <div className="relative overflow-hidden">
        {/* Background avec gradient animé */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 opacity-15 animate-gradient"></div>
        
        {/* Couche de profondeur supplémentaire */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent"></div>
        
        {/* Pattern décoratif amélioré */}
        <div className="absolute inset-0 opacity-8">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute top-0 left-0 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl"
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
              opacity: [0.6, 0.3, 0.6]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute top-0 right-0 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [180, 360, 180],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{ 
              duration: 12, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 4
            }}
            className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl"
          />
          
          {/* Particules flottantes */}
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-300 rounded-full"
          />
          <motion.div
            animate={{ 
              y: [0, 15, 0],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute top-3/4 right-1/3 w-3 h-3 bg-purple-300 rounded-full"
          />
          <motion.div
            animate={{ 
              x: [0, 10, 0],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-indigo-300 rounded-full"
          />
          
          {/* Particules supplémentaires */}
          <motion.div
            animate={{ 
              x: [0, -15, 0],
              y: [0, -10, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ 
              duration: 7, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute top-1/3 right-1/4 w-2 h-2 bg-green-300 rounded-full"
          />
          <motion.div
            animate={{ 
              x: [0, 12, 0],
              y: [0, -8, 0],
              opacity: [0.2, 0.7, 0.2]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 1.5
            }}
            className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-pink-300 rounded-full"
          />
          <motion.div
            animate={{ 
              x: [0, -8, 0],
              y: [0, 12, 0],
              opacity: [0.4, 0.9, 0.4]
            }}
            transition={{ 
              duration: 9, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 2.5
            }}
            className="absolute top-2/3 left-1/3 w-1 h-1 bg-yellow-300 rounded-full"
          />
        </div>

        {/* Contenu Header */}
        <div className="relative px-4 lg:px-8 py-8 lg:py-12 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            {/* Section Hero - En-tête principal */}
            <div className="text-center mb-8 lg:mb-12">
              {/* Badge animé */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-6 shadow-lg relative overflow-hidden"
              >
                {/* Effet de brillance sur le badge */}
                <motion.div
                  animate={{ 
                    x: ['-100%', '100%']
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: 1
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="w-2 h-2 bg-green-400 rounded-full"
                />
                <motion.span 
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="text-sm font-medium text-green-700 font-montserrat bg-gradient-to-r from-green-600 via-blue-600 to-green-600 bg-[length:200%_100%] bg-clip-text text-transparent"
                >
                  🏠 Tableau de Bord Client
                </motion.span>
              </motion.div>

              {/* Titre principal */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl lg:text-6xl font-bold text-secondary-900 font-montserrat mb-4"
              >
                Bonjour,{' '}
                <motion.span 
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-[length:200%_100%] bg-clip-text text-transparent"
                >
                  AVOCE Elodie
                </motion.span>{' '}
                <motion.span
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="inline-block"
                >
                  👋
                </motion.span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg lg:text-xl text-neutral-600 font-montserrat max-w-3xl mx-auto leading-relaxed"
              >
                Voici votre tableau de bord financier personnalisé
              </motion.p>

              {/* Sous-titre avec icônes animées */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex items-center justify-center space-x-6 mt-6"
              >
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="flex items-center space-x-2 text-sm text-neutral-500"
                >
                  <Wallet size={16} className="text-green-500" />
                  <span>Gestion financière</span>
                </motion.div>
                
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, -5, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="flex items-center space-x-2 text-sm text-neutral-500"
                >
                  <Shield size={16} className="text-blue-500" />
                  <span>Sécurité garantie</span>
                </motion.div>
                
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 2
                  }}
                  className="flex items-center space-x-2 text-sm text-neutral-500"
                >
                  <Activity size={16} className="text-purple-500" />
                  <span>Suivi en temps réel</span>
                </motion.div>
              </motion.div>
            </div>

            {/* Actions principales */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col lg:flex-row lg:items-center lg:justify-center mb-6 space-y-4 lg:space-y-0"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => navigate('/loan-request')}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl transform transition-all duration-200"
                >
                  <Plus size={20} className="mr-2" />
                  Nouveau prêt
                </Button>
              </motion.div>
            </motion.div>

            {/* Score de crédit et métriques principales */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Score de crédit */}
              <motion.div 
                className="lg:col-span-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-gradient-to-br from-secondary-900 to-secondary-800 text-white p-6 h-full cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                     onClick={() => navigate('/loyalty-score')}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-secondary-300 font-montserrat text-sm">Score de fidélité</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-3xl font-bold">{stats.creditScore}</span>
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < Math.floor(stats.creditScore / 150) ? 'text-yellow-400 fill-current' : 'text-secondary-400'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="p-3 bg-white/10 rounded-full">
                        <Award className="w-8 h-8 text-yellow-400" />
                      </div>
                      <div className="p-1 bg-white/10 rounded-full cursor-pointer hover:bg-white/20 transition-colors"
                           onClick={(e) => {
                             e.stopPropagation();
                             setShowLoyaltyInfo(true);
                           }}>
                        <Info className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-300">Excellent</span>
                      <span className="text-green-400">+25 pts</span>
                    </div>
                    <div className="w-full bg-secondary-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-yellow-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(stats.creditScore / 850) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-secondary-300">Cliquez pour voir les détails</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Prochain paiement */}
              <motion.div 
                className="lg:col-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-6 h-full">
          <div className="flex items-center justify-between">
            <div>
                      <p className="text-orange-100 font-montserrat text-sm mb-1">Prochain remboursement</p>
                      <p className="text-3xl font-bold mb-2">{formatCurrency(stats.nextPayment)}</p>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                          Échéance dans {stats.daysUntilNextPayment} jour{stats.daysUntilNextPayment > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="p-3 bg-white/10 rounded-full">
                        <Bell className="w-8 h-8" />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Statistiques détaillées */}
            <motion.div 
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="bg-white hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <div className="flex items-center justify-between p-3 lg:p-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-600 font-montserrat mb-1 truncate">Total emprunté</p>
                    <p className="text-lg lg:text-xl font-bold text-gray-900 font-montserrat truncate">
                {formatCurrency(stats.totalLoaned)}
              </p>
                    <p className="text-xs text-green-600 font-montserrat truncate">+12% ce mois</p>
            </div>
                  <div className="flex-shrink-0 p-2 lg:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full ml-2">
                    <CreditCard className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
          </div>
        </Card>

              <Card className="bg-white hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <div className="flex items-center justify-between p-3 lg:p-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-600 font-montserrat mb-1 truncate">Total remboursé</p>
                    <p className="text-lg lg:text-xl font-bold text-gray-900 font-montserrat truncate">
                {formatCurrency(stats.totalRepaid)}
              </p>
                    <p className="text-xs text-green-600 font-montserrat truncate">+8% ce mois</p>
            </div>
                  <div className="flex-shrink-0 p-2 lg:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-full ml-2">
                    <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
          </div>
        </Card>

              <Card className="bg-white hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <div className="flex items-center justify-between p-3 lg:p-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-600 font-montserrat mb-1 truncate">À rembourser</p>
                    <p className="text-lg lg:text-xl font-bold text-gray-900 font-montserrat truncate">
                {formatCurrency(stats.amountToRepay)}
              </p>
                    <p className="text-xs text-orange-600 font-montserrat truncate">Échéance proche</p>
            </div>
                  <div className="flex-shrink-0 p-2 lg:p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full ml-2">
                    <Clock className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
          </div>
        </Card>

              <Card className="bg-white hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <div className="flex items-center justify-between p-3 lg:p-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-600 font-montserrat mb-1 truncate">Prêts actifs</p>
                    <p className="text-lg lg:text-xl font-bold text-gray-900 font-montserrat truncate">
                {stats.activeLoans}
              </p>
                    <p className="text-xs text-blue-600 font-montserrat truncate">En cours</p>
            </div>
                  <div className="flex-shrink-0 p-2 lg:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full ml-2">
                    <Target className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
          </div>
        </Card>
            </motion.div>

            {/* Prêts récents */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="bg-white">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 font-montserrat">Prêts récents</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/loan-history')}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    Voir tout
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
      </div>
                <div className="space-y-4">
                  {recentLoans.slice(0, 3).map((loan) => (
              <div 
                key={loan.id}
                      className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-3 lg:space-y-0">
                        <div className="flex items-center space-x-4 min-w-0 flex-1">
                          <div className="flex-shrink-0 p-3 bg-primary-100 rounded-xl">
                            {getCategoryIcon(loan.category)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 font-montserrat truncate">{loan.purpose}</h4>
                            <p className="text-sm text-gray-500 font-montserrat">
                              Demande du {new Date(loan.requestDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                  </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xl lg:text-2xl font-bold text-gray-900 font-montserrat">
                            {formatCurrency(loan.amount)}
                          </p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(loan.status)}`}>
                            {getStatusText(loan.status)}
                    </span>
                  </div>
                </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4">
                        <div className="min-w-0">
                          <p className="text-xs lg:text-sm text-gray-600 font-montserrat truncate">Paiement mensuel</p>
                          <p className="text-sm lg:text-base font-semibold text-gray-900 font-montserrat truncate">
                            {formatCurrency(loan.monthlyPayment)}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs lg:text-sm text-gray-600 font-montserrat truncate">Statut</p>
                                                      <p className="text-sm lg:text-base font-semibold text-gray-900 font-montserrat truncate">
                              {loan.paidAmount >= loan.totalAmount ? 'Remboursé' : 'En cours'}
                            </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs lg:text-sm text-gray-600 font-montserrat truncate">Progression</p>
                          <p className="text-sm lg:text-base font-semibold text-gray-900 font-montserrat truncate">{loan.progress}%</p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs lg:text-sm text-gray-600 font-montserrat truncate">Prochain paiement</p>
                          <p className="text-sm lg:text-base font-semibold text-gray-900 font-montserrat truncate">
                            {loan.nextPaymentDate ? new Date(loan.nextPaymentDate).toLocaleDateString('fr-FR') : 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                        <div 
                          className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${loan.progress}%` }}
                        />
                      </div>
                
                {loan.status === 'active' && (
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <Button
                      onClick={() => navigate('/repayment')}
                            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
                    >
                            <Wallet className="w-4 h-4 mr-2" />
                      Rembourser
                    </Button>
                          <Button
                            variant="outline"
                            className="flex-1"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Détails
                          </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
      </Card>
            </motion.div>

            {/* Actions rapides en bas */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
        <Button
          variant="outline"
          onClick={() => navigate('/loan-request')}
                className="p-6 h-auto flex-col space-y-3 bg-white hover:shadow-lg transition-all duration-200"
              >
                <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full">
                  <Plus size={24} className="text-white" />
                </div>
                <div className="text-center">
                  <span className="font-semibold text-gray-900 font-montserrat">Demander un prêt</span>
                  <p className="text-sm text-gray-500 font-montserrat mt-1">Nouvelle demande de financement</p>
                </div>
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate('/repayment')}
                className="p-6 h-auto flex-col space-y-3 bg-white hover:shadow-lg transition-all duration-200"
              >
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-full">
                  <Wallet size={24} className="text-white" />
                </div>
                <div className="text-center">
                  <span className="font-semibold text-gray-900 font-montserrat">Rembourser</span>
                  <p className="text-sm text-gray-500 font-montserrat mt-1">Effectuer un paiement</p>
      </div>
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate('/loan-history')}
                className="p-6 h-auto flex-col space-y-3 bg-white hover:shadow-lg transition-all duration-200"
              >
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full">
                  <History size={24} className="text-white" />
                </div>
                <div className="text-center">
                  <span className="font-semibold text-gray-900 font-montserrat">Historique</span>
                  <p className="text-sm text-gray-500 font-montserrat mt-1">Voir tous vos prêts</p>
                </div>
        </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal d'information sur le score de fidélité */}
      <AnimatePresence>
        {showLoyaltyInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowLoyaltyInfo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 font-montserrat">
                    Programme de Fidélité
                  </h3>
                </div>
                <button
                  onClick={() => setShowLoyaltyInfo(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Comment ça marche */}
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-blue-900 mb-3 font-montserrat flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Comment gagner des points ?
                  </h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                      <span>Effectuez 4 prêts consécutifs</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                      <span>Remboursez chaque prêt avant échéance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                      <span>Gagnez +5 points sur votre score</span>
                    </div>
                  </div>
                </div>

                {/* Avantages */}
                <div className="bg-green-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-green-900 mb-3 font-montserrat flex items-center">
                    <Gift className="w-5 h-5 mr-2" />
                    Avantages débloqués
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-200 rounded-lg">
                        <Percent className="w-4 h-4 text-green-700" />
                      </div>
                      <div>
                        <p className="font-medium text-green-900 text-sm">Réduction de 2% sur les frais</p>
                        <p className="text-green-700 text-xs">Économisez sur tous vos prêts futurs</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-200 rounded-lg">
                        <Phone className="w-4 h-4 text-green-700" />
                      </div>
                      <div>
                        <p className="font-medium text-green-900 text-sm">Forfait d'appel gratuit</p>
                        <p className="text-green-700 text-xs">Crédit téléphonique sur le numéro de votre choix</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-200 rounded-lg">
                        <Zap className="w-4 h-4 text-green-700" />
                      </div>
                      <div>
                        <p className="font-medium text-green-900 text-sm">Traitement prioritaire</p>
                        <p className="text-green-700 text-xs">Vos demandes sont traitées en priorité</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Votre progression */}
                <div className="bg-purple-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-purple-900 mb-3 font-montserrat flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Votre progression
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-800">Score actuel</span>
                      <span className="font-bold text-purple-900">75/100</span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `75%` }}
                      />
                    </div>
                    <p className="text-xs text-purple-700">
                      Niveau Gold atteint ! Plus que 1 point pour le niveau Platinum.
                    </p>
                  </div>
                </div>

                {/* Call to action */}
                <div className="flex space-x-3">
                  <Button
                    onClick={() => {
                      setShowLoyaltyInfo(false);
                      navigate('/loyalty-score');
                    }}
                    className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                  >
                    Voir les détails complets
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowLoyaltyInfo(false)}
                    className="flex-1"
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientDashboard;