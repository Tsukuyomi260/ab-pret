import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import Card from '../UI/Card';
import Button from '../UI/Button';
import { 
  Search, 
  Filter, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  BarChart3,
  DollarSign,
  Eye,
  FileText,
  BookOpen
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';

const LoanHistory = () => {

  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    totalLoans: 0,
    totalBorrowed: 0,
    totalRepaid: 0,
    activeLoans: 0,
    completedLoans: 0,
    pendingLoans: 0,
    rejectedLoans: 0
  });

  useEffect(() => {
    // Simulation des données (à remplacer par des appels API)
    setTimeout(() => {
      const mockLoans = [
        {
          id: 1,
          amount: 75000,
          status: 'active',
          requestDate: '2025-07-01',
          dueDate: '2025-08-01',
          totalAmount: 82500,
          paidAmount: 0,
          purpose: 'Achat d\'ordinateur portable',
          category: 'education'
        },
        {
          id: 2,
          amount: 50000,
          status: 'completed',
          requestDate: '2025-06-01',
          dueDate: '2025-06-30',
          totalAmount: 55000,
          paidAmount: 55000,
          purpose: 'Frais de scolarité',
          category: 'education'
        },
        {
          id: 3,
          amount: 100000,
          status: 'pending',
          requestDate: '2025-08-15',
          dueDate: null,
          totalAmount: null,
          paidAmount: 0,
          purpose: 'Démarrage d\'activité commerciale',
          category: 'business'
        },
        {
          id: 4,
          amount: 150000,
          status: 'rejected',
          requestDate: '2025-07-20',
          dueDate: null,
          totalAmount: null,
          paidAmount: 0,
          purpose: 'Achat de véhicule',
          category: 'transport'
        },
        {
          id: 5,
          amount: 80000,
          status: 'completed',
          requestDate: '2025-05-01',
          dueDate: '2025-06-30',
          totalAmount: 88000,
          paidAmount: 88000,
          purpose: 'Soins médicaux',
          category: 'health'
        }
      ];
      
      setLoans(mockLoans);
      
      // Calculer les statistiques
      const totalBorrowed = mockLoans.reduce((sum, loan) => sum + loan.amount, 0);
      const totalRepaid = mockLoans.reduce((sum, loan) => sum + (loan.paidAmount || 0), 0);
      const activeLoans = mockLoans.filter(loan => loan.status === 'active').length;
      const completedLoans = mockLoans.filter(loan => loan.status === 'completed').length;
      const pendingLoans = mockLoans.filter(loan => loan.status === 'pending').length;
      const rejectedLoans = mockLoans.filter(loan => loan.status === 'rejected').length;
      
      setStats({
        totalLoans: mockLoans.length,
        totalBorrowed,
        totalRepaid,
        activeLoans,
        completedLoans,
        pendingLoans,
        rejectedLoans
      });
      
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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
      case 'education': return <BookOpen size={16} />;
      case 'business': return <TrendingUp size={16} />;
      case 'health': return <AlertCircle size={16} />;
      case 'transport': return <TrendingDown size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'education': return 'text-blue-600 bg-blue-100';
      case 'business': return 'text-green-600 bg-green-100';
      case 'health': return 'text-pink-600 bg-pink-100';
      case 'transport': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryText = (category) => {
    switch (category) {
      case 'education': return 'Éducation';
      case 'business': return 'Entreprise';
      case 'health': return 'Santé';
      case 'transport': return 'Transport';
      default: return 'Autre';
    }
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.id.toString().includes(searchTerm) || 
                         formatCurrency(loan.amount).includes(searchTerm) ||
                         (loan.purpose && loan.purpose.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportHistory = () => {
    // Simulation d'export
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Montant,Statut,Date de demande,Échéance,Montant total,Statut remboursement\n" +
      filteredLoans.map(loan => 
        `${loan.id},${loan.amount},${getStatusText(loan.status)},${formatDate(loan.requestDate)},${loan.dueDate ? formatDate(loan.dueDate) : 'N/A'},${loan.totalAmount || 'N/A'},${loan.paidAmount >= (loan.totalAmount || 0) ? 'Remboursé' : 'En cours'}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "historique_prets.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50">
      {/* Header avec statistiques */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-secondary-900 font-montserrat mb-4">
              Historique des prêts
            </h1>
            <p className="text-xl lg:text-2xl text-secondary-600 font-montserrat leading-relaxed">
              Consultez tous vos prêts et leur statut en temps réel
            </p>
          </motion.div>

          {/* Statistiques */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-8"
          >
            <Card className="bg-white/80 backdrop-blur-sm border-white/20">
              <div className="p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <BarChart3 size={20} className="text-primary-600" />
                </div>
                <p className="text-lg sm:text-xl font-bold text-secondary-900">{stats.totalLoans}</p>
                <p className="text-xs sm:text-sm text-secondary-600">Total prêts</p>
              </div>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-white/20">
              <div className="p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp size={20} className="text-green-600" />
                </div>
                <p className="text-lg sm:text-xl font-bold text-secondary-900 break-words leading-tight">{formatCurrency(stats.totalBorrowed)}</p>
                <p className="text-xs sm:text-sm text-secondary-600">Total emprunté</p>
              </div>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-white/20">
              <div className="p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle size={20} className="text-blue-600" />
                </div>
                <p className="text-lg sm:text-xl font-bold text-secondary-900 break-words leading-tight">{formatCurrency(stats.totalRepaid)}</p>
                <p className="text-xs sm:text-sm text-secondary-600">Total remboursé</p>
              </div>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-white/20">
              <div className="p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock size={20} className="text-orange-600" />
                </div>
                <p className="text-lg sm:text-xl font-bold text-secondary-900">{stats.activeLoans}</p>
                <p className="text-xs sm:text-sm text-secondary-600">Prêts actifs</p>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Contenu principal centré */}
      <div className="max-w-6xl mx-auto px-4 pb-8">

        {/* Filtres modernes */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-white/90 backdrop-blur-sm border-white/20">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par ID, montant ou objet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter size={20} className="text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="completed">Remboursés</option>
                  <option value="pending">En attente</option>
                  <option value="rejected">Rejetés</option>
                </select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Liste des prêts modernisée */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm border-white/20">
            {filteredLoans.length > 0 ? (
              <div className="space-y-6">
                <AnimatePresence>
                  {filteredLoans.map((loan, index) => (
                    <motion.div 
                      key={loan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 bg-white/60 backdrop-blur-sm"
                    >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="flex-1">
                                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 font-montserrat">
                          Prêt #{loan.id}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                          {getStatusText(loan.status)}
                        </span>
                        {loan.category && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getCategoryColor(loan.category)}`}>
                            {getCategoryIcon(loan.category)}
                            <span className="hidden sm:inline">{getCategoryText(loan.category)}</span>
                          </span>
                        )}
                      </div>

                      {loan.purpose && (
                        <div className="mb-4 p-3 bg-gray-50/80 rounded-xl">
                          <span className="text-gray-600 text-xs uppercase tracking-wide">Objet du prêt</span>
                          <p className="font-medium text-gray-900">{loan.purpose}</p>
                        </div>
                      )}
                      
                                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 text-sm">
                          <div className="p-3 bg-accent-50/50 rounded-xl">
                            <span className="text-gray-600 text-xs uppercase tracking-wide">Montant demandé</span>
                            <p className="font-semibold text-base sm:text-lg text-gray-900 break-words leading-tight">{formatCurrency(loan.amount)}</p>
                          </div>
                          <div className="p-3 bg-accent-50/50 rounded-xl">
                            <span className="text-gray-600 text-xs uppercase tracking-wide">Date de demande</span>
                            <p className="font-semibold text-base sm:text-lg text-gray-900">{formatDate(loan.requestDate)}</p>
                          </div>
                          {loan.dueDate && (
                            <div className="p-3 bg-accent-50/50 rounded-xl">
                              <span className="text-gray-600 text-xs uppercase tracking-wide">Échéance</span>
                              <p className="font-semibold text-base sm:text-lg text-gray-900">{formatDate(loan.dueDate)}</p>
                            </div>
                          )}
                        </div>

                      {loan.status === 'active' && (
                        <div className="mt-6 p-6 bg-blue-50/80 rounded-2xl border border-blue-200/50">
                          <h4 className="font-semibold text-blue-900 mb-4 flex items-center space-x-2">
                            <DollarSign size={18} className="sm:w-5 sm:h-5" />
                            <span className="text-sm sm:text-base">Détails du prêt</span>
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 text-sm">
                            <div>
                              <span className="text-blue-700 text-xs uppercase tracking-wide">Montant total</span>
                              <p className="font-semibold text-base sm:text-lg text-blue-900 break-words leading-tight">{formatCurrency(loan.totalAmount)}</p>
                            </div>
                            <div>
                              <span className="text-blue-700 text-xs uppercase tracking-wide">Montant remboursé</span>
                              <p className="font-semibold text-base sm:text-lg text-blue-900 break-words leading-tight">{formatCurrency(loan.paidAmount)}</p>
                            </div>
                            <div>
                              <span className="text-blue-700 text-xs uppercase tracking-wide">Statut</span>
                              <p className="font-semibold text-base sm:text-lg text-blue-900 break-words leading-tight">
                                {loan.paidAmount >= loan.totalAmount ? 'Remboursé' : 'En cours'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {loan.status === 'completed' && (
                        <div className="mt-6 p-6 bg-green-50/80 rounded-2xl border border-green-200/50">
                                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="text-green-800 font-semibold text-base sm:text-lg flex items-center space-x-2">
                            <CheckCircle size={18} className="sm:w-5 sm:h-5" />
                            <span>Prêt entièrement remboursé</span>
                          </span>
                          <span className="text-green-600 font-bold text-base sm:text-lg break-words leading-tight">{formatCurrency(loan.paidAmount)}</span>
                        </div>
                        </div>
                      )}

                      {loan.status === 'pending' && (
                        <div className="mt-6 p-6 bg-yellow-50/80 rounded-2xl border border-yellow-200/50">
                                                  <div className="flex items-center">
                          <span className="text-yellow-800 font-semibold text-base sm:text-lg flex items-center space-x-2">
                            <Clock size={18} className="sm:w-5 sm:h-5" />
                            <span>En attente d'approbation</span>
                          </span>
                        </div>
                        </div>
                      )}

                      {loan.status === 'rejected' && (
                        <div className="mt-6 p-6 bg-red-50/80 rounded-2xl border border-red-200/50">
                                                  <div className="flex items-center">
                          <span className="text-red-800 font-semibold text-base sm:text-lg flex items-center space-x-2">
                            <XCircle size={18} className="sm:w-5 sm:h-5" />
                            <span>Demande rejetée</span>
                          </span>
                        </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/loan-details/${loan.id}`)}
                        className="px-6 py-3 rounded-2xl font-medium flex items-center space-x-2"
                      >
                        <Eye size={16} />
                        <span>Voir détails</span>
                      </Button>
                      
                      {loan.status === 'active' && (
                        <Button
                          size="sm"
                          onClick={() => navigate('/repayment', { state: { loanId: loan.id } })}
                          className="px-6 py-3 rounded-2xl font-medium bg-primary-500 hover:bg-primary-600 flex items-center space-x-2"
                        >
                          <DollarSign size={16} />
                          <span>Rembourser</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
                </AnimatePresence>
              </div>
                      ) : (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-6">
                  <Search size={80} className="mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 font-montserrat">Aucun prêt trouvé</h3>
                <p className="text-gray-500 mb-6 text-lg">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Aucun prêt ne correspond à vos critères de recherche'
                    : 'Vous n\'avez pas encore de prêts'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Button 
                    onClick={() => navigate('/loan-request')}
                    className="px-8 py-4 text-lg rounded-2xl bg-primary-500 hover:bg-primary-600"
                  >
                    Faire une demande
                  </Button>
                )}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Bouton d'export flottant */}
        <div className="fixed bottom-24 right-6 z-10">
          <Button
            variant="outline"
            onClick={exportHistory}
            className="flex items-center space-x-2 px-4 py-3 rounded-full bg-white/90 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl"
          >
            <Download size={20} />
            <span className="hidden sm:inline">Exporter</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoanHistory;

