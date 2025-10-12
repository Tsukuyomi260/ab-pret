import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLoans, updateLoanStatus, getPayments } from '../../utils/supabaseAPI';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Search, 
  Eye, 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle, 
  XCircle,
  DollarSign,
  Calendar,
  RefreshCw,
  User,
  X,
  Phone,
  Mail,
  Activity,
  AlertTriangle,
  TrendingUp,
  Wallet,
  CreditCard,
  FileText,
  Shield,
  Target,
  Award,
  Filter
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const LoanRequests = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();
  const [loanRequests, setLoanRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pending: 0,
    active: 0,
    completed: 0,
    totalAmount: 0
  });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[ADMIN_LOANS] 📥 Chargement des demandes de prêts...');
      
      // Charger les prêts et les paiements en parallèle
      const [loansResult, paymentsResult] = await Promise.all([
        getLoans(),
        getPayments()
      ]);
      
      if (loansResult.success && paymentsResult.success) {
        const loans = loansResult.data || [];
        const payments = paymentsResult.data || [];
        
        console.log('[ADMIN_LOANS] ✅ Prêts chargés:', loans.length);
        console.log('[ADMIN_LOANS] ✅ Paiements chargés:', payments.length);
        
        // Transformer les données
        const formattedRequests = loans.map(loan => {
          const loanPayments = payments.filter(payment => payment.loan_id === loan.id);
          const paidAmount = loanPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
          const totalAmount = loan.amount ? loan.amount * (1 + (loan.interest_rate || 0) / 100) : 0;
          const remainingAmount = totalAmount - paidAmount;
          
          const loanDate = new Date(loan.created_at || new Date());
          const durationDays = loan.duration_months || 30;
          const dueDate = new Date(loanDate.getTime() + (durationDays * 24 * 60 * 60 * 1000));
          
          return {
            id: loan.id,
            userId: loan.user_id,
            user: {
              id: loan.user_id,
              firstName: loan.users?.first_name || 'Utilisateur',
              lastName: loan.users?.last_name || 'Inconnu',
              email: loan.users?.email || 'email@inconnu.com',
              phone: loan.users?.phone_number || 'Non spécifié',
            },
            amount: loan.amount || 0,
            totalAmount: Math.round(totalAmount),
            paidAmount: Math.round(paidAmount),
            remainingAmount: Math.round(remainingAmount),
            duration: loan.duration_months || 0,
            purpose: loan.purpose || 'Non spécifié',
            status: loan.status || 'pending',
            requestDate: loan.created_at || new Date().toISOString(),
            dueDate: dueDate.toISOString(),
            guarantee: loan.guarantee || 'Non spécifiée',
            employment_status: loan.employment_status || 'Non spécifié',
            momoNumber: loan.momo_number || 'Non spécifié',
            momoNetwork: loan.momo_network || 'Non spécifié',
            interest_rate: loan.interest_rate || 0
          };
        });
        
        setLoanRequests(formattedRequests);
        
        // Calculer les statistiques
        const pending = formattedRequests.filter(r => r.status === 'pending').length;
        const active = formattedRequests.filter(r => r.status === 'active' || r.status === 'approved').length;
        const completed = formattedRequests.filter(r => r.status === 'completed').length;
        const totalAmount = formattedRequests.reduce((sum, r) => sum + r.amount, 0);
        
        setStats({
          totalRequests: formattedRequests.length,
          pending,
          active,
          completed,
          totalAmount
        });
        
      } else {
        console.error('[ADMIN_LOANS] ❌ Erreur:', {
          loans: loansResult.error,
          payments: paymentsResult.error
        });
        setError('Erreur lors du chargement des demandes');
      }
    } catch (error) {
      console.error('[ADMIN_LOANS] ❌ Erreur:', error);
      setError(error.message || 'Une erreur est survenue');
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
        loadRequests(); // Recharger pour mettre à jour les stats
      } else {
        showError('Erreur lors de l\'approbation');
      }
    } catch (error) {
      console.error('[ADMIN_LOANS] Erreur approbation:', error);
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
        showSuccess('Demande rejetée');
        loadRequests();
      } else {
        showError('Erreur lors du rejet');
      }
    } catch (error) {
      console.error('[ADMIN_LOANS] Erreur rejet:', error);
      showError('Erreur lors du rejet');
    }
  };

  // Regrouper les prêts par utilisateur
  const groupedByUser = loanRequests.reduce((acc, loan) => {
    const userId = loan.userId;
    if (!acc[userId]) {
      acc[userId] = {
        user: loan.user,
        loans: [],
        stats: {
          newRequests: 0,
          activeLoans: 0,
          completedLoans: 0,
          totalBorrowed: 0,
          totalPaid: 0
        }
      };
    }
    
    acc[userId].loans.push(loan);
    
    // Calculer les stats de l'utilisateur
    if (loan.status === 'pending') acc[userId].stats.newRequests++;
    if (loan.status === 'active' || loan.status === 'approved') acc[userId].stats.activeLoans++;
    if (loan.status === 'completed') acc[userId].stats.completedLoans++;
    acc[userId].stats.totalBorrowed += loan.amount;
    acc[userId].stats.totalPaid += loan.paidAmount;
    
    return acc;
  }, {});

  const userProfiles = Object.values(groupedByUser);

  // Filtrer par recherche et statut
  const filteredProfiles = userProfiles.filter(profile => {
    // Filtre de recherche
    const matchesSearch = !searchTerm || (() => {
      const term = searchTerm.toLowerCase();
      return (
        profile.user.firstName?.toLowerCase().includes(term) ||
        profile.user.lastName?.toLowerCase().includes(term) ||
        profile.user.email?.toLowerCase().includes(term) ||
        profile.user.phone?.includes(term)
      );
    })();

    // Filtre de statut
    const matchesStatus = statusFilter === 'all' || (() => {
      if (statusFilter === 'pending') return profile.stats.newRequests > 0;
      if (statusFilter === 'active') return profile.stats.activeLoans > 0;
      if (statusFilter === 'completed') return profile.stats.completedLoans > 0 && profile.stats.newRequests === 0 && profile.stats.activeLoans === 0;
      return true;
    })();

    return matchesSearch && matchesStatus;
  });

  const getUserStatusBadge = (stats) => {
    if (stats.newRequests > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-yellow-100 text-yellow-700 whitespace-nowrap">
          <Clock size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
          <span className="hidden sm:inline">{stats.newRequests} Nouvelle{stats.newRequests > 1 ? 's' : ''} demande{stats.newRequests > 1 ? 's' : ''}</span>
          <span className="sm:hidden">{stats.newRequests} Nouv.</span>
        </span>
      );
    }
    if (stats.activeLoans > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-blue-100 text-blue-700 whitespace-nowrap">
          <Activity size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
          <span className="hidden sm:inline">{stats.activeLoans} Prêt{stats.activeLoans > 1 ? 's' : ''} en cours</span>
          <span className="sm:hidden">{stats.activeLoans} Actif{stats.activeLoans > 1 ? 's' : ''}</span>
        </span>
      );
    }
    if (stats.completedLoans > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-green-100 text-green-700 whitespace-nowrap">
          <CheckCircle size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
          <span className="hidden sm:inline">{stats.completedLoans} Prêt{stats.completedLoans > 1 ? 's' : ''} remboursé{stats.completedLoans > 1 ? 's' : ''}</span>
          <span className="sm:hidden">{stats.completedLoans} OK</span>
        </span>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement des demandes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadRequests}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
          >
            <RefreshCw size={18} />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-24">
      {/* Header Moderne */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <CreditCard size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-montserrat">AB Pret</h1>
                <p className="text-gray-600 font-montserrat">Gestion des demandes de prêts</p>
              </div>
            </div>
            
            <button
              onClick={loadRequests}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow"
            >
              <RefreshCw size={18} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Actualiser</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Nouvelles demandes */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Clock size={24} className="text-yellow-600" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 font-medium">En attente</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pending}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">Nouvelles demandes</span>
            </div>
          </div>

          {/* Prêts actifs */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-white group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Activity size={24} className="text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-100 font-medium">Prêts actifs</p>
                <p className="text-3xl font-bold mt-1">{stats.active}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-4 border-t border-white/20">
              <TrendingUp size={16} className="text-blue-200" />
              <span className="text-sm text-blue-100">En cours de remboursement</span>
            </div>
          </div>

          {/* Prêts remboursés */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 font-medium">Remboursés</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completed}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">Prêts terminés</span>
            </div>
          </div>

          {/* Montant total */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Wallet size={24} className="text-purple-600" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 font-medium">Montant total</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalAmount)}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">Tous les prêts</span>
            </div>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-montserrat"
              />
            </div>
            
            {/* Filtre de statut */}
            <div className="flex items-center gap-2 sm:min-w-[250px]">
              <Filter size={20} className="text-gray-400 flex-shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-montserrat bg-white cursor-pointer"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">🟡 Demandes en attente</option>
                <option value="active">🔵 Prêts en cours</option>
                <option value="completed">🟢 Prêts remboursés</option>
              </select>
            </div>
          </div>
          
          {/* Indicateur de filtres actifs */}
          {(searchTerm || statusFilter !== 'all') && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-600">Filtres actifs:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  Recherche: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  Statut: {
                    statusFilter === 'pending' ? 'En attente' :
                    statusFilter === 'active' ? 'En cours' :
                    'Remboursés'
                  }
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="ml-auto text-xs text-gray-500 hover:text-gray-700 font-medium"
              >
                Réinitialiser tout
              </button>
            </div>
          )}
        </div>

        {/* Liste des profils utilisateurs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 font-montserrat">
              Clients ({filteredProfiles.length})
            </h2>
          </div>

          {filteredProfiles.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <User size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">Aucun client trouvé</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Effacer la recherche
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredProfiles.map((profile) => (
                <div
                  key={profile.user.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group cursor-pointer"
                  onClick={() => setSelectedUser(profile)}
                >
                  <div className="p-4 sm:p-6">
                    {/* Header du profil */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg flex-shrink-0">
                          {profile.user.firstName?.[0] || '?'}{profile.user.lastName?.[0] || ''}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 font-montserrat truncate">
                            {profile.user.firstName} {profile.user.lastName}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                            <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 min-w-0">
                              <Mail size={12} className="flex-shrink-0" />
                              <span className="truncate">{profile.user.email}</span>
                            </div>
                            {profile.user.phone && (
                              <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                                <Phone size={12} className="flex-shrink-0" />
                                <span>{profile.user.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        {getUserStatusBadge(profile.stats)}
                      </div>
                    </div>

                    {/* Stats rapides */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                      <div className="bg-yellow-50 rounded-xl p-2 sm:p-3 text-center">
                        <p className="text-xl sm:text-2xl font-bold text-yellow-700">{profile.stats.newRequests}</p>
                        <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Nouvelles</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-2 sm:p-3 text-center">
                        <p className="text-xl sm:text-2xl font-bold text-blue-700">{profile.stats.activeLoans}</p>
                        <p className="text-[10px] sm:text-xs text-gray-600 mt-1">En cours</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-2 sm:p-3 text-center">
                        <p className="text-xl sm:text-2xl font-bold text-green-700">{profile.stats.completedLoans}</p>
                        <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Remboursés</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        <span className="truncate">Total emprunté: <span className="font-bold text-gray-900">{formatCurrency(profile.stats.totalBorrowed)}</span></span>
                        <span className="truncate">Total payé: <span className="font-bold text-green-600">{formatCurrency(profile.stats.totalPaid)}</span></span>
                      </div>
                      
                      <button
                        className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto"
                      >
                        <Eye size={16} />
                        <span className="text-sm font-medium">Voir le profil</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de détails utilisateur */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-3xl z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {selectedUser.user.firstName?.[0]}{selectedUser.user.lastName?.[0]}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedUser.user.firstName} {selectedUser.user.lastName}</h3>
                    <p className="text-blue-100">{selectedUser.loans.length} demande{selectedUser.loans.length > 1 ? 's' : ''} de prêt</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Infos contact */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <User size={18} />
                  Informations de contact
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-medium">{selectedUser.user.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Téléphone</p>
                    <p className="font-medium">{selectedUser.user.phone}</p>
                  </div>
                </div>
              </div>

              {/* Liste des prêts */}
              <div>
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText size={18} />
                  Historique des prêts
                </h4>
                <div className="space-y-3">
                  {selectedUser.loans.map((loan) => (
                    <div key={loan.id} className="bg-gray-50 rounded-xl p-4 border-l-4 border-blue-500">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-gray-900">{formatCurrency(loan.amount)}</p>
                          <p className="text-sm text-gray-600">{loan.purpose}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          loan.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          loan.status === 'active' || loan.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                          loan.status === 'completed' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {loan.status === 'pending' && <Clock size={14} />}
                          {(loan.status === 'active' || loan.status === 'approved') && <Activity size={14} />}
                          {loan.status === 'completed' && <CheckCircle size={14} />}
                          {loan.status === 'rejected' && <XCircle size={14} />}
                          {loan.status === 'pending' ? 'En attente' :
                           loan.status === 'active' || loan.status === 'approved' ? 'En cours' :
                           loan.status === 'completed' ? 'Remboursé' : 'Rejeté'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                        <div>
                          <p className="text-gray-600">Durée</p>
                          <p className="font-medium">{loan.duration} jours</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Payé</p>
                          <p className="font-medium text-green-600">{formatCurrency(loan.paidAmount)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Restant</p>
                          <p className="font-medium text-orange-600">{formatCurrency(loan.remainingAmount)}</p>
                        </div>
                      </div>

                      {loan.status === 'pending' && (
                        <div className="flex gap-2 pt-3 border-t border-gray-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(loan.id);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                          >
                            <UserCheck size={16} />
                            Approuver
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(loan.id);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                          >
                            <UserX size={16} />
                            Refuser
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanRequests;
