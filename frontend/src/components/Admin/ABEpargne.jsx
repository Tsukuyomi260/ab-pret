import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PiggyBank, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Eye,
  Search,
  Filter,
  Download,
  RefreshCw,
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus
} from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { formatCurrency } from '../../utils/helpers';

const ABEpargne = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [savingsPlans, setSavingsPlans] = useState([]);
  const [stats, setStats] = useState({
    totalPlans: 0,
    totalDeposits: 0,
    activePlans: 0,
    completedPlans: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadSavingsData();
  }, []);

  const loadSavingsData = async () => {
    try {
      setLoading(true);
      // TODO: Implémenter l'appel API pour récupérer les données d'épargne
      // Pour l'instant, on utilise des données mockées
      const mockData = [
        {
          id: 1,
          user: {
            first_name: 'Jean',
            last_name: 'Dupont',
            email: 'jean.dupont@email.com'
          },
          target_amount: 100000,
          current_balance: 45000,
          monthly_deposit: 10000,
          completion_percentage: 45,
          status: 'active',
          created_at: '2024-01-15',
          next_deposit_date: '2024-02-15'
        },
        {
          id: 2,
          user: {
            first_name: 'Marie',
            last_name: 'Martin',
            email: 'marie.martin@email.com'
          },
          target_amount: 200000,
          current_balance: 200000,
          monthly_deposit: 20000,
          completion_percentage: 100,
          status: 'completed',
          created_at: '2023-12-01',
          next_deposit_date: null
        },
        {
          id: 3,
          user: {
            first_name: 'Pierre',
            last_name: 'Durand',
            email: 'pierre.durand@email.com'
          },
          target_amount: 150000,
          current_balance: 75000,
          monthly_deposit: 15000,
          completion_percentage: 50,
          status: 'active',
          created_at: '2024-01-20',
          next_deposit_date: '2024-02-20'
        }
      ];

      setSavingsPlans(mockData);
      
      // Calculer les statistiques
      const totalPlans = mockData.length;
      const totalDeposits = mockData.reduce((sum, plan) => sum + plan.current_balance, 0);
      const activePlans = mockData.filter(plan => plan.status === 'active').length;
      const completedPlans = mockData.filter(plan => plan.status === 'completed').length;

      setStats({
        totalPlans,
        totalDeposits,
        activePlans,
        completedPlans
      });

    } catch (error) {
      console.error('[AB_EPARGNE] Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      case 'paused': return <Clock size={16} />;
      case 'cancelled': return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'completed': return 'Terminé';
      case 'paused': return 'En pause';
      case 'cancelled': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  const filteredPlans = savingsPlans.filter(plan => {
    const matchesSearch = 
      plan.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || plan.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/admin')}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <ArrowLeft size={16} />
                <span>Retour</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <PiggyBank size={24} className="text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">AB Epargne</h1>
                  <p className="text-sm text-gray-500">Gestion des comptes d'épargne</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={loadSavingsData}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <RefreshCw size={16} />
                <span>Actualiser</span>
              </Button>
              <Button
                size="sm"
                className="flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Exporter</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Plans Actifs</p>
                  <p className="text-3xl font-bold">{stats.activePlans}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <PiggyBank size={24} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Épargné</p>
                  <p className="text-3xl font-bold">{formatCurrency(stats.totalDeposits)}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <DollarSign size={24} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Plans Terminés</p>
                  <p className="text-3xl font-bold">{stats.completedPlans}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <CheckCircle size={24} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Total Plans</p>
                  <p className="text-3xl font-bold">{stats.totalPlans}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Users size={24} />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Filtres et recherche */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter size={20} className="text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="completed">Terminés</option>
                  <option value="paused">En pause</option>
                  <option value="cancelled">Annulés</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Liste des plans d'épargne */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Plans d'épargne ({filteredPlans.length})
            </h3>
            
            {filteredPlans.length === 0 ? (
              <div className="text-center py-12">
                <PiggyBank size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Aucun plan d'épargne trouvé</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Objectif
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Épargné
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progression
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prochain dépôt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPlans.map((plan) => (
                      <motion.tr
                        key={plan.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {plan.user.first_name} {plan.user.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {plan.user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(plan.target_amount)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatCurrency(plan.monthly_deposit)}/mois
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(plan.current_balance)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${plan.completion_percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">
                              {plan.completion_percentage}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                            {getStatusIcon(plan.status)}
                            <span className="ml-1">{getStatusText(plan.status)}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {plan.next_deposit_date ? (
                            new Date(plan.next_deposit_date).toLocaleDateString('fr-FR')
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center space-x-1"
                          >
                            <Eye size={16} />
                            <span>Voir</span>
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ABEpargne;







