import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Eye, 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle, 
  XCircle,
  DollarSign,
  Calendar,
  FileText,
  User,
  TrendingUp,
  AlertCircle,
  Plus,
  Download,
  MoreHorizontal
} from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';

const LoanRequests = () => {
  const navigate = useNavigate();
  const [loanRequests, setLoanRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'

  // Simuler les données de demandes de prêt
  useEffect(() => {
    setTimeout(() => {
      const mockRequests = [
        {
          id: 1,
          user: {
            firstName: 'Kossi',
            lastName: 'Ablo',
            email: 'kossi.ablo@email.com',
            phone: '+229 90123456',
            studentId: '2023-001',
            avatar: 'KA'
          },
          amount: 75000,
          purpose: 'Achat de matériel informatique pour projet académique',
          description: 'Besoin d\'un ordinateur portable et d\'accessoires pour mon projet de fin d\'études en informatique.',
          status: 'pending',
          requestDate: '2025-01-15',
          documents: ['Carte étudiant', 'Justificatif de revenus', 'Devis matériel'],
          repaymentPlan: '6 mois',
          monthlyPayment: 12500,
          priority: 'high'
        },
        {
          id: 2,
          user: {
            firstName: 'Fatou',
            lastName: 'Diallo',
            email: 'fatou.diallo@email.com',
            phone: '+229 90234567',
            studentId: '2023-002',
            avatar: 'FD'
          },
          amount: 120000,
          purpose: 'Rénovation de boutique de cosmétiques',
          description: 'Je souhaite rénover ma petite boutique de cosmétiques pour améliorer l\'expérience client.',
          status: 'approved',
          requestDate: '2025-01-14',
          documents: ['Carte d\'identité', 'Plan de rénovation', 'Devis travaux'],
          repaymentPlan: '12 mois',
          monthlyPayment: 10000,
          priority: 'medium'
        },
        {
          id: 3,
          user: {
            firstName: 'Moussa',
            lastName: 'Traoré',
            email: 'moussa.traore@email.com',
            phone: '+229 90345678',
            studentId: '2023-003',
            avatar: 'MT'
          },
          amount: 50000,
          purpose: 'Frais de scolarité et fournitures',
          description: 'Besoin d\'aide pour payer mes frais de scolarité et acheter les fournitures nécessaires.',
          status: 'rejected',
          requestDate: '2025-01-13',
          documents: ['Carte étudiant', 'Attestation de scolarité'],
          repaymentPlan: '4 mois',
          monthlyPayment: 12500,
          priority: 'low'
        },
        {
          id: 4,
          user: {
            firstName: 'Aïcha',
            lastName: 'Bello',
            email: 'aicha.bello@email.com',
            phone: '+229 90456789',
            studentId: '2023-004',
            avatar: 'AB'
          },
          amount: 85000,
          purpose: 'Achat de machine à coudre professionnelle',
          description: 'Je veux acheter une machine à coudre professionnelle pour développer mon activité de couture.',
          status: 'pending',
          requestDate: '2025-01-16',
          documents: ['Carte d\'identité', 'Devis machine', 'Plan d\'affaires'],
          repaymentPlan: '8 mois',
          monthlyPayment: 10625,
          priority: 'high'
        }
      ];
      
      setLoanRequests(mockRequests);
      setLoading(false);
    }, 1000);
  }, []);

  const handleApprove = async (requestId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoanRequests(prev => 
        prev.map(request => 
          request.id === requestId 
            ? { ...request, status: 'approved' }
            : request
        )
      );
      alert('Demande approuvée avec succès !');
    } catch (error) {
      alert('Erreur lors de l\'approbation de la demande');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoanRequests(prev => 
        prev.map(request => 
          request.id === requestId 
            ? { ...request, status: 'rejected' }
            : request
        )
      );
      alert('Demande rejetée avec succès !');
    } catch (error) {
      alert('Erreur lors du rejet de la demande');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'approved':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} />;
      case 'approved':
        return <CheckCircle size={16} />;
      case 'rejected':
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'approved':
        return 'Approuvé';
      case 'rejected':
        return 'Rejeté';
      default:
        return 'Inconnu';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high':
        return 'Urgent';
      case 'medium':
        return 'Normal';
      case 'low':
        return 'Faible';
      default:
        return 'Inconnu';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  const filteredRequests = loanRequests.filter(request => {
    const matchesSearch = 
      request.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = loanRequests.filter(r => r.status === 'pending').length;
  const approvedCount = loanRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = loanRequests.filter(r => r.status === 'rejected').length;
  const totalAmount = loanRequests.reduce((sum, r) => sum + r.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-50 to-accent-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-neutral-600 font-montserrat">Chargement des demandes...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-50 to-accent-100">
      {/* Header moderne */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm shadow-soft border-b border-white/50"
      >
        <div className="px-4 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl lg:text-3xl xl:text-4xl font-bold text-secondary-900 font-montserrat mb-2"
                >
                  Demandes de prêt
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-base lg:text-lg text-neutral-600 font-montserrat"
                >
                  Gérez et validez les demandes de prêt des clients
                </motion.p>
              </div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center justify-center space-x-2 px-3 py-2"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Exporter</span>
                </Button>
                <Button
                  size="sm"
                  className="bg-primary-600 hover:bg-primary-700 flex items-center justify-center space-x-2 px-3 py-2"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Nouvelle demande</span>
                  <span className="sm:hidden">Nouvelle</span>
                </Button>
              </motion.div>
            </div>

            {/* Statistiques avec design moderne */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-soft hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <Clock size={20} className="text-yellow-600" />
                  </div>
                  <TrendingUp size={16} className="text-yellow-500" />
                </div>
                <p className="text-sm text-neutral-600 font-montserrat mb-1">En attente</p>
                <p className="text-2xl font-bold text-secondary-900 font-montserrat">{pendingCount}</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-soft hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                  <TrendingUp size={16} className="text-green-500" />
                </div>
                <p className="text-sm text-neutral-600 font-montserrat mb-1">Approuvées</p>
                <p className="text-2xl font-bold text-secondary-900 font-montserrat">{approvedCount}</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-soft hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <XCircle size={20} className="text-red-600" />
                  </div>
                  <AlertCircle size={16} className="text-red-500" />
                </div>
                <p className="text-sm text-neutral-600 font-montserrat mb-1">Rejetées</p>
                <p className="text-2xl font-bold text-secondary-900 font-montserrat">{rejectedCount}</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-soft hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-primary-100 rounded-xl">
                    <DollarSign size={20} className="text-primary-600" />
                  </div>
                  <TrendingUp size={16} className="text-primary-500" />
                </div>
                <p className="text-sm text-neutral-600 font-montserrat mb-1">Montant total</p>
                <p className="text-2xl font-bold text-secondary-900 font-montserrat">{formatCurrency(totalAmount)}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="px-4 lg:px-8 py-4 lg:py-6">
        <div className="max-w-7xl mx-auto">
          {/* Filtres et recherche modernes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-6 mb-6 border border-white/50"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
              <div className="flex-1">
                <div className="relative">
                  <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, email ou objet..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-white/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter size={20} className="text-neutral-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="approved">Approuvées</option>
                    <option value="rejected">Rejetées</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm rounded-xl p-1 border border-white/50">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'grid' 
                        ? 'bg-primary-100 text-primary-600' 
                        : 'text-neutral-400 hover:text-neutral-600'
                    }`}
                  >
                    <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                      <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                      <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                      <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                      <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                    </div>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'list' 
                        ? 'bg-primary-100 text-primary-600' 
                        : 'text-neutral-400 hover:text-neutral-600'
                    }`}
                  >
                    <div className="w-4 h-4 space-y-0.5">
                      <div className="w-full h-1 bg-current rounded-sm"></div>
                      <div className="w-full h-1 bg-current rounded-sm"></div>
                      <div className="w-full h-1 bg-current rounded-sm"></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Liste des demandes avec design moderne */}
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-soft hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-6">
                      {/* En-tête avec avatar et statut */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {request.user.avatar}
                          </div>
                          <div>
                            <p className="font-semibold text-secondary-900 font-montserrat">
                              {request.user.firstName} {request.user.lastName}
                            </p>
                            <p className="text-sm text-neutral-500 font-montserrat">
                              {request.user.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 border ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            <span>{getStatusText(request.status)}</span>
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(request.priority)}`}>
                            {getPriorityText(request.priority)}
                          </span>
                        </div>
                      </div>

                      {/* Montant et objet */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-neutral-600 font-montserrat">Montant</span>
                          <span className="text-lg font-bold text-secondary-900 font-montserrat">
                            {formatCurrency(request.amount)}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 font-montserrat line-clamp-2">
                          {request.purpose}
                        </p>
                      </div>

                      {/* Détails */}
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-neutral-500 font-montserrat">Date</span>
                          <p className="font-medium text-secondary-900 font-montserrat">
                            {new Date(request.requestDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div>
                          <span className="text-neutral-500 font-montserrat">Remboursement</span>
                          <p className="font-medium text-secondary-900 font-montserrat">
                            {request.repaymentPlan}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/50">
                        <div className="flex items-center space-x-2 text-xs text-neutral-500 font-montserrat">
                          <FileText size={12} />
                          <span>{request.documents.length} documents</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowDetails(true);
                            }}
                            className="p-2"
                          >
                            <Eye size={14} />
                          </Button>
                          
                          {request.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 p-2"
                                onClick={() => handleApprove(request.id)}
                              >
                                <UserCheck size={14} />
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                className="p-2"
                                onClick={() => handleReject(request.id)}
                              >
                                <UserX size={14} />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {filteredRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-soft hover:shadow-lg transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {request.user.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <p className="font-semibold text-secondary-900 font-montserrat">
                                {request.user.firstName} {request.user.lastName}
                              </p>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 border ${getStatusColor(request.status)}`}>
                                {getStatusIcon(request.status)}
                                <span>{getStatusText(request.status)}</span>
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(request.priority)}`}>
                                {getPriorityText(request.priority)}
                              </span>
                            </div>
                            <p className="text-sm text-neutral-600 font-montserrat mb-2">
                              {request.purpose}
                            </p>
                            <div className="flex items-center space-x-6 text-sm">
                              <span className="text-neutral-500 font-montserrat">
                                <DollarSign size={14} className="inline mr-1" />
                                {formatCurrency(request.amount)}
                              </span>
                              <span className="text-neutral-500 font-montserrat">
                                <Calendar size={14} className="inline mr-1" />
                                {new Date(request.requestDate).toLocaleDateString('fr-FR')}
                              </span>
                              <span className="text-neutral-500 font-montserrat">
                                <FileText size={14} className="inline mr-1" />
                                {request.documents.length} documents
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowDetails(true);
                            }}
                          >
                            <Eye size={16} />
                          </Button>
                          
                          {request.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApprove(request.id)}
                              >
                                <UserCheck size={16} />
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleReject(request.id)}
                              >
                                <UserX size={16} />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          
          {filteredRequests.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText size={32} className="text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 font-montserrat mb-2">
                Aucune demande trouvée
              </h3>
              <p className="text-neutral-500 font-montserrat">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Aucune demande ne correspond à vos critères'
                  : 'Aucune demande de prêt pour le moment'
                }
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Modal de détails modernisé */}
      <AnimatePresence>
        {showDetails && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/50"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {selectedRequest.user.avatar}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-secondary-900 font-montserrat">
                        Détails de la demande
                      </h2>
                      <p className="text-neutral-600 font-montserrat">
                        {selectedRequest.user.firstName} {selectedRequest.user.lastName}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDetails(false)}
                    className="p-2"
                  >
                    <XCircle size={20} />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Informations client */}
                  <div className="space-y-6">
                    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
                      <h3 className="font-semibold text-secondary-900 font-montserrat mb-4 flex items-center space-x-2">
                        <User size={20} className="text-primary-600" />
                        <span>Informations client</span>
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-600 font-montserrat">Nom complet:</span>
                          <span className="font-medium text-secondary-900 font-montserrat">
                            {selectedRequest.user.firstName} {selectedRequest.user.lastName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600 font-montserrat">Email:</span>
                          <span className="font-medium text-secondary-900 font-montserrat">{selectedRequest.user.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600 font-montserrat">Téléphone:</span>
                          <span className="font-medium text-secondary-900 font-montserrat">{selectedRequest.user.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600 font-montserrat">ID Étudiant:</span>
                          <span className="font-medium text-secondary-900 font-montserrat">{selectedRequest.user.studentId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
                      <h3 className="font-semibold text-secondary-900 font-montserrat mb-4 flex items-center space-x-2">
                        <DollarSign size={20} className="text-primary-600" />
                        <span>Détails du prêt</span>
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-600 font-montserrat">Montant demandé:</span>
                          <span className="font-medium text-secondary-900 font-montserrat">{formatCurrency(selectedRequest.amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600 font-montserrat">Plan de remboursement:</span>
                          <span className="font-medium text-secondary-900 font-montserrat">{selectedRequest.repaymentPlan}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600 font-montserrat">Mensualité:</span>
                          <span className="font-medium text-secondary-900 font-montserrat">{formatCurrency(selectedRequest.monthlyPayment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600 font-montserrat">Objet:</span>
                          <span className="font-medium text-secondary-900 font-montserrat">{selectedRequest.purpose}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description et documents */}
                  <div className="space-y-6">
                    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
                      <h3 className="font-semibold text-secondary-900 font-montserrat mb-4 flex items-center space-x-2">
                        <FileText size={20} className="text-primary-600" />
                        <span>Description détaillée</span>
                      </h3>
                      <p className="text-sm text-neutral-600 font-montserrat leading-relaxed">
                        {selectedRequest.description}
                      </p>
                    </div>

                    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
                      <h3 className="font-semibold text-secondary-900 font-montserrat mb-4 flex items-center space-x-2">
                        <FileText size={20} className="text-primary-600" />
                        <span>Documents fournis</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedRequest.documents.map((doc, index) => (
                          <span key={index} className="px-3 py-2 bg-primary-100 text-primary-700 rounded-full text-xs font-medium border border-primary-200">
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                {selectedRequest.status === 'pending' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex space-x-4 pt-6 border-t border-white/50 mt-8"
                  >
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 h-12"
                      onClick={() => {
                        handleApprove(selectedRequest.id);
                        setShowDetails(false);
                      }}
                    >
                      <UserCheck size={18} className="mr-2" />
                      Approuver la demande
                    </Button>
                    <Button
                      variant="danger"
                      className="flex-1 h-12"
                      onClick={() => {
                        handleReject(selectedRequest.id);
                        setShowDetails(false);
                      }}
                    >
                      <UserX size={18} className="mr-2" />
                      Rejeter la demande
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoanRequests; 