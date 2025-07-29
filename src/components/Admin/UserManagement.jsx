import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { useSupabaseNotifications } from '../../utils/useSupabaseNotifications';
import { getUsers, supabase } from '../../utils/supabaseClient';
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
  FileText,
  User,
  Bell
} from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';

const UserManagement = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useNotification();
  const { newUsers, isConnected } = useSupabaseNotifications();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Charger les utilisateurs depuis Supabase
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const result = await getUsers();
        if (result.success) {
          // Transformer les données pour correspondre au format attendu
          const transformedUsers = result.data.map(user => ({
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            phone: user.phone,
            studentId: user.id?.slice(0, 8) || 'N/A',
            status: user.status,
            approvedDate: user.status === 'approved' ? user.updated_at : null,
            filiere: user.filiere,
            anneeEtude: user.annee_etude,
            entite: user.entite,
            documents: [
              user.student_card_name,
              user.identity_card_name
            ].filter(Boolean)
          }));
          setUsers(transformedUsers);
        } else {
          showError('Erreur lors du chargement des utilisateurs');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        showError('Erreur lors du chargement des utilisateurs');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [showError]);

  // Recharger les utilisateurs quand il y a de nouvelles inscriptions
  useEffect(() => {
    if (newUsers.length > 0) {
      const loadUsers = async () => {
        try {
          const result = await getUsers();
          if (result.success) {
            const transformedUsers = result.data.map(user => ({
              id: user.id,
              firstName: user.first_name,
              lastName: user.last_name,
              email: user.email,
              phone: user.phone,
              studentId: user.id?.slice(0, 8) || 'N/A',
              status: user.status,
              approvedDate: user.status === 'approved' ? user.updated_at : null,
              filiere: user.filiere,
              anneeEtude: user.annee_etude,
              entite: user.entite,
              documents: [
                user.student_card_name,
                user.identity_card_name
              ].filter(Boolean)
            }));
            setUsers(transformedUsers);
          }
        } catch (error) {
          console.error('Erreur lors du rechargement des utilisateurs:', error);
        }
      };
      loadUsers();
    }
  }, [newUsers]);

  const handleApproveUser = async (userId) => {
    try {
      // Mettre à jour le statut dans Supabase
      const { error } = await supabase
        .from('users')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Mettre à jour l'état local
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                status: 'approved', 
                approvedDate: new Date().toISOString() 
              }
            : user
        )
      );
      
      showSuccess('Utilisateur approuvé avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      showError('Erreur lors de l\'approbation de l\'utilisateur');
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      // Mettre à jour le statut dans Supabase
      const { error } = await supabase
        .from('users')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Mettre à jour l'état local
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, status: 'rejected' }
            : user
        )
      );
      
      showSuccess('Utilisateur rejeté avec succès !');
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      showError('Erreur lors du rejet de l\'utilisateur');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      // Supprimer l'utilisateur de Supabase
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Mettre à jour l'état local
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      showSuccess('Utilisateur supprimé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showError('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const handleExportUsers = () => {
    try {
      const csvData = [
        ['Nom', 'Prénom', 'Email', 'Téléphone', 'Filière', 'Année', 'Entité', 'Statut', 'Date d\'inscription'],
        ...users.map(user => [
          user.lastName,
          user.firstName,
          user.email,
          user.phone,
          user.filiere,
          user.anneeEtude,
          user.entite,
          user.status,
          new Date(user.created_at || Date.now()).toLocaleDateString('fr-FR')
        ])
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `utilisateurs_ab_pret_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSuccess('Export des utilisateurs réussi !');
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      showError('Erreur lors de l\'export des utilisateurs');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = users.filter(u => u.status === 'pending').length;
  const approvedCount = users.filter(u => u.status === 'approved').length;
  const rejectedCount = users.filter(u => u.status === 'rejected').length;
  const totalCount = users.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-accent-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent-50">
      {/* Header */}
      <div className="bg-white shadow-soft border-b border-accent-200">
        <div className="px-4 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft size={16} />
                <span>Retour</span>
              </Button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-secondary-900 font-montserrat">
                  Gestion des utilisateurs
                </h1>
                <p className="text-neutral-600 font-montserrat">
                  Gérez les inscriptions et les comptes utilisateurs
                </p>
              </div>
            </div>
            
            {/* Indicateur de connexion temps réel */}
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                isConnected 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="font-medium">
                  {isConnected ? 'Temps réel actif' : 'Hors ligne'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-8 py-6">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 font-montserrat">En attente</p>
                <p className="text-xl font-bold text-secondary-900 font-montserrat">{pendingCount}</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 font-montserrat">Approuvés</p>
                <p className="text-xl font-bold text-secondary-900 font-montserrat">{approvedCount}</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-full">
                <XCircle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 font-montserrat">Rejetés</p>
                <p className="text-xl font-bold text-secondary-900 font-montserrat">{rejectedCount}</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-full">
                <Users size={20} className="text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 font-montserrat">Total</p>
                <p className="text-xl font-bold text-secondary-900 font-montserrat">{totalCount}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-xl shadow-soft p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email ou ID étudiant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-accent-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-neutral-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-accent-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvés</option>
                <option value="rejected">Rejetés</option>
              </select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportUsers}
                className="flex items-center space-x-2"
              >
                <FileText size={16} />
                <span>Exporter CSV</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="bg-white">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between p-4">
                <div className="flex-1 mb-4 lg:mb-0">
                  <div className="flex flex-col lg:flex-row lg:items-start space-y-2 lg:space-y-0 lg:space-x-3 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(user.status)}`}>
                        {getStatusIcon(user.status)}
                        <span>{getStatusText(user.status)}</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User size={16} className="text-neutral-400" />
                      <p className="font-medium text-secondary-900 font-montserrat">
                        {user.firstName} {user.lastName}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail size={16} className="text-neutral-400" />
                      <p className="font-medium text-secondary-900 font-montserrat">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-600 font-montserrat">Filière:</span>
                      <p className="font-medium text-secondary-900 font-montserrat">{user.filiere}</p>
                    </div>
                    <div>
                      <span className="text-neutral-600 font-montserrat">Année:</span>
                      <p className="font-medium text-secondary-900 font-montserrat">{user.anneeEtude}</p>
                    </div>
                    <div>
                      <span className="text-neutral-600 font-montserrat">Entité:</span>
                      <p className="font-medium text-secondary-900 font-montserrat">{user.entite}</p>
                    </div>
                    <div>
                      <span className="text-neutral-600 font-montserrat">ID Étudiant:</span>
                      <p className="font-medium text-secondary-900 font-montserrat">{user.studentId}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center space-x-4 text-xs text-neutral-500 font-montserrat">
                    <span>Documents: {user.documents?.length || 0}</span>
                    {user.approvedDate && (
                      <span>Approuvé le: {new Date(user.approvedDate).toLocaleDateString('fr-FR')}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 lg:flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setShowDetails(true);
                    }}
                  >
                    <Eye size={16} />
                  </Button>
                  
                  {user.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApproveUser(user.id)}
                      >
                        <UserCheck size={16} />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRejectUser(user.id)}
                      >
                        <UserX size={16} />
                      </Button>
                    </>
                  )}
                  
                  {/* Bouton de suppression pour tous les utilisateurs */}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <UserX size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          
          {filteredUsers.length === 0 && (
            <Card className="bg-white">
              <div className="text-center py-8">
                <Users size={48} className="mx-auto text-neutral-400 mb-4" />
                <p className="text-neutral-500 font-montserrat">
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
      {showDetails && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-large max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-secondary-900 font-montserrat">
                  Détails de l'utilisateur
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                >
                  <XCircle size={16} />
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Informations personnelles */}
                <div>
                  <h3 className="font-medium text-secondary-900 font-montserrat mb-3">Informations personnelles</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-600 font-montserrat">Nom complet:</span>
                      <p className="font-medium text-secondary-900 font-montserrat">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </p>
                    </div>
                    <div>
                      <span className="text-neutral-600 font-montserrat">Email:</span>
                      <p className="font-medium text-secondary-900 font-montserrat">{selectedUser.email}</p>
                    </div>
                    <div>
                      <span className="text-neutral-600 font-montserrat">Téléphone:</span>
                      <p className="font-medium text-secondary-900 font-montserrat">{selectedUser.phone}</p>
                    </div>
                    <div>
                      <span className="text-neutral-600 font-montserrat">ID Étudiant:</span>
                      <p className="font-medium text-secondary-900 font-montserrat">{selectedUser.studentId}</p>
                    </div>
                  </div>
                </div>
                
                {/* Informations académiques */}
                <div>
                  <h3 className="font-medium text-secondary-900 font-montserrat mb-3">Informations académiques</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-600 font-montserrat">Filière:</span>
                      <p className="font-medium text-secondary-900 font-montserrat">{selectedUser.filiere}</p>
                    </div>
                    <div>
                      <span className="text-neutral-600 font-montserrat">Année d'étude:</span>
                      <p className="font-medium text-secondary-900 font-montserrat">{selectedUser.anneeEtude}</p>
                    </div>
                    <div>
                      <span className="text-neutral-600 font-montserrat">Entité:</span>
                      <p className="font-medium text-secondary-900 font-montserrat">{selectedUser.entite}</p>
                    </div>
                    {selectedUser.approvedDate && (
                      <div>
                        <span className="text-neutral-600 font-montserrat">Date d'approbation:</span>
                        <p className="font-medium text-secondary-900 font-montserrat">
                          {new Date(selectedUser.approvedDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Documents */}
                {selectedUser.documents && selectedUser.documents.length > 0 && (
                  <div>
                    <h3 className="font-medium text-secondary-900 font-montserrat mb-3">Documents fournis</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.documents.map((doc, index) => (
                        <span key={index} className="px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-xs font-medium">
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                {selectedUser.status === 'pending' && (
                  <div className="flex space-x-3 pt-4 border-t border-accent-200">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        handleApproveUser(selectedUser.id);
                        setShowDetails(false);
                      }}
                    >
                      <UserCheck size={16} className="mr-2" />
                      Approuver
                    </Button>
                    <Button
                      variant="danger"
                      className="flex-1"
                      onClick={() => {
                        handleRejectUser(selectedUser.id);
                        setShowDetails(false);
                      }}
                    >
                      <UserX size={16} className="mr-2" />
                      Rejeter
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
