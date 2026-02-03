import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { getAllUsers, updateUserStatus, deleteUserPermanently } from '../../utils/supabaseAPI';
import { 
  ArrowLeft, 
  Search, 
  Eye, 
  UserCheck, 
  UserX, 
  CheckCircle, 
  XCircle,
  Users,
  Mail,
  Phone,
  RefreshCw,
  User,
  X,
  MapPin,
  GraduationCap,
  Building,
  Shield,
  AlertTriangle,
  FileImage,
  Home,
  CreditCard,
  Filter,
  Trash2
} from 'lucide-react';

const UserManagement = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ url: '', title: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      const result = await getAllUsers();
      
      if (result.success) {
        const formattedUsers = result.data.map(user => ({
          id: user.id,
          firstName: user.first_name || 'Utilisateur',
          lastName: user.last_name || 'Inconnu',
          email: user.email || 'email@inconnu.com',
          phone: user.phone_number || 'Non renseigné',
          status: user.status || 'pending',
          registrationDate: user.created_at || new Date().toISOString(),
          totalLoans: user.totalLoans || 0,
          activeLoans: user.activeLoans || 0,
          totalAmount: user.totalAmount || 0,
          verified: user.status === 'approved',
          filiere: user.filiere || 'Non spécifiée',
          anneeEtude: user.annee_etude || 'Non spécifiée',
          entite: user.entite || 'Non spécifiée',
          address: user.address || 'Non spécifiée',
          facebookName: user.facebook_name || 'Non spécifié',
          temoinName: user.temoin_name || 'Non spécifié',
          temoinQuartier: user.temoin_quartier || 'Non spécifié',
          temoinPhone: user.temoin_phone || 'Non spécifié',
          temoinEmail: user.temoin_email || 'Non spécifié',
          emergencyName: user.emergency_name || 'Non spécifié',
          emergencyRelation: user.emergency_relation || 'Non spécifié',
          emergencyPhone: user.emergency_phone || 'Non spécifié',
          emergencyEmail: user.emergency_email || 'Non spécifié',
          emergencyAddress: user.emergency_address || 'Non spécifié',
          userIdentityCard: user.user_identity_card_name || 'Non spécifié',
          temoinIdentityCard: user.temoin_identity_card_name || 'Non spécifié',
          studentCard: user.student_card_name || 'Non spécifié',
          userIdentityCardUrl: user.user_identity_card_url || null,
          temoinIdentityCardUrl: user.temoin_identity_card_url || null,
          studentCardUrl: user.student_card_url || null
        }));
        
        setUsers(formattedUsers);
      } else {
        showError('Erreur lors du chargement des utilisateurs');
      }
    } catch (error) {
      console.error('[ADMIN] Erreur:', error);
      showError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      const result = await updateUserStatus(userId, 'approved');
      if (result.success) {
        showSuccess('Utilisateur approuvé avec succès');
        loadUsers();
        setShowDetailsModal(false);
      } else {
        showError('Erreur lors de l\'approbation');
      }
    } catch (error) {
      showError('Erreur lors de l\'approbation');
    }
  };

  const handleReject = async (userId) => {
    try {
      const result = await updateUserStatus(userId, 'rejected');
      if (result.success) {
        showSuccess('Utilisateur rejeté');
        loadUsers();
        setShowDetailsModal(false);
      } else {
        showError('Erreur lors du rejet');
      }
    } catch (error) {
      showError('Erreur lors du rejet');
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    
    try {
      setDeleting(true);
      const result = await deleteUserPermanently(selectedUser.id);
      
      if (result.success) {
        showSuccess(result.message || 'Utilisateur supprimé définitivement');
        loadUsers();
        setShowDeleteConfirm(false);
        setShowDetailsModal(false);
        setSelectedUser(null);
      } else {
        showError(result.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('[ADMIN] Erreur suppression:', error);
      showError('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const openImageModal = (url, title) => {
    if (url) {
      setSelectedImage({ url, title });
      setShowImageModal(true);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Approuvé', icon: CheckCircle },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En attente', icon: AlertTriangle },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejeté', icon: XCircle }
    };
    
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon size={14} />
        {badge.label}
      </span>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: users.length,
    approved: users.filter(u => u.status === 'approved').length,
    pending: users.filter(u => u.status === 'pending').length,
    rejected: users.filter(u => u.status === 'rejected').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50 to-slate-100 pb-24">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/menu')}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft size={24} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-secondary-900 font-montserrat flex items-center gap-3">
                  <Users className="text-primary-600" size={32} />
                  Gestion des Utilisateurs
                </h1>
                <p className="text-gray-600 font-montserrat mt-1">
                  {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}
                </p>
              </div>
                  </div>
            <button
              onClick={loadUsers}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-all duration-200"
            >
              <RefreshCw size={18} />
              <span className="hidden sm:inline">Actualiser</span>
                </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-2 mb-4 text-gray-500 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent" />
            <span>Chargement des utilisateurs...</span>
          </div>
        )}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 transition-opacity duration-200 ${loading ? 'opacity-75' : ''}`}>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-secondary-100 rounded-xl">
                <Users size={24} className="text-secondary-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Total</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Approuvés</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.approved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-primary-100 rounded-xl">
                <AlertTriangle size={24} className="text-primary-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">En attente</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-red-100 rounded-xl">
                <XCircle size={24} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Rejetés</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
              <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                placeholder="Rechercher par nom, email ou téléphone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
              </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-12 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer min-w-[200px]"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="approved">Approuvés</option>
                    <option value="pending">En attente</option>
                    <option value="rejected">Rejetés</option>
                  </select>
                </div>
              </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* User Header */}
              <div className="bg-gradient-to-r from-secondary-800 to-secondary-900 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <User size={32} className="text-primary-600" />
                      </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">
                            {user.firstName} {user.lastName}
                          </h3>
                    <p className="text-gray-200 text-sm truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    
              {/* User Info */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={16} className="text-gray-400" />
                  <span>{user.phone}</span>
                      </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard size={16} className="text-gray-400" />
                  <span>{user.activeLoans} prêt{user.activeLoans > 1 ? 's' : ''} actif{user.activeLoans > 1 ? 's' : ''}</span>
                  </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  {getStatusBadge(user.status)}
                  
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowDetailsModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-all duration-200 text-sm"
                  >
                    <Eye size={16} />
                    Détails
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users size={64} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">Aucun utilisateur trouvé</p>
            <p className="text-gray-400 text-sm mt-2">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
        {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-8 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-secondary-800 to-secondary-900 p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <User size={32} className="text-primary-600" />
                </div>
                  <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedUser.firstName} {selectedUser.lastName}
                    </h2>
                  <p className="text-gray-200">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X size={24} className="text-white" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 pb-4 overflow-y-auto flex-1 space-y-6">
              {/* Contact Info */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 font-montserrat mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Informations de Contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                    <p className="text-sm text-blue-700 font-medium">Téléphone</p>
                    <p className="text-blue-900 font-semibold">{selectedUser.phone}</p>
                        </div>
                        <div>
                    <p className="text-sm text-blue-700 font-medium">Email</p>
                    <p className="text-blue-900 font-semibold break-all">{selectedUser.email}</p>
                        </div>
                        <div>
                    <p className="text-sm text-blue-700 font-medium">Adresse</p>
                    <p className="text-blue-900">{selectedUser.address}</p>
                        </div>
                        <div>
                    <p className="text-sm text-blue-700 font-medium">Facebook</p>
                    <p className="text-blue-900">{selectedUser.facebookName}</p>
                        </div>
                      </div>
                        </div>

              {/* Academic Info */}
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6 border border-primary-200">
                <h3 className="text-lg font-semibold text-primary-900 font-montserrat mb-4 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Informations Académiques
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                    <p className="text-sm text-primary-800 font-medium">Filière</p>
                    <p className="text-secondary-900 font-semibold">{selectedUser.filiere}</p>
                        </div>
                        <div>
                    <p className="text-sm text-primary-800 font-medium">Année d'étude</p>
                    <p className="text-secondary-900 font-semibold">{selectedUser.anneeEtude}</p>
                        </div>
                        <div>
                    <p className="text-sm text-primary-800 font-medium">Entité</p>
                    <p className="text-secondary-900 font-semibold">{selectedUser.entite}</p>
                      </div>
                    </div>
                  </div>

              {/* Witness Info */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-green-900 font-montserrat mb-4 flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Informations du Témoin
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                    <p className="text-sm text-green-700 font-medium">Nom</p>
                          <p className="text-green-900 font-semibold">{selectedUser.temoinName}</p>
                        </div>
                        <div>
                    <p className="text-sm text-green-700 font-medium">Téléphone</p>
                          <p className="text-green-900">{selectedUser.temoinPhone}</p>
                        </div>
                        <div>
                    <p className="text-sm text-green-700 font-medium">Email</p>
                    <p className="text-green-900 break-all">{selectedUser.temoinEmail}</p>
                        </div>
                  <div>
                    <p className="text-sm text-green-700 font-medium">Quartier</p>
                    <p className="text-green-900">{selectedUser.temoinQuartier}</p>
                      </div>
                    </div>
                  </div>

              {/* Emergency Contact */}
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
                    <h3 className="text-lg font-semibold text-red-900 font-montserrat mb-4 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Contact d'Urgence
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                    <p className="text-sm text-red-700 font-medium">Nom</p>
                          <p className="text-red-900 font-semibold">{selectedUser.emergencyName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-red-700 font-medium">Relation</p>
                          <p className="text-red-900">{selectedUser.emergencyRelation}</p>
                        </div>
                        <div>
                    <p className="text-sm text-red-700 font-medium">Téléphone</p>
                          <p className="text-red-900">{selectedUser.emergencyPhone}</p>
                        </div>
                        <div>
                    <p className="text-sm text-red-700 font-medium">Email</p>
                    <p className="text-red-900 break-all">{selectedUser.emergencyEmail}</p>
                        </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-red-700 font-medium">Adresse</p>
                          <p className="text-red-900">{selectedUser.emergencyAddress}</p>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
              <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-2xl p-6 border border-secondary-200">
                <h3 className="text-lg font-semibold text-secondary-900 font-montserrat mb-4 flex items-center">
                      <FileImage className="w-5 h-5 mr-2" />
                      Documents
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                    <p className="text-sm text-secondary-700 font-medium mb-2">Carte d'identité</p>
                        <button
                          onClick={() => openImageModal(selectedUser.userIdentityCardUrl, 'Carte d\'identité')}
                      disabled={!selectedUser.userIdentityCardUrl}
                      className={`w-full px-4 py-3 rounded-xl font-medium transition-all ${
                        selectedUser.userIdentityCardUrl
                          ? 'bg-primary-500 hover:bg-primary-600 text-white cursor-pointer'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {selectedUser.userIdentityCardUrl ? 'Voir' : 'Non disponible'}
                        </button>
                      </div>
                      <div>
                    <p className="text-sm text-secondary-700 font-medium mb-2">Carte témoin</p>
                        <button
                          onClick={() => openImageModal(selectedUser.temoinIdentityCardUrl, 'Carte d\'identité témoin')}
                      disabled={!selectedUser.temoinIdentityCardUrl}
                      className={`w-full px-4 py-3 rounded-xl font-medium transition-all ${
                        selectedUser.temoinIdentityCardUrl
                          ? 'bg-primary-500 hover:bg-primary-600 text-white cursor-pointer'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {selectedUser.temoinIdentityCardUrl ? 'Voir' : 'Non disponible'}
                        </button>
                      </div>
                      <div>
                    <p className="text-sm text-secondary-700 font-medium mb-2">Carte étudiant</p>
                        <button
                          onClick={() => openImageModal(selectedUser.studentCardUrl, 'Carte d\'étudiant')}
                      disabled={!selectedUser.studentCardUrl}
                      className={`w-full px-4 py-3 rounded-xl font-medium transition-all ${
                        selectedUser.studentCardUrl
                          ? 'bg-primary-500 hover:bg-primary-600 text-white cursor-pointer'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {selectedUser.studentCardUrl ? 'Voir' : 'Non disponible'}
                        </button>
                      </div>
                    </div>
                  </div>

              {/* Account Info */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
                    <h3 className="text-lg font-semibold text-orange-900 font-montserrat mb-4 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Informations du Compte
                    </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                    <p className="text-sm text-orange-700 font-medium">Prêts actifs</p>
                    <p className="text-2xl font-bold text-orange-900">{selectedUser.activeLoans}</p>
                        </div>
                        <div>
                    <p className="text-sm text-orange-700 font-medium">Total prêts</p>
                    <p className="text-2xl font-bold text-orange-900">{selectedUser.totalLoans}</p>
                        </div>
                        <div>
                    <p className="text-sm text-orange-700 font-medium">Statut</p>
                    <div className="mt-2">{getStatusBadge(selectedUser.status)}</div>
                        </div>
                      </div>
                    </div>
                  </div>

            {/* Modal Footer */}
            <div className="p-6 pt-4 pb-6 bg-gray-50 border-t border-gray-200 flex gap-4" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
              {selectedUser.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleApprove(selectedUser.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200"
                  >
                    <UserCheck size={20} />
                    Approuver
                  </button>
                  <button
                    onClick={() => handleReject(selectedUser.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200"
                  >
                    <UserX size={20} />
                    Rejeter
                  </button>
                </>
              )}
              {selectedUser.status !== 'pending' && (
                <>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-200"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200"
                  >
                    <Trash2 size={20} />
                    Supprimer définitivement
                  </button>
                </>
              )}
              </div>
            </div>
          </div>
        )}

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Confirmer la suppression</h3>
                  <p className="text-gray-600 text-sm">Cette action est irréversible</p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-gray-800 font-medium mb-2">
                  Vous êtes sur le point de supprimer définitivement :
                </p>
                <p className="text-lg font-bold text-red-900">
                  {selectedUser.firstName} {selectedUser.lastName}
                </p>
                <p className="text-sm text-gray-600 mt-1">{selectedUser.email}</p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-yellow-900">
                  ⚠️ <strong>Toutes les données</strong> de cet utilisateur seront supprimées :
                </p>
                <ul className="list-disc list-inside text-sm text-yellow-800 mt-2 space-y-1">
                  <li>Compte utilisateur</li>
                  <li>Prêts et historique</li>
                  <li>Paiements</li>
                  <li>Plans d'épargne</li>
                  <li>Notifications</li>
                </ul>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2 size={20} />
                      Supprimer définitivement
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Image Modal */}
      {showImageModal && selectedImage.url && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X size={24} className="text-white" />
                  </button>
            <div className="bg-white rounded-3xl p-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                {selectedImage.title}
              </h3>
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.title}
                className="w-full h-auto rounded-2xl"
              />
            </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default UserManagement;
