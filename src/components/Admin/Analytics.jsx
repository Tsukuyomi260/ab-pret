import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { useSupabaseNotifications } from '../../utils/useSupabaseNotifications';
import { getAnalyticsData } from '../../utils/supabaseClient';
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
  AlertCircle
} from 'lucide-react';

const Analytics = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { isConnected } = useSupabaseNotifications();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalLoans: 0,
      totalAmount: 0,
      activeLoans: 0,
      totalUsers: 0,
      pendingUsers: 0,
      approvedUsers: 0,
      rejectedUsers: 0
    },
    trends: {
      monthlyGrowth: 0,
      loanGrowth: 0,
      userGrowth: 0
    },
    topPerformers: [],
    recentActivity: []
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Charger les données d'analytics depuis Supabase
      const result = await getAnalyticsData();
      
      if (result.success) {
        setAnalyticsData(result.data);
      } else {
        throw new Error('Erreur lors de la récupération des données');
      }

    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
      showError('Erreur lors du chargement des données');
    } finally {
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
      currency: 'XOF'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-accent-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent-50">
      {/* Header */}
      <div className="bg-white shadow-soft border-b border-accent-200">
        <div className="px-4 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft size={16} />
                <span>Retour</span>
              </Button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-secondary-900 font-montserrat">
                  Analytiques
                </h1>
                <p className="text-neutral-600 font-montserrat">
                  Analysez les performances et les tendances
                </p>
              </div>
            </div>
            
            {/* Indicateur de connexion temps réel */}
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                isConnected 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="font-medium">
                  {isConnected ? 'Temps réel actif' : 'Hors ligne'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-8 py-6">
        {/* Contrôles */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-neutral-400" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-accent-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              <RefreshCw size={16} />
              <span>Actualiser</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetailedStats(!showDetailedStats)}
              className="flex items-center space-x-2"
            >
              {showDetailedStats ? <EyeOff size={16} /> : <Eye size={16} />}
              <span>{showDetailedStats ? 'Masquer détails' : 'Afficher détails'}</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Fonction d'export des données
                showSuccess('Export des données en cours...');
              }}
              className="flex items-center space-x-2"
            >
              <Download size={16} />
              <span>Exporter</span>
            </Button>
          </div>
        </div>

        {/* Vue d'ensemble */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-600 font-montserrat mb-1">Prêts totaux</p>
                <p className="text-lg lg:text-xl font-bold text-secondary-900 font-montserrat truncate">
                  {analyticsData.overview.totalLoans}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  {getGrowthIcon(analyticsData.trends.loanGrowth)}
                  <span className={`text-xs font-medium ${getGrowthColor(analyticsData.trends.loanGrowth)}`}>
                    {analyticsData.trends.loanGrowth}%
                  </span>
                </div>
              </div>
              <div className="p-2 bg-primary-100 rounded-full ml-3 flex-shrink-0 mt-0.5">
                <CreditCard size={16} className="text-primary-600" />
              </div>
            </div>
          </Card>

          <Card className="bg-white">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-600 font-montserrat mb-1">Montant total</p>
                <p className="text-lg lg:text-xl font-bold text-secondary-900 font-montserrat truncate">
                  {formatCurrency(analyticsData.overview.totalAmount)}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  {getGrowthIcon(analyticsData.trends.monthlyGrowth)}
                  <span className={`text-xs font-medium ${getGrowthColor(analyticsData.trends.monthlyGrowth)}`}>
                    {analyticsData.trends.monthlyGrowth}%
                  </span>
                </div>
              </div>
              <div className="p-2 bg-green-100 rounded-full ml-3 flex-shrink-0 mt-0.5">
                <DollarSign size={16} className="text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="bg-white">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-600 font-montserrat mb-1">Utilisateurs</p>
                <p className="text-lg lg:text-xl font-bold text-secondary-900 font-montserrat truncate">
                  {analyticsData.overview.totalUsers}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  {getGrowthIcon(analyticsData.trends.userGrowth)}
                  <span className={`text-xs font-medium ${getGrowthColor(analyticsData.trends.userGrowth)}`}>
                    {analyticsData.trends.userGrowth}%
                  </span>
                </div>
              </div>
              <div className="p-2 bg-blue-100 rounded-full ml-3 flex-shrink-0 mt-0.5">
                <Users size={16} className="text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="bg-white">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-600 font-montserrat mb-1">Prêts actifs</p>
                <p className="text-lg lg:text-xl font-bold text-secondary-900 font-montserrat truncate">
                  {analyticsData.overview.activeLoans}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-xs text-neutral-500">En cours</span>
                </div>
              </div>
              <div className="p-2 bg-orange-100 rounded-full ml-3 flex-shrink-0 mt-0.5">
                <Activity size={16} className="text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Graphiques et analyses détaillées */}
        {showDetailedStats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Top performeurs */}
            <Card className="bg-white">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-secondary-900 font-montserrat mb-4">
                  Top Performeurs
                </h3>
                <div className="space-y-4">
                  {analyticsData.topPerformers.map((performer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-accent-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-secondary-900 font-montserrat">{performer.name}</p>
                          <p className="text-sm text-neutral-600 font-montserrat">
                            {performer.loans} prêts • {formatCurrency(performer.totalAmount)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-secondary-900 font-montserrat">
                          {formatCurrency(performer.avgAmount)}
                        </p>
                        <p className="text-xs text-neutral-600 font-montserrat">Moyenne</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Répartition des utilisateurs */}
            <Card className="bg-white">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-secondary-900 font-montserrat mb-4">
                  Répartition des utilisateurs
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-secondary-900 font-montserrat">Approuvés</span>
                    </div>
                    <span className="text-sm font-bold text-secondary-900 font-montserrat">
                      {analyticsData.overview.approvedUsers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium text-secondary-900 font-montserrat">En attente</span>
                    </div>
                    <span className="text-sm font-bold text-secondary-900 font-montserrat">
                      {analyticsData.overview.pendingUsers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium text-secondary-900 font-montserrat">Rejetés</span>
                    </div>
                    <span className="text-sm font-bold text-secondary-900 font-montserrat">
                      {analyticsData.overview.rejectedUsers}
                    </span>
                  </div>
                </div>
                
                {/* Graphique en anneau simple */}
                <div className="mt-6 flex justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-accent-200"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${(analyticsData.overview.approvedUsers / analyticsData.overview.totalUsers) * 352} 352`}
                        className="text-green-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-lg font-bold text-secondary-900 font-montserrat">
                          {analyticsData.overview.totalUsers}
                        </p>
                        <p className="text-xs text-neutral-600 font-montserrat">Total</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Activité récente */}
        <Card className="bg-white">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-secondary-900 font-montserrat mb-4">
              Activité récente
            </h3>
            <div className="space-y-3">
              {analyticsData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-accent-50 rounded-xl">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-secondary-900 font-montserrat">
                      {getActivityText(activity)}
                    </p>
                    <p className="text-xs text-neutral-600 font-montserrat">
                      {new Date(activity.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics; 