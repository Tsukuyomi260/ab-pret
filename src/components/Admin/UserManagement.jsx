import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
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
  MoreHorizontal,
  Download,
  Plus,
  TrendingUp,
  UserPlus,
  Shield,
  Activity,
  MapPin,
  CreditCard,
  BarChart3,
  Settings,
  Trash2,
  Edit,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Calendar as CalendarIcon,
  MapPin as MapPinIcon
} from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';

const UserManagement = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useNotifications();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Données fictives pour les utilisateurs
  const mockUsers = [
    {
      id: 1,
      firstName: 'Kossi',
      lastName: 'Adama',
      email: 'kossi.adama@student.bj',
      phone: '+229 90123456',
      status: 'active',
      registrationDate: '2023-09-01',
      location: 'Cotonou, Bénin',
      avatar: 'KA',
      totalLoans: 3,
      activeLoans: 1,
      totalAmount: 1500000,
      lastActivity: '2024-01-15',
      verified: true,
      role: 'client'
    },
    {
      id: 2,
      firstName: 'Fatou',
      lastName: 'Diallo',
      email: 'fatou.diallo@student.bj',
      phone: '+229 90234567',
      status: 'active',
      registrationDate: '2023-10-15',
      location: 'Porto-Novo, Bénin',
      avatar: 'FD',
      totalLoans: 2,
      activeLoans: 0,
      totalAmount: 800000,
      lastActivity: '2024-01-10',
      verified: true,
      role: 'client'
    },
    {
      id: 3,
      firstName: 'Moussa',
      lastName: 'Traoré',
      email: 'moussa.traore@student.bj',
      phone: '+229 90345678',
      status: 'pending',
      registrationDate: '2024-01-05',
      location: 'Abomey-Calavi, Bénin',
      avatar: 'MT',
      totalLoans: 0,
      activeLoans: 0,
      totalAmount: 0,
      lastActivity: '2024-01-05',
      verified: false,
      role: 'client'
    },
    {
      id: 4,
      firstName: 'Aïcha',
      lastName: 'Ouedraogo',
      email: 'aicha.ouedraogo@student.bj',
      phone: '+229 90456789',
      status: 'suspended',
      registrationDate: '2023-08-20',
      location: 'Parakou, Bénin',
      avatar: 'AO',
      totalLoans: 1,
      activeLoans: 0,
      totalAmount: 500000,
      lastActivity: '2023-12-20',
      verified: true,
      role: 'client'
    },
    {
      id: 5,
      firstName: 'Boubacar',
      lastName: 'Sow',
      email: 'boubacar.sow@student.bj',
      phone: '+229 90567890',
      status: 'active',
      registrationDate: '2023-11-10',
      location: 'Natitingou, Bénin',
      avatar: 'BS',
      totalLoans: 4,
      activeLoans: 2,
      totalAmount: 2200000,
      lastActivity: '2024-01-18',
      verified: true,
      role: 'client'
    },
    {
      id: 6,
      firstName: 'Mariama',
      lastName: 'Keita',
      email: 'mariama.keita@student.bj',
      phone: '+229 90678901',
      status: 'active',
      registrationDate: '2023-12-01',
      location: 'Lokossa, Bénin',
      avatar: 'MK',
      totalLoans: 1,
      activeLoans: 1,
      totalAmount: 300000,
      lastActivity: '2024-01-20',
      verified: false,
      role: 'client'
    }
  ];

  useEffect(() => {
    // Simulation du chargement des données
    setTimeout(() => {
      setUsers(mockUsers);
        setLoading(false);
    }, 1000);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    pendingUsers: users.filter(u => u.status === 'pending').length,
    suspendedUsers: users.filter(u => u.status === 'suspended').length,
    verifiedUsers: users.filter(u => u.verified).length,
    totalLoans: users.reduce((sum, user) => sum + user.totalLoans, 0),
    totalAmount: users.reduce((sum, user) => sum + user.totalAmount, 0)
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      default: return 'text-neutral-600 bg-neutral-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'suspended': return <UserX size={16} />;
      default: return <UserCheck size={16} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'pending': return 'En attente';
      case 'suspended': return 'Suspendu';
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
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleApproveUser = async (userId) => {
    try {
      // Simulation d'API
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: 'active' } : user
      ));
      showSuccess('Utilisateur approuvé avec succès');
    } catch (error) {
      showError('Erreur lors de l\'approbation');
    }
  };

  const handleSuspendUser = async (userId) => {
    try {
      // Simulation d'API
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: 'suspended' } : user
      ));
      showSuccess('Utilisateur suspendu avec succès');
    } catch (error) {
      showError('Erreur lors de la suspension');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      // Simulation d'API
      setUsers(users.filter(user => user.id !== userId));
      showSuccess('Utilisateur supprimé avec succès');
    } catch (error) {
      showError('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-accent-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-lg text-neutral-600 font-montserrat">Chargement des utilisateurs...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent-50">
      {/* Header avec design moderne */}
      <div className="relative overflow-hidden">
        {/* Background avec gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 opacity-10"></div>
        
        {/* Pattern décoratif */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
              </div>

        {/* Contenu Header */}
        <div className="relative px-4 lg:px-8 py-8 lg:py-12">
          <div className="max-w-7xl mx-auto">
            {/* En-tête avec salutation */}
            <div className="text-center mb-8 lg:mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-6"
              >
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-700 font-montserrat">
                Gestion des Utilisateurs
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl lg:text-6xl font-bold text-secondary-900 font-montserrat mb-4"
              >
                Gestion des <span className="text-blue-600">Utilisateurs</span> 👥
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg lg:text-xl text-neutral-600 font-montserrat max-w-3xl mx-auto leading-relaxed"
              >
                Supervisez et gérez tous les utilisateurs de AB PRET avec des outils avancés et des insights détaillés.
              </motion.p>
            </div>

            {/* Statistiques avec design moderne */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-soft hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Users size={20} className="text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                    Total
                  </span>
                </div>
                <p className="text-2xl font-bold text-secondary-900 font-montserrat mb-1">
                  {stats.totalUsers}
                </p>
                <p className="text-sm text-neutral-600 font-montserrat">
                  Utilisateurs inscrits
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-soft hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <UserCheck size={20} className="text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                    Actifs
                  </span>
                </div>
                <p className="text-2xl font-bold text-secondary-900 font-montserrat mb-1">
                  {stats.activeUsers}
                </p>
                <p className="text-sm text-neutral-600 font-montserrat">
                  Utilisateurs actifs
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-soft hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <Shield size={20} className="text-yellow-600" />
                  </div>
                  <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                    Vérifiés
                  </span>
                </div>
                <p className="text-2xl font-bold text-secondary-900 font-montserrat mb-1">
                  {stats.verifiedUsers}
                </p>
                <p className="text-sm text-neutral-600 font-montserrat">
                  Comptes vérifiés
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-soft hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <CreditCard size={20} className="text-purple-600" />
                  </div>
                  <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                    Total
                  </span>
                </div>
                <p className="text-2xl font-bold text-secondary-900 font-montserrat mb-1">
                  {formatCurrency(stats.totalAmount)}
                </p>
                <p className="text-sm text-neutral-600 font-montserrat">
                  Montant total prêté
                </p>
              </div>
            </motion.div>

            {/* Actions rapides */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8"
            >
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Download size={16} />
                  <span>Exporter</span>
                </Button>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Nouvel utilisateur</span>
                </Button>
              </div>

              <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm rounded-xl p-1 border border-white/50">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-blue-100 text-blue-600' 
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
                      ? 'bg-blue-100 text-blue-600' 
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
            </motion.div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="px-4 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Filtres et recherche modernes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-6 mb-8 border border-white/50"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
              <div className="flex-1">
                <div className="relative">
                  <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, email ou téléphone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-white/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter size={20} className="text-neutral-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actifs</option>
                    <option value="pending">En attente</option>
                    <option value="suspended">Suspendus</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Liste des utilisateurs avec design moderne */}
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
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
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {user.avatar}
                          </div>
                          <div>
                            <h3 className="font-bold text-secondary-900 font-montserrat">
                              {user.firstName} {user.lastName}
                            </h3>
                            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                              {getStatusIcon(user.status)}
                              <span>{getStatusText(user.status)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {user.verified && (
                            <div className="p-1 bg-green-100 rounded-full">
                              <Shield size={14} className="text-green-600" />
                            </div>
                          )}
                          <button className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors">
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Informations de contact */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-neutral-600">
                          <MailIcon size={14} />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-neutral-600">
                          <PhoneIcon size={14} />
                          <span>{user.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-neutral-600">
                          <MapPinIcon size={14} />
                          <span>{user.location}</span>
                        </div>
                      </div>

                      {/* Statistiques utilisateur */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-neutral-50 rounded-lg p-3 text-center">
                          <p className="text-lg font-bold text-secondary-900">{user.totalLoans}</p>
                          <p className="text-xs text-neutral-600">Prêts totaux</p>
                        </div>
                        <div className="bg-neutral-50 rounded-lg p-3 text-center">
                          <p className="text-lg font-bold text-secondary-900">{formatCurrency(user.totalAmount)}</p>
                          <p className="text-xs text-neutral-600">Montant total</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                        >
                          <Eye size={14} />
                          <span>Voir détails</span>
                        </button>
                        <div className="flex items-center space-x-1">
                          {user.status === 'pending' && (
                            <button
                              onClick={() => handleApproveUser(user.id)}
                              className="p-1 text-green-600 hover:text-green-700 transition-colors"
                              title="Approuver"
                            >
                              <UserCheck size={14} />
                            </button>
                          )}
                          {user.status === 'active' && (
                            <button
                              onClick={() => handleSuspendUser(user.id)}
                              className="p-1 text-yellow-600 hover:text-yellow-700 transition-colors"
                              title="Suspendre"
                            >
                              <UserX size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1 text-red-600 hover:text-red-700 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
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
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-soft overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Utilisateur</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Statut</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Prêts</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Inscription</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {filteredUsers.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-neutral-50/30 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {user.avatar}
                              </div>
                              <div>
                                <p className="font-medium text-secondary-900">{user.firstName} {user.lastName}</p>
                                <p className="text-sm text-neutral-500">{user.location}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="text-sm text-secondary-900">{user.email}</p>
                              <p className="text-sm text-neutral-500">{user.phone}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                              {getStatusIcon(user.status)}
                              <span>{getStatusText(user.status)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-secondary-900">{user.totalLoans} prêts</p>
                              <p className="text-xs text-neutral-500">{formatCurrency(user.totalAmount)}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-neutral-600">{formatDate(user.registrationDate)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleViewUser(user)}
                                className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                                title="Voir détails"
                              >
                                <Eye size={16} />
                              </button>
                              {user.status === 'pending' && (
                                <button
                                  onClick={() => handleApproveUser(user.id)}
                                  className="p-1 text-green-600 hover:text-green-700 transition-colors"
                                  title="Approuver"
                                >
                                  <UserCheck size={16} />
                                </button>
                              )}
                              {user.status === 'active' && (
                                <button
                                  onClick={() => handleSuspendUser(user.id)}
                                  className="p-1 text-yellow-600 hover:text-yellow-700 transition-colors"
                                  title="Suspendre"
                                >
                                  <UserX size={16} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-1 text-red-600 hover:text-red-700 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message si aucun utilisateur */}
          {filteredUsers.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-neutral-400" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">Aucun utilisateur trouvé</h3>
              <p className="text-neutral-600">Aucun utilisateur ne correspond à vos critères de recherche.</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Modal de détails utilisateur */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUserModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-secondary-900 font-montserrat">
                    Détails de l'utilisateur
                  </h2>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    <XCircle size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* En-tête utilisateur */}
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {selectedUser.avatar}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-secondary-900 font-montserrat">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h3>
                      <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(selectedUser.status)}`}>
                        {getStatusIcon(selectedUser.status)}
                        <span>{getStatusText(selectedUser.status)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Informations de contact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <MailIcon size={20} className="text-neutral-400" />
                        <div>
                          <p className="text-sm text-neutral-500">Email</p>
                          <p className="font-medium text-secondary-900">{selectedUser.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <PhoneIcon size={20} className="text-neutral-400" />
                        <div>
                          <p className="text-sm text-neutral-500">Téléphone</p>
                          <p className="font-medium text-secondary-900">{selectedUser.phone}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <MapPinIcon size={20} className="text-neutral-400" />
                        <div>
                          <p className="text-sm text-neutral-500">Localisation</p>
                          <p className="font-medium text-secondary-900">{selectedUser.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CalendarIcon size={20} className="text-neutral-400" />
                        <div>
                          <p className="text-sm text-neutral-500">Inscription</p>
                          <p className="font-medium text-secondary-900">{formatDate(selectedUser.registrationDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Statistiques */}
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <h4 className="font-semibold text-secondary-900 mb-3">Statistiques</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-secondary-900">{selectedUser.totalLoans}</p>
                        <p className="text-sm text-neutral-600">Prêts totaux</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-secondary-900">{selectedUser.activeLoans}</p>
                        <p className="text-sm text-neutral-600">Prêts actifs</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-secondary-900">{formatCurrency(selectedUser.totalAmount)}</p>
                        <p className="text-sm text-neutral-600">Montant total</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-200">
                    <Button
                      variant="outline"
                      onClick={() => setShowUserModal(false)}
                    >
                      Fermer
                    </Button>
                    {selectedUser.status === 'pending' && (
                      <Button
                        onClick={() => {
                          handleApproveUser(selectedUser.id);
                          setShowUserModal(false);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <UserCheck size={16} className="mr-2" />
                        Approuver
                      </Button>
                    )}
                    {selectedUser.status === 'active' && (
                      <Button
                        onClick={() => {
                          handleSuspendUser(selectedUser.id);
                          setShowUserModal(false);
                        }}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        <UserX size={16} className="mr-2" />
                        Suspendre
                      </Button>
                    )}
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