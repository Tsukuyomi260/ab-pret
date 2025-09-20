import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { getAnalyticsData } from '../../utils/supabaseClient';
import { motion } from 'framer-motion';
import Card from '../UI/Card';
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  CreditCard, 
  DollarSign,
  Activity,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const Analytics = () => {
  const navigate = useNavigate();
  const { showError } = useNotifications();
  const [loading, setLoading] = useState(true);
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
      { name: 'Utilisateur A', loans: 8, totalAmount: 2500000 },
      { name: 'Utilisateur B', loans: 6, totalAmount: 1800000 },
      { name: 'Utilisateur C', loans: 5, totalAmount: 1500000 }
    ]
  });

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const result = await getAnalyticsData();
      if (result.success) {
        setAnalyticsData(result.data);
      }
    } catch (error) {
      console.error('[ADMIN] Erreur lors du chargement des analytics:', error.message);
      showError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getGrowthColor = (value) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (value) => {
    return value >= 0 ? <TrendingUp size={12} className="text-green-600" /> : <TrendingUp size={12} className="text-red-600" />;
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0F';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-accent-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-montserrat">
                  Analytics
                </h1>
                <p className="text-sm text-gray-600">Vue d'ensemble des performances</p>
              </div>
            </div>
            <button
              onClick={loadAnalyticsData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>
              </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistiques principales */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
          <Card className="bg-white/90 backdrop-blur-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <CreditCard size={20} className="text-purple-600" />
                </div>
                <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    +{analyticsData.trends.loanGrowth}%
                  </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {formatNumber(analyticsData.overview.totalLoans)}
              </p>
              <p className="text-sm text-gray-600">Prêts accordés</p>
            </div>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <DollarSign size={20} className="text-green-600" />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    +{analyticsData.trends.monthlyGrowth}%
                  </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {formatCurrency(analyticsData.overview.totalAmount)}
              </p>
              <p className="text-sm text-gray-600">Montant total</p>
            </div>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Users size={20} className="text-blue-600" />
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    +{analyticsData.trends.userGrowth}%
                  </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {formatNumber(analyticsData.overview.totalUsers)}
              </p>
              <p className="text-sm text-gray-600">Utilisateurs</p>
            </div>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <Activity size={20} className="text-orange-600" />
                  </div>
                <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                    Actifs
                  </span>
                </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                  {formatNumber(analyticsData.overview.activeLoans)}
                </p>
              <p className="text-sm text-gray-600">Prêts actifs</p>
                </div>
          </Card>
            </motion.div>

        {/* Statuts des utilisateurs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="bg-white/90 backdrop-blur-sm">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {formatNumber(analyticsData.overview.approvedUsers)}
                  </p>
                  <p className="text-sm text-gray-600">Approuvés</p>
              </div>
              </div>
          </div>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm">
                  <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock size={16} className="text-yellow-600" />
                            </div>
                            <div>
                  <p className="text-lg font-bold text-gray-900">
                    {formatNumber(analyticsData.overview.pendingUsers)}
                              </p>
                  <p className="text-sm text-gray-600">En attente</p>
                            </div>
                          </div>
                          </div>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle size={16} className="text-red-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {formatNumber(analyticsData.overview.rejectedUsers)}
                  </p>
                  <p className="text-sm text-gray-600">Rejetés</p>
                          </div>
                        </div>
                      </div>
          </Card>
              </motion.div>

        {/* Top performeurs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
          >
          <Card className="bg-white/90 backdrop-blur-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Top Performeurs</h3>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Voir tout
                </button>
              </div>
              <div className="space-y-4">
                {analyticsData.topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{performer.name}</p>
                        <p className="text-sm text-gray-600">{performer.loans} prêts</p>
                    </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(performer.totalAmount)}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          </motion.div>
      </div>
    </div>
  );
};

export default Analytics; 