import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { motion } from 'framer-motion';
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
  User
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

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Simulation du chargement
      setTimeout(() => {
        const mockUsers = [
          {
            id: 1,
            firstName: 'Utilisateur',
            lastName: 'A',
            email: 'utilisateur.a@student.bj',
            phone: '+229 90123456',
            status: 'active',
            registrationDate: '2023-09-01',
            totalLoans: 3,
            activeLoans: 1,
            totalAmount: 1500000,
            verified: true
          },
          {
            id: 2,
            firstName: 'Utilisateur',
            lastName: 'B',
            email: 'utilisateur.b@student.bj',
            phone: '+229 90234567',
            status: 'active',
            registrationDate: '2023-10-15',
            totalLoans: 2,
            activeLoans: 0,
            totalAmount: 800000,
            verified: true
          },
          {
            id: 3,
            firstName: 'Utilisateur',
            lastName: 'C',
            email: 'utilisateur.c@student.bj',
            phone: '+229 90345678',
            status: 'pending',
            registrationDate: '2024-01-05',
            totalLoans: 0,
            activeLoans: 0,
            totalAmount: 0,
            verified: false
          }
        ];
        setUsers(mockUsers);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('[ADMIN] Erreur lors du chargement des utilisateurs:', error.message);
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, status: 'active' } : user
        )
      );
      showSuccess('Utilisateur approuvé avec succès');
    } catch (error) {
      console.error('[ADMIN] Erreur lors de l\'approbation:', error.message);
      showError('Erreur lors de l\'approbation');
    }
  };

  const handleSuspendUser = async (userId) => {
    try {
      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, status: 'suspended' } : user
        )
      );
      showSuccess('Utilisateur suspendu');
    } catch (error) {
      console.error('[ADMIN] Erreur lors de la suspension:', error.message);
      showError('Erreur lors de la suspension');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'suspended': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'suspended': return <XCircle size={16} />;
      default: return <Clock size={16} />;
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
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
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
                <option value="active">Actifs</option>
                <option value="pending">En attente</option>
                <option value="suspended">Suspendus</option>
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
                  {user.status === 'active' && (
                    <Button
                      onClick={() => handleSuspendUser(user.id)}
                      variant="outline"
                      className="flex items-center space-x-2 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <UserX size={16} />
                      <span>Suspendre</span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2"
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
    </div>
  );
};

export default UserManagement;