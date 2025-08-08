import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  User
} from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';

const LoanRequests = () => {
  const navigate = useNavigate();
  const [loanRequests, setLoanRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      // Simulation du chargement
    setTimeout(() => {
      const mockRequests = [
        {
          id: 1,
            user: { firstName: 'Utilisateur', lastName: 'A', email: 'utilisateur.a@email.com' },
          amount: 75000,
            purpose: 'Achat de matériel informatique',
          status: 'pending',
          requestDate: '2025-01-15',
          priority: 'high'
        },
        {
          id: 2,
            user: { firstName: 'Utilisateur', lastName: 'B', email: 'utilisateur.b@email.com' },
          amount: 120000,
            purpose: 'Rénovation de boutique',
          status: 'approved',
          requestDate: '2025-01-14',
          priority: 'medium'
        },
        {
          id: 3,
            user: { firstName: 'Utilisateur', lastName: 'C', email: 'utilisateur.c@email.com' },
          amount: 50000,
            purpose: 'Frais de scolarité',
          status: 'rejected',
          requestDate: '2025-01-13',
          priority: 'low'
          }
        ];
      setLoanRequests(mockRequests);
      setLoading(false);
    }, 1000);
    } catch (error) {
      console.error('[ADMIN] Erreur lors du chargement des demandes:', error.message);
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      // Simulation d'approbation
      setLoanRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status: 'approved' } : req
        )
      );
    } catch (error) {
      console.error('[ADMIN] Erreur lors de l\'approbation:', error.message);
    }
  };

  const handleReject = async (requestId) => {
    try {
      // Simulation de rejet
      setLoanRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status: 'rejected' } : req
        )
      );
    } catch (error) {
      console.error('[ADMIN] Erreur lors du rejet:', error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Approuvé';
      case 'rejected': return 'Rejeté';
      case 'pending': return 'En attente';
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
                            </div>
                    </div>
                  </div>
                  
                {/* Actions */}
                  {request.status === 'pending' && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-4 border-t border-gray-100">
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
                    <Button
                      variant="outline"
                      className="flex items-center justify-center space-x-2 text-sm"
                    >
                      <Eye size={16} />
                      <span>Voir détails</span>
                      </Button>
                  </div>
                  )}
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
    </div>
  );
};

export default LoanRequests; 