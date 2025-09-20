import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getLoans, updateLoanStatus, getPayments } from '../../utils/supabaseAPI';
import { useNotifications } from '../../context/NotificationContext';
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
  ArrowLeft,
  RefreshCw,
  FileText,
  User,
  X,
  Phone,
  MapPin,
  GraduationCap,
  Building,
  CreditCard,
  Smartphone,
  Activity,
  Shield,
  AlertTriangle,
  FileImage,
  Mail,
  Home,
  Users,
  Heart
} from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';

const LoanRequests = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();
  const [loanRequests, setLoanRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      
      // Charger les prêts et les paiements en parallèle
      const [loansResult, paymentsResult] = await Promise.all([
        getLoans(),
        getPayments()
      ]);
      
      if (loansResult.success && paymentsResult.success) {
        const loans = loansResult.data || [];
        const payments = paymentsResult.data || [];
        
        // Transformer les données pour correspondre au format attendu
        const formattedRequests = loans.map(loan => {
          // Calculer le montant payé pour ce prêt
          const loanPayments = payments.filter(payment => payment.loan_id === loan.id);
          const paidAmount = loanPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
          
          // Calculer le montant total avec intérêts
          const totalAmount = loan.amount ? loan.amount * (1 + (loan.interest_rate || 0) / 100) : 0;
          const remainingAmount = totalAmount - paidAmount;
          
          // Calculer la date d'échéance
          const loanDate = new Date(loan.created_at || new Date());
          const durationDays = loan.duration_months || 30; // duration_months contient en fait le nombre de jours
          const dueDate = new Date(loanDate.getTime() + (durationDays * 24 * 60 * 60 * 1000));
          
          return {
            id: loan.id,
            user: {
              firstName: loan.users?.first_name || 'Utilisateur',
              lastName: loan.users?.last_name || 'Inconnu',
              email: loan.users?.email || 'email@inconnu.com',
              phone: loan.users?.phone_number || 'Non spécifié',
              filiere: loan.users?.filiere || 'Non spécifiée',
              anneeEtude: loan.users?.annee_etude || 'Non spécifiée',
              entite: loan.users?.entite || 'Non spécifiée',
              address: loan.users?.address || 'Non spécifiée',
              facebookName: loan.users?.facebook_name || 'Non spécifié',
              // Informations du témoin
              temoinName: loan.users?.temoin_name || 'Non spécifié',
              temoinQuartier: loan.users?.temoin_quartier || 'Non spécifié',
              temoinPhone: loan.users?.temoin_phone || 'Non spécifié',
              temoinEmail: loan.users?.temoin_email || 'Non spécifié',
              // Informations d'urgence
              emergencyName: loan.users?.emergency_name || 'Non spécifié',
              emergencyRelation: loan.users?.emergency_relation || 'Non spécifié',
              emergencyPhone: loan.users?.emergency_phone || 'Non spécifié',
              emergencyEmail: loan.users?.emergency_email || 'Non spécifié',
              emergencyAddress: loan.users?.emergency_address || 'Non spécifié',
              // Documents
              userIdentityCard: loan.users?.user_identity_card_name || 'Non spécifié',
              temoinIdentityCard: loan.users?.temoin_identity_card_name || 'Non spécifié',
              studentCard: loan.users?.student_card_name || 'Non spécifié'
            },
            amount: loan.amount || 0,
            totalAmount: Math.round(totalAmount),
            paidAmount: Math.round(paidAmount),
            remainingAmount: Math.round(remainingAmount),
            duration: loan.duration_months || 0,
            purpose: loan.purpose || 'Non spécifié',
            status: loan.status || 'pending',
            requestDate: loan.created_at || new Date().toISOString(),
            dueDate: dueDate.toISOString(), // Date d'échéance ajoutée
            priority: loan.priority || 'medium',
            dailyPenaltyRate: loan.daily_penalty_rate || 2.0,
            // Informations Momo (à récupérer depuis la base de données si disponibles)
            momoNumber: loan.momo_number || 'Non spécifié',
            momoNetwork: loan.momo_network || 'Non spécifié',
            momoName: loan.momo_name || 'Non spécifié'
          };
        });
        
        setLoanRequests(formattedRequests);
      } else {
        console.error('[ADMIN] Erreur lors du chargement des demandes:', {
          loans: loansResult.error,
          payments: paymentsResult.error
        });
        showError('Erreur lors du chargement des demandes');
      }
    } catch (error) {
      console.error('[ADMIN] Erreur lors du chargement des demandes:', error.message);
      showError('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      const result = await updateLoanStatus(requestId, 'approved');
      
      if (result.success) {
      setLoanRequests(prev => 
          prev.map(req => 
            req.id === requestId ? { ...req, status: 'approved' } : req
          )
        );
        showSuccess('Demande approuvée avec succès');
      } else {
        showError('Erreur lors de l\'approbation');
      }
    } catch (error) {
      console.error('[ADMIN] Erreur lors de l\'approbation:', error.message);
      showError('Erreur lors de l\'approbation');
    }
  };

  const handleReject = async (requestId) => {
    try {
      const result = await updateLoanStatus(requestId, 'rejected');
      
      if (result.success) {
      setLoanRequests(prev => 
          prev.map(req => 
            req.id === requestId ? { ...req, status: 'rejected' } : req
          )
        );
        showSuccess('Demande rejetée avec succès');
      } else {
        showError('Erreur lors du rejet');
      }
    } catch (error) {
      console.error('[ADMIN] Erreur lors du rejet:', error.message);
      showError('Erreur lors du rejet');
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedRequest(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-blue-600 bg-blue-100';
      case 'active': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-purple-600 bg-purple-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'approved': return <CheckCircle size={16} />;
      case 'active': return <Activity size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'active': return 'En cours';
      case 'completed': return 'Remboursé';
      case 'rejected': return 'Rejeté';
      default: return 'Inconnu';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredRequests = loanRequests.filter(request => {
    const matchesSearch = request.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
                  Demandes de Prêt
                </h1>
                <p className="text-sm text-gray-600">
                  {filteredRequests.length} demande{filteredRequests.length > 1 ? 's' : ''} trouvée{filteredRequests.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={loadRequests}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Card className="bg-white/90 backdrop-blur-sm mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email ou objet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvés</option>
                <option value="active">Prêts en cours</option>
                <option value="completed">Remboursés</option>
                <option value="rejected">Rejetés</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Liste des demandes */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/50 shadow-soft hover:shadow-lg transition-all duration-300"
                  >
                    <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                        <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User size={20} className="text-primary-600" />
                          </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                              {request.user.firstName} {request.user.lastName}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">{request.user.email}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center justify-center space-x-1 w-fit ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            <span>{getStatusText(request.status)}</span>
                          </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Montant demandé</p>
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">{formatCurrency(request.amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Objet</p>
                        <p className="font-medium text-gray-900 text-sm sm:text-base break-words">{request.purpose}</p>
                      </div>
                      <div className="sm:col-span-2 lg:col-span-1">
                        <p className="text-sm text-gray-600">Date de demande</p>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">
                          {new Date(request.requestDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      
                      {/* Informations supplémentaires pour les prêts en cours */}
                      {request.status === 'active' && (
                        <>
                          <div>
                            <p className="text-sm text-gray-600">Montant total (avec intérêts)</p>
                            <p className="font-semibold text-blue-900 text-sm sm:text-base">{formatCurrency(request.totalAmount)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Montant remboursé</p>
                            <p className="font-semibold text-green-600 text-sm sm:text-base">{formatCurrency(request.paidAmount)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Montant restant</p>
                            <p className="font-semibold text-orange-600 text-sm sm:text-base">{formatCurrency(request.remainingAmount)}</p>
                          </div>
                        </>
                      )}
                      
                      {/* Informations pour les prêts remboursés */}
                      {request.status === 'completed' && (
                        <>
                          <div>
                            <p className="text-sm text-gray-600">Montant total (avec intérêts)</p>
                            <p className="font-semibold text-blue-900 text-sm sm:text-base">{formatCurrency(request.totalAmount)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Montant remboursé</p>
                            <p className="font-semibold text-green-600 text-sm sm:text-base">{formatCurrency(request.paidAmount)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Statut</p>
                            <p className="font-semibold text-purple-600 text-sm sm:text-base">Entièrement remboursé</p>
                          </div>
                        </>
                      )}
                      
                      <div className="sm:col-span-2 lg:col-span-1">
                        <p className="text-sm text-gray-600">Pénalité de retard</p>
                        <p className="font-medium text-red-600 text-sm sm:text-base">
                          {request.dailyPenaltyRate}% par jour
                        </p>
                      </div>
                    </div>
                    </div>
                  </div>
                  
                {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-4 border-t border-gray-100">
                    <Button
                      onClick={() => handleViewDetails(request)}
                      variant="outline"
                      className="flex items-center justify-center space-x-2 text-sm"
                    >
                      <Eye size={16} />
                      <span>Voir détails</span>
                    </Button>
                    
                    {request.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleApprove(request.id)}
                          className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-sm"
                        >
                          <UserCheck size={16} />
                          <span>Approuver</span>
                        </Button>
                        <Button
                          onClick={() => handleReject(request.id)}
                          variant="outline"
                          className="flex items-center justify-center space-x-2 border-red-200 text-red-600 hover:bg-red-50 text-sm"
                        >
                          <UserX size={16} />
                          <span>Rejeter</span>
                        </Button>
                      </>
                    )}
                  </div>
                    </div>
                  </motion.div>
          ))}

          {filteredRequests.length === 0 && !loading && (
            <Card className="bg-white/90 backdrop-blur-sm">
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText size={24} className="text-gray-400" />
              </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune demande trouvée</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Aucune demande ne correspond à vos critères'
                    : 'Aucune demande de prêt pour le moment'
                  }
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de détails */}
      <AnimatePresence>
        {showDetailsModal && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={closeDetailsModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header du modal - Style Apple */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold font-montserrat">
                      Profil Client
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">
                      {selectedRequest.user.firstName} {selectedRequest.user.lastName}
                    </p>
                  </div>
                  <button
                    onClick={closeDetailsModal}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Contenu du modal - Scrollable */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="p-6 space-y-6">
                   
                  {/* Informations personnelles */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 font-montserrat mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Informations Personnelles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-blue-700 font-medium">Nom complet</p>
                          <p className="text-blue-900 font-semibold text-lg">
                            {selectedRequest.user.firstName} {selectedRequest.user.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700 font-medium flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            Email
                          </p>
                          <p className="text-blue-900">{selectedRequest.user.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700 font-medium flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            Téléphone
                          </p>
                          <p className="text-blue-900">{selectedRequest.user.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700 font-medium flex items-center">
                            <Home className="w-4 h-4 mr-1" />
                            Adresse
                          </p>
                          <p className="text-blue-900">{selectedRequest.user.address}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-blue-700 font-medium flex items-center">
                            <GraduationCap className="w-4 h-4 mr-1" />
                            Filière
                          </p>
                          <p className="text-blue-900">{selectedRequest.user.filiere}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700 font-medium">Année d'étude</p>
                          <p className="text-blue-900">{selectedRequest.user.anneeEtude}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700 font-medium flex items-center">
                            <Building className="w-4 h-4 mr-1" />
                            Entité
                          </p>
                          <p className="text-blue-900">{selectedRequest.user.entite}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700 font-medium">Nom Facebook</p>
                          <p className="text-blue-900">{selectedRequest.user.facebookName}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informations du témoin */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-green-900 font-montserrat mb-4 flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Informations du Témoin
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-green-700 font-medium">Nom du témoin</p>
                          <p className="text-green-900 font-semibold">{selectedRequest.user.temoinName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-green-700 font-medium flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            Quartier
                          </p>
                          <p className="text-green-900">{selectedRequest.user.temoinQuartier}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-green-700 font-medium flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            Téléphone
                          </p>
                          <p className="text-green-900">{selectedRequest.user.temoinPhone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-green-700 font-medium flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            Email
                          </p>
                          <p className="text-green-900">{selectedRequest.user.temoinEmail}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact d'urgence */}
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
                    <h3 className="text-lg font-semibold text-red-900 font-montserrat mb-4 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Contact d'Urgence
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-red-700 font-medium">Nom du contact</p>
                          <p className="text-red-900 font-semibold">{selectedRequest.user.emergencyName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-red-700 font-medium">Relation</p>
                          <p className="text-red-900">{selectedRequest.user.emergencyRelation}</p>
                        </div>
                        <div>
                          <p className="text-sm text-red-700 font-medium flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            Téléphone
                          </p>
                          <p className="text-red-900">{selectedRequest.user.emergencyPhone}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-red-700 font-medium flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            Email
                          </p>
                          <p className="text-red-900">{selectedRequest.user.emergencyEmail}</p>
                        </div>
                        <div>
                          <p className="text-sm text-red-700 font-medium flex items-center">
                            <Home className="w-4 h-4 mr-1" />
                            Adresse
                          </p>
                          <p className="text-red-900">{selectedRequest.user.emergencyAddress}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                    <h3 className="text-lg font-semibold text-purple-900 font-montserrat mb-4 flex items-center">
                      <FileImage className="w-5 h-5 mr-2" />
                      Documents
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-purple-700 font-medium">Carte d'identité</p>
                        <p className="text-purple-900 font-semibold">{selectedRequest.user.userIdentityCard}</p>
                      </div>
                      <div>
                        <p className="text-sm text-purple-700 font-medium">Carte d'identité témoin</p>
                        <p className="text-purple-900 font-semibold">{selectedRequest.user.temoinIdentityCard}</p>
                      </div>
                      <div>
                        <p className="text-sm text-purple-700 font-medium">Carte d'étudiant</p>
                        <p className="text-purple-900 font-semibold">{selectedRequest.user.studentCard}</p>
                      </div>
                    </div>
                  </div>

                  {/* Détails du prêt */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
                    <h3 className="text-lg font-semibold text-orange-900 font-montserrat mb-4 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Détails du Prêt
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-orange-700 font-medium">Montant demandé</p>
                          <p className="text-orange-900 font-semibold text-xl">
                            {formatCurrency(selectedRequest.amount)}
                          </p>
                        </div>
                                                 <div>
                           <p className="text-sm text-orange-700 font-medium">Durée</p>
                           <p className="text-orange-900">{selectedRequest.duration} jours</p>
                         </div>
                        <div>
                          <p className="text-sm text-orange-700 font-medium">Objet du prêt</p>
                          <p className="text-orange-900">{selectedRequest.purpose}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-orange-700 font-medium">Pénalité de retard</p>
                          <p className="text-orange-900 font-semibold text-red-600">
                            {selectedRequest.dailyPenaltyRate}% par jour
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-orange-700 font-medium">Statut</p>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center justify-center space-x-1 w-fit ${getStatusColor(selectedRequest.status)}`}>
                            {getStatusIcon(selectedRequest.status)}
                            <span>{getStatusText(selectedRequest.status)}</span>
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-orange-700 font-medium">Date de demande</p>
                          <p className="text-orange-900">
                            {new Date(selectedRequest.requestDate).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-orange-700 font-medium">Date d'échéance</p>
                          <p className="text-orange-900 font-semibold">
                            {new Date(selectedRequest.dueDate).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informations de paiement Momo */}
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-6 border border-teal-200">
                    <h3 className="text-lg font-semibold text-teal-900 font-montserrat mb-4 flex items-center">
                      <Smartphone className="w-5 h-5 mr-2" />
                      Informations de Paiement Momo
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-teal-700 font-medium flex items-center">
                          <CreditCard className="w-4 h-4 mr-1" />
                          Numéro Momo
                        </p>
                        <p className="text-teal-900 font-semibold">{selectedRequest.momoNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-teal-700 font-medium">Réseau</p>
                        <p className="text-teal-900">{selectedRequest.momoNetwork}</p>
                      </div>
                      <div>
                        <p className="text-sm text-teal-700 font-medium">Nom sur le numéro</p>
                        <p className="text-teal-900">{selectedRequest.momoName}</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Footer du modal */}
              <div className="bg-gray-50 border-t border-gray-200 p-6">
                <div className="flex items-center justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={closeDetailsModal}
                    className="flex items-center space-x-2"
                  >
                    <X size={16} />
                    <span>Fermer</span>
                  </Button>
                  {selectedRequest.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => {
                          handleApprove(selectedRequest.id);
                          closeDetailsModal();
                        }}
                        className="flex items-center space-x-2 bg-green-500 hover:bg-green-600"
                      >
                        <UserCheck size={16} />
                        <span>Approuver</span>
                      </Button>
                      <Button
                        onClick={() => {
                          handleReject(selectedRequest.id);
                          closeDetailsModal();
                        }}
                        variant="outline"
                        className="flex items-center space-x-2 border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <UserX size={16} />
                        <span>Rejeter</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoanRequests; 