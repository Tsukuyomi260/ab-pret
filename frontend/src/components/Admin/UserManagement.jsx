import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { getAllUsers, updateUserStatus } from '../../utils/supabaseAPI';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  Eye, 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle, 
  XCircle,
  Users,
  Mail,
  Phone,
  Calendar,
  RefreshCw,
  FileText,
  User,
  X,
  MapPin,
  GraduationCap,
  Building,
  Shield,
  AlertTriangle,
  FileImage,
  Home,
  CreditCard
} from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';

const UserManagement = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ url: '', title: '' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      const result = await getAllUsers();
      
      if (result.success) {
        // Transformer les données pour correspondre au format attendu
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
          // Informations personnelles
          filiere: user.filiere || 'Non spécifiée',
          anneeEtude: user.annee_etude || 'Non spécifiée',
          entite: user.entite || 'Non spécifiée',
          address: user.address || 'Non spécifiée',
          facebookName: user.facebook_name || 'Non spécifié',
          // Informations du témoin
          temoinName: user.temoin_name || 'Non spécifié',
          temoinQuartier: user.temoin_quartier || 'Non spécifié',
          temoinPhone: user.temoin_phone || 'Non spécifié',
          temoinEmail: user.temoin_email || 'Non spécifié',
          // Informations d'urgence
          emergencyName: user.emergency_name || 'Non spécifié',
          emergencyRelation: user.emergency_relation || 'Non spécifié',
          emergencyPhone: user.emergency_phone || 'Non spécifié',
          emergencyEmail: user.emergency_email || 'Non spécifié',
          emergencyAddress: user.emergency_address || 'Non spécifié',
          // Documents
          userIdentityCard: user.user_identity_card_name || 'Non spécifié',
          temoinIdentityCard: user.temoin_identity_card_name || 'Non spécifié',
          studentCard: user.student_card_name || 'Non spécifié',
          userIdentityCardUrl: user.user_identity_card_url || null,
          temoinIdentityCardUrl: user.temoin_identity_card_url || null,
          studentCardUrl: user.student_card_url || null
        }));
        
        setUsers(formattedUsers);
      } else {
        console.error('[ADMIN] Erreur lors du chargement des utilisateurs:', result.error);
        showError('Erreur lors du chargement des utilisateurs');
      }
    } catch (error) {
      console.error('[ADMIN] Erreur lors du chargement des utilisateurs:', error.message);
      showError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      const result = await updateUserStatus(userId, 'approved');
      
      if (result.success) {
        setUsers(prev => 
          prev.map(user => 
            user.id === userId ? { ...user, status: 'approved', verified: true } : user
          )
        );
        showSuccess('Utilisateur approuvé avec succès');
      } else {
        showError('Erreur lors de l\'approbation');
      }
    } catch (error) {
      console.error('[ADMIN] Erreur lors de l\'approbation:', error.message);
      showError('Erreur lors de l\'approbation');
    }
  };

  const handleSuspendUser = async (userId) => {
    try {
      const result = await updateUserStatus(userId, 'rejected');
      
      if (result.success) {
        setUsers(prev => 
          prev.map(user => 
            user.id === userId ? { ...user, status: 'rejected', verified: false } : user
          )
        );
        showSuccess('Utilisateur rejeté');
      } else {
        showError('Erreur lors du rejet');
      }
    } catch (error) {
      console.error('[ADMIN] Erreur lors du rejet:', error.message);
      showError('Erreur lors du rejet');
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedUser(null);
  };

  const openImageModal = (url, title) => {
    if (url) {
      setSelectedImage({ url, title });
      setShowImageModal(true);
    }
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage({ url: '', title: '' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Approuvé';
      case 'pending': return 'En attente';
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    // Debug: Afficher les informations de filtrage
    console.log('[USER_MANAGEMENT] Filtrage:', {
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      statusFilter: statusFilter,
      matchesSearch: matchesSearch,
      matchesStatus: matchesStatus,
      finalResult: matchesSearch && matchesStatus
    });
    
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
                  Gestion des Utilisateurs
                </h1>
                <p className="text-sm text-gray-600">
                  {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
                </p>
              </div>
                  </div>
            <button
              onClick={loadUsers}
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
                  placeholder="Rechercher par nom ou email..."
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
                    <option value="approved">Approuvés</option>
                    <option value="pending">En attente</option>
                    <option value="rejected">Rejetés</option>
                  </select>
                </div>
              </div>
        </Card>

        {/* Liste des utilisateurs */}
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/50 shadow-soft hover:shadow-lg transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <User size={24} className="text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {user.firstName} {user.lastName}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(user.status)}`}>
                            {getStatusIcon(user.status)}
                            <span>{getStatusText(user.status)}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Mail size={14} />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone size={14} />
                            <span>{user.phone}</span>
                      </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                        <p className="text-sm text-gray-600">Prêts totaux</p>
                        <p className="font-semibold text-gray-900">{user.totalLoans}</p>
                      </div>
                        <div>
                        <p className="text-sm text-gray-600">Prêts actifs</p>
                        <p className="font-semibold text-gray-900">{user.activeLoans}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Montant total</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(user.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Inscription</p>
                        <p className="font-semibold text-gray-900">{formatDate(user.registrationDate)}</p>
                      </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                  {user.status === 'pending' && (
                    <Button
                      onClick={() => handleApproveUser(user.id)}
                      className="flex items-center space-x-2 bg-green-500 hover:bg-green-600"
                    >
                      <UserCheck size={16} />
                      <span>Approuver</span>
                    </Button>
                  )}
                  {user.status === 'approved' && (
                      <Button
                      onClick={() => handleSuspendUser(user.id)}
                      variant="outline"
                      className="flex items-center space-x-2 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <UserX size={16} />
                      <span>Rejeter</span>
                      </Button>
                    )}
                      <Button
                    variant="outline"
                    className="flex items-center space-x-2"
                    onClick={() => handleViewDetails(user)}
                  >
                    <Eye size={16} />
                    <span>Voir détails</span>
                      </Button>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredUsers.length === 0 && !loading && (
            <Card className="bg-white/90 backdrop-blur-sm">
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Aucun utilisateur ne correspond à vos critères'
                    : 'Aucun utilisateur pour le moment'
                  }
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de détails */}
      <AnimatePresence>
        {showDetailsModal && selectedUser && (
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
                      Profil Utilisateur
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">
                      {selectedUser.firstName} {selectedUser.lastName}
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
                            {selectedUser.firstName} {selectedUser.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700 font-medium flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            Email
                          </p>
                          <p className="text-blue-900">{selectedUser.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700 font-medium flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            Téléphone
                          </p>
                          <p className="text-blue-900">{selectedUser.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700 font-medium flex items-center">
                            <Home className="w-4 h-4 mr-1" />
                            Adresse
                          </p>
                          <p className="text-blue-900">{selectedUser.address}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-blue-700 font-medium flex items-center">
                            <GraduationCap className="w-4 h-4 mr-1" />
                            Filière
                          </p>
                          <p className="text-blue-900">{selectedUser.filiere}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700 font-medium">Année d'étude</p>
                          <p className="text-blue-900">{selectedUser.anneeEtude}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700 font-medium flex items-center">
                            <Building className="w-4 h-4 mr-1" />
                            Entité
                          </p>
                          <p className="text-blue-900">{selectedUser.entite}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700 font-medium">Nom Facebook</p>
                          <p className="text-blue-900">{selectedUser.facebookName}</p>
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
                          <p className="text-green-900 font-semibold">{selectedUser.temoinName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-green-700 font-medium flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            Quartier
                          </p>
                          <p className="text-green-900">{selectedUser.temoinQuartier}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-green-700 font-medium flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            Téléphone
                          </p>
                          <p className="text-green-900">{selectedUser.temoinPhone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-green-700 font-medium flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            Email
                          </p>
                          <p className="text-green-900">{selectedUser.temoinEmail}</p>
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
                          <p className="text-red-900 font-semibold">{selectedUser.emergencyName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-red-700 font-medium">Relation</p>
                          <p className="text-red-900">{selectedUser.emergencyRelation}</p>
                        </div>
                        <div>
                          <p className="text-sm text-red-700 font-medium flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            Téléphone
                          </p>
                          <p className="text-red-900">{selectedUser.emergencyPhone}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-red-700 font-medium flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            Email
                          </p>
                          <p className="text-red-900">{selectedUser.emergencyEmail}</p>
                        </div>
                        <div>
                          <p className="text-sm text-red-700 font-medium flex items-center">
                            <Home className="w-4 h-4 mr-1" />
                            Adresse
                          </p>
                          <p className="text-red-900">{selectedUser.emergencyAddress}</p>
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
                        <button
                          onClick={() => openImageModal(selectedUser.userIdentityCardUrl, 'Carte d\'identité')}
                          className={`text-purple-900 font-semibold hover:text-purple-700 transition-colors ${
                            selectedUser.userIdentityCardUrl ? 'cursor-pointer underline' : 'cursor-default'
                          }`}
                          disabled={!selectedUser.userIdentityCardUrl}
                        >
                          {selectedUser.userIdentityCard}
                          {selectedUser.userIdentityCardUrl && (
                            <span className="ml-2 text-xs text-purple-600">(Cliquer pour voir)</span>
                          )}
                        </button>
                      </div>
                      <div>
                        <p className="text-sm text-purple-700 font-medium">Carte d'identité témoin</p>
                        <button
                          onClick={() => openImageModal(selectedUser.temoinIdentityCardUrl, 'Carte d\'identité témoin')}
                          className={`text-purple-900 font-semibold hover:text-purple-700 transition-colors ${
                            selectedUser.temoinIdentityCardUrl ? 'cursor-pointer underline' : 'cursor-default'
                          }`}
                          disabled={!selectedUser.temoinIdentityCardUrl}
                        >
                          {selectedUser.temoinIdentityCard}
                          {selectedUser.temoinIdentityCardUrl && (
                            <span className="ml-2 text-xs text-purple-600">(Cliquer pour voir)</span>
                          )}
                        </button>
                      </div>
                      <div>
                        <p className="text-sm text-purple-700 font-medium">Carte d'étudiant</p>
                        <button
                          onClick={() => openImageModal(selectedUser.studentCardUrl, 'Carte d\'étudiant')}
                          className={`text-purple-900 font-semibold hover:text-purple-700 transition-colors ${
                            selectedUser.studentCardUrl ? 'cursor-pointer underline' : 'cursor-default'
                          }`}
                          disabled={!selectedUser.studentCardUrl}
                        >
                          {selectedUser.studentCard}
                          {selectedUser.studentCardUrl && (
                            <span className="ml-2 text-xs text-purple-600">(Cliquer pour voir)</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Informations du compte */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
                    <h3 className="text-lg font-semibold text-orange-900 font-montserrat mb-4 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Informations du Compte
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-orange-700 font-medium">Statut du compte</p>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center justify-center space-x-1 w-fit ${getStatusColor(selectedUser.status)}`}>
                            {getStatusIcon(selectedUser.status)}
                            <span>{getStatusText(selectedUser.status)}</span>
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-orange-700 font-medium">Date d'inscription</p>
                          <p className="text-orange-900">
                            {new Date(selectedUser.registrationDate).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-orange-700 font-medium">Prêts totaux</p>
                          <p className="text-orange-900 font-semibold text-xl">{selectedUser.totalLoans}</p>
                        </div>
                        <div>
                          <p className="text-sm text-orange-700 font-medium">Prêts actifs</p>
                          <p className="text-orange-900 font-semibold text-xl">{selectedUser.activeLoans}</p>
                        </div>
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
                  {selectedUser.status === 'pending' && (
                    <Button
                      onClick={() => {
                        handleApproveUser(selectedUser.id);
                        closeDetailsModal();
                      }}
                      className="flex items-center space-x-2 bg-green-500 hover:bg-green-600"
                    >
                      <UserCheck size={16} />
                      <span>Approuver</span>
                    </Button>
                  )}
                  {selectedUser.status === 'active' && (
                    <Button
                      onClick={() => {
                        handleSuspendUser(selectedUser.id);
                        closeDetailsModal();
                      }}
                      variant="outline"
                      className="flex items-center space-x-2 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <UserX size={16} />
                      <span>Suspendre</span>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal d'affichage des images */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeImageModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">{selectedImage.title}</h3>
                  <button
                    onClick={closeImageModal}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={24} className="text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.title}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div 
                    className="hidden text-center text-gray-500 p-8"
                    style={{ display: 'none' }}
                  >
                    <FileImage size={48} className="mx-auto mb-4 text-gray-400" />
                    <p>Impossible de charger l'image</p>
                    <p className="text-sm">L'URL de l'image pourrait être invalide ou expirée</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;