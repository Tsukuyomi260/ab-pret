import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { motion } from 'framer-motion';
import Card from '../UI/Card';
import Button from '../UI/Button';
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
  Eye
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [stats, setStats] = useState({
    totalLoaned: 0,
    totalRepaid: 0,
    amountToRepay: 0,
    activeLoans: 0,
    creditScore: 750,
    nextPayment: 0,
    daysUntilNextPayment: 0
  });

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

      // Exemple d'ajout de notification (à supprimer en production)
      setTimeout(() => {
        addNotification({
          type: 'success',
          title: 'Bienvenue !',
          message: 'Votre tableau de bord a été mis à jour avec les dernières informations.',
          time: 'À l\'instant'
        });
      }, 2000);
    }, 1000);
  }, [addNotification]);

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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50">
      {/* Header avec gradient et animations */}
      <motion.div 
        className="relative overflow-hidden"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10" />
        <div className="relative px-4 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {/* En-tête principal */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div className="mb-6 lg:mb-0">
                <motion.h1 
                  className="text-3xl lg:text-4xl font-bold text-secondary-900 font-montserrat mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Bonjour, AVOCE Elodie ! 👋
                </motion.h1>
                <motion.p 
                  className="text-lg text-secondary-600 font-montserrat"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Voici votre tableau de bord financier
                </motion.p>
              </div>
              
              <motion.div 
                className="flex space-x-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button 
                  onClick={() => navigate('/loan-request')}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Plus size={20} className="mr-2" />
                  Nouveau prêt
                </Button>
              </motion.div>
            </div>

            {/* Score de crédit et métriques principales */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Score de crédit */}
              <motion.div 
                className="lg:col-span-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-gradient-to-br from-secondary-900 to-secondary-800 text-white p-6 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-secondary-300 font-montserrat text-sm">Score de crédit</p>
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
                    <div className="p-3 bg-white/10 rounded-full">
                      <Award className="w-8 h-8 text-yellow-400" />
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
                      <p className="text-orange-100 font-montserrat text-sm mb-1">Prochain paiement</p>
                      <p className="text-3xl font-bold mb-2">{formatCurrency(stats.nextPayment)}</p>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                          Dans {stats.daysUntilNextPayment} jour{stats.daysUntilNextPayment > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="p-3 bg-white/10 rounded-full mb-2">
                        <Bell className="w-8 h-8" />
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => navigate('/repayment')}
                        className="bg-white text-orange-600 hover:bg-orange-50"
                      >
                        Payer maintenant
                      </Button>
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
                          <p className="text-xs lg:text-sm text-gray-600 font-montserrat truncate">Reste à payer</p>
                          <p className="text-sm lg:text-base font-semibold text-gray-900 font-montserrat truncate">
                            {formatCurrency(loan.remainingAmount)}
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
      </motion.div>
    </div>
  );
};

export default ClientDashboard;