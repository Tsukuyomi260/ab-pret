import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { useSupabaseNotifications } from '../../utils/useSupabaseNotifications';
import { getAnalyticsData } from '../../utils/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CreditCard, 
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Download,
  Filter,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Target,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  LineChart,
  BarChart,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  Target as TargetIcon,
  Award as AwardIcon,
  Calendar as CalendarIcon,
  Download as DownloadIcon,
  Filter as FilterIcon,
  RefreshCw as RefreshCwIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  ArrowRight,
  Plus,
  MoreHorizontal,
  Settings,
  Share2,
  Zap,
  Star,
  Crown,
  Trophy,
  Medal,
  Gem,
  Sparkles
} from 'lucide-react';

const Analytics = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();
  const { isConnected } = useSupabaseNotifications();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [showDetailedStats, setShowDetailedStats] = useState(true);
  const [viewMode, setViewMode] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalLoans: 156,
      totalAmount: 45000000,
      activeLoans: 89,
      totalUsers: 234,
      pendingUsers: 12,
      approvedUsers: 198,
      rejectedUsers: 24
    },
    trends: {
      monthlyGrowth: 12.5,
      loanGrowth: 8.3,
      userGrowth: 15.7
    },
    topPerformers: [
      { name: 'Utilisateur A', loans: 8, totalAmount: 2500000, avgAmount: 312500 },
      { name: 'Utilisateur B', loans: 6, totalAmount: 1800000, avgAmount: 300000 },
      { name: 'Utilisateur C', loans: 5, totalAmount: 1500000, avgAmount: 300000 },
      { name: 'Utilisateur F', loans: 4, totalAmount: 1200000, avgAmount: 300000 }
    ],
    recentActivity: [
      { type: 'loan_approved', user: 'Utilisateur A', amount: 500000, date: '2024-01-20T10:30:00' },
      { type: 'user_registered', user: 'Utilisateur D', date: '2024-01-20T09:15:00' },
      { type: 'loan_repaid', user: 'Utilisateur B', amount: 300000, date: '2024-01-20T08:45:00' },
      { type: 'loan_requested', user: 'Utilisateur E', amount: 400000, date: '2024-01-20T08:20:00' },
      { type: 'loan_approved', user: 'Utilisateur F', amount: 600000, date: '2024-01-20T07:30:00' }
    ]
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Simulation du chargement des données
      setTimeout(() => {
        setLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
      showError('Erreur lors du chargement des données');
      setLoading(false);
    }
  };

  const getGrowthColor = (value) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (value) => {
    return value >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'loan_approved':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'user_registered':
        return <Users size={16} className="text-blue-600" />;
      case 'loan_repaid':
        return <DollarSign size={16} className="text-green-600" />;
      case 'loan_requested':
        return <CreditCard size={16} className="text-orange-600" />;
      default:
        return <Activity size={16} className="text-gray-600" />;
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'loan_approved':
        return `Prêt approuvé pour ${activity.user} - ${activity.amount?.toLocaleString()} FCFA`;
      case 'user_registered':
        return `${activity.user} s'est inscrit(e)`;
      case 'loan_repaid':
        return `${activity.user} a remboursé ${activity.amount?.toLocaleString()} FCFA`;
      case 'loan_requested':
        return `${activity.user} a demandé un prêt de ${activity.amount?.toLocaleString()} FCFA`;
      default:
        return 'Activité inconnue';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  if (loading) {
    return (
      <div className="bg-accent-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-lg text-neutral-600 font-montserrat">Chargement des analytics...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-accent-50">
      {/* Header avec design moderne */}
      <div className="relative overflow-hidden">
        {/* Background avec gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-600 to-orange-600 opacity-10"></div>
        
        {/* Pattern décoratif */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>

        {/* Contenu Header */}
        <div className="relative px-4 lg:px-8 py-8 lg:py-12">
          <div className="max-w-7xl mx-auto">
            {/* En-tête avec salutation */}
            <div className="text-center mb-8 lg:mb-12">


              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl lg:text-6xl font-bold text-secondary-900 font-montserrat mb-4"
              >
                Analytics <span className="text-purple-600">Intelligentes</span> 📊
              </motion.h1>


            </div>

            {/* Indicateur de connexion temps réel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex justify-center mb-8"
            >
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${
                isConnected 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span>
                  {isConnected ? 'Temps réel actif' : 'Hors ligne'}
                </span>
              </div>
            </motion.div>

            {/* Statistiques principales avec design moderne */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-soft hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <CreditCard size={20} className="text-purple-600" />
                  </div>
                  <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                    Total
                  </span>
                </div>
                <p className="text-2xl font-bold text-secondary-900 font-montserrat mb-1">
                  {formatNumber(analyticsData.overview.totalLoans)}
                </p>
                <p className="text-sm text-neutral-600 font-montserrat mb-2">
                  Prêts accordés
                </p>
                <div className="flex items-center space-x-1">
                  {getGrowthIcon(analyticsData.trends.loanGrowth)}
                  <span className={`text-xs font-medium ${getGrowthColor(analyticsData.trends.loanGrowth)}`}>
                    +{analyticsData.trends.loanGrowth}%
                  </span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-soft hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <DollarSign size={20} className="text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                    Total
                  </span>
                </div>
                <p className="text-2xl font-bold text-secondary-900 font-montserrat mb-1">
                  {formatCurrency(analyticsData.overview.totalAmount)}
                </p>
                <p className="text-sm text-neutral-600 font-montserrat mb-2">
                  Montant total
                </p>
                <div className="flex items-center space-x-1">
                  {getGrowthIcon(analyticsData.trends.monthlyGrowth)}
                  <span className={`text-xs font-medium ${getGrowthColor(analyticsData.trends.monthlyGrowth)}`}>
                    +{analyticsData.trends.monthlyGrowth}%
                  </span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-soft hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Users size={20} className="text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                    Total
                  </span>
                </div>
                <p className="text-2xl font-bold text-secondary-900 font-montserrat mb-1">
                  {formatNumber(analyticsData.overview.totalUsers)}
                </p>
                <p className="text-sm text-neutral-600 font-montserrat mb-2">
                  Utilisateurs inscrits
                </p>
                <div className="flex items-center space-x-1">
                  {getGrowthIcon(analyticsData.trends.userGrowth)}
                  <span className={`text-xs font-medium ${getGrowthColor(analyticsData.trends.userGrowth)}`}>
                    +{analyticsData.trends.userGrowth}%
                  </span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-soft hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <Activity size={20} className="text-orange-600" />
                  </div>
                  <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                    Actifs
                  </span>
                </div>
                <p className="text-2xl font-bold text-secondary-900 font-montserrat mb-1">
                  {formatNumber(analyticsData.overview.activeLoans)}
                </p>
                <p className="text-sm text-neutral-600 font-montserrat mb-2">
                  Prêts en cours
                </p>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-neutral-500">En cours</span>
                </div>
              </div>
            </motion.div>

            {/* Actions rapides */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <FilterIcon size={20} className="text-neutral-400" />
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-4 py-2 bg-white/50 backdrop-blur-sm border border-white/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="week">Cette semaine</option>
                    <option value="month">Ce mois</option>
                    <option value="quarter">Ce trimestre</option>
                    <option value="year">Cette année</option>
                  </select>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadAnalyticsData}
                  className="flex items-center space-x-2"
                >
                  <RefreshCwIcon size={16} />
                  <span>Actualiser</span>
                </Button>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetailedStats(!showDetailedStats)}
                  className="flex items-center space-x-2"
                >
                  {showDetailedStats ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  <span>{showDetailedStats ? 'Masquer détails' : 'Afficher détails'}</span>
                </Button>
                
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 flex items-center space-x-2"
                >
                  <DownloadIcon size={16} />
                  <span>Exporter</span>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="px-4 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Graphiques et analyses détaillées */}
          <AnimatePresence mode="wait">
            {showDetailedStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
              >
                {/* Top performeurs */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-soft overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-secondary-900 font-montserrat">
                        🏆 Top Performeurs
                      </h3>
                      <div className="p-2 bg-purple-100 rounded-full">
                        <Trophy size={20} className="text-purple-600" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      {analyticsData.topPerformers.map((performer, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              index === 0 ? 'bg-yellow-100' : 
                              index === 1 ? 'bg-gray-100' : 
                              index === 2 ? 'bg-orange-100' : 'bg-purple-100'
                            }`}>
                              {index === 0 ? <Crown size={16} className="text-yellow-600" /> :
                               index === 1 ? <Medal size={16} className="text-gray-600" /> :
                               index === 2 ? <Star size={16} className="text-orange-600" /> :
                               <Gem size={16} className="text-purple-600" />}
                            </div>
                            <div>
                              <p className="font-bold text-secondary-900 font-montserrat">{performer.name}</p>
                              <p className="text-sm text-neutral-600 font-montserrat">
                                {performer.loans} prêts • {formatCurrency(performer.totalAmount)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-secondary-900 font-montserrat">
                              {formatCurrency(performer.avgAmount)}
                            </p>
                            <p className="text-xs text-neutral-600 font-montserrat">Moyenne</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Répartition des utilisateurs */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-soft overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-secondary-900 font-montserrat">
                        📊 Répartition Utilisateurs
                      </h3>
                      <div className="p-2 bg-blue-100 rounded-full">
                        <PieChartIcon size={20} className="text-blue-600" />
                      </div>
                    </div>
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                          <span className="font-medium text-secondary-900 font-montserrat">Approuvés</span>
                        </div>
                        <span className="text-lg font-bold text-secondary-900 font-montserrat">
                          {analyticsData.overview.approvedUsers}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                          <span className="font-medium text-secondary-900 font-montserrat">En attente</span>
                        </div>
                        <span className="text-lg font-bold text-secondary-900 font-montserrat">
                          {analyticsData.overview.pendingUsers}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                          <span className="font-medium text-secondary-900 font-montserrat">Rejetés</span>
                        </div>
                        <span className="text-lg font-bold text-secondary-900 font-montserrat">
                          {analyticsData.overview.rejectedUsers}
                        </span>
                      </div>
                    </div>
                    
                    {/* Graphique en anneau moderne */}
                    <div className="flex justify-center">
                      <div className="relative w-40 h-40">
                        <svg className="w-40 h-40 transform -rotate-90">
                          <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            className="text-neutral-200"
                          />
                          <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={`${(analyticsData.overview.approvedUsers / analyticsData.overview.totalUsers) * 440} 440`}
                            className="text-green-500"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-secondary-900 font-montserrat">
                              {analyticsData.overview.totalUsers}
                            </p>
                            <p className="text-sm text-neutral-600 font-montserrat">Total</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Activité récente avec design moderne */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-soft overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary-900 font-montserrat">
                  ⚡ Activité Récente
                </h3>
                <div className="p-2 bg-orange-100 rounded-full">
                  <Zap size={20} className="text-orange-600" />
                </div>
              </div>
              <div className="space-y-3">
                {analyticsData.recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-100 hover:shadow-md transition-all duration-300"
                  >
                    <div className="p-2 bg-white rounded-full shadow-sm">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-secondary-900 font-montserrat">
                        {getActivityText(activity)}
                      </p>
                      <p className="text-sm text-neutral-600 font-montserrat">
                        {new Date(activity.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 