import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  DollarSign,
  Calendar,
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
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

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
            studentId: '2023-001'
          },
          amount: 75000,
          purpose: 'Achat de matériel informatique pour projet académique',
          description: 'Besoin d\'un ordinateur portable et d\'accessoires pour mon projet de fin d\'études en informatique.',
          status: 'pending',
          requestDate: '2025-01-15',
          documents: ['Carte étudiant', 'Justificatif de revenus', 'Devis matériel'],
          repaymentPlan: '6 mois',
          monthlyPayment: 12500
        },
        {
          id: 2,
          user: {
            firstName: 'Fatou',
            lastName: 'Diallo',
            email: 'fatou.diallo@email.com',
            phone: '+229 90234567',
            studentId: '2023-002'
          },
          amount: 120000,
          purpose: 'Rénovation de boutique de cosmétiques',
          description: 'Je souhaite rénover ma petite boutique de cosmétiques pour améliorer l\'expérience client.',
          status: 'approved',
          requestDate: '2025-01-14',
          documents: ['Carte d\'identité', 'Plan de rénovation', 'Devis travaux'],
          repaymentPlan: '12 mois',
          monthlyPayment: 10000
        },
        {
          id: 3,
          user: {
            firstName: 'Moussa',
            lastName: 'Traoré',
            email: 'moussa.traore@email.com',
            phone: '+229 90345678',
            studentId: '2023-003'
          },
          amount: 50000,
          purpose: 'Frais de scolarité et fournitures',
          description: 'Besoin d\'aide pour payer mes frais de scolarité et acheter les fournitures nécessaires.',
          status: 'rejected',
          requestDate: '2025-01-13',
          documents: ['Carte étudiant', 'Attestation de scolarité'],
          repaymentPlan: '4 mois',
          monthlyPayment: 12500
        },
        {
          id: 4,
          user: {
            firstName: 'Aïcha',
            lastName: 'Bello',
            email: 'aicha.bello@email.com',
            phone: '+229 90456789',
            studentId: '2023-004'
          },
          amount: 85000,
          purpose: 'Achat de machine à coudre professionnelle',
          description: 'Je veux acheter une machine à coudre professionnelle pour développer mon activité de couture.',
          status: 'pending',
          requestDate: '2025-01-16',
          documents: ['Carte d\'identité', 'Devis machine', 'Plan d\'affaires'],
          repaymentPlan: '8 mois',
          monthlyPayment: 10625
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
                  Demandes de prêt
                </h1>
                <p className="text-neutral-600 font-montserrat">
                  Gérez et validez les demandes de prêt des clients
                </p>
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
                <p className="text-sm text-neutral-600 font-montserrat">Approuvées</p>
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
                <p className="text-sm text-neutral-600 font-montserrat">Rejetées</p>
                <p className="text-xl font-bold text-secondary-900 font-montserrat">{rejectedCount}</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-full">
                <DollarSign size={20} className="text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 font-montserrat">Total</p>
                <p className="text-xl font-bold text-secondary-900 font-montserrat">{loanRequests.length}</p>
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
                  placeholder="Rechercher par nom, email ou objet..."
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
                <option value="approved">Approuvées</option>
                <option value="rejected">Rejetées</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des demandes */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="bg-white">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between p-4">
                <div className="flex-1 mb-4 lg:mb-0">
                  <div className="flex flex-col lg:flex-row lg:items-start space-y-2 lg:space-y-0 lg:space-x-3 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span>{getStatusText(request.status)}</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User size={16} className="text-neutral-400" />
                      <p className="font-medium text-secondary-900 font-montserrat">
                        {request.user.firstName} {request.user.lastName}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign size={16} className="text-neutral-400" />
                      <p className="font-medium text-secondary-900 font-montserrat">
                        {formatCurrency(request.amount)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-600 font-montserrat">Objet:</span>
                      <p className="font-medium text-secondary-900 font-montserrat truncate">{request.purpose}</p>
                    </div>
                    <div>
                      <span className="text-neutral-600 font-montserrat">Date:</span>
                      <p className="font-medium text-secondary-900 font-montserrat">
                        {new Date(request.requestDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <span className="text-neutral-600 font-montserrat">Remboursement:</span>
                      <p className="font-medium text-secondary-900 font-montserrat">{request.repaymentPlan}</p>
                    </div>
                    <div>
                      <span className="text-neutral-600 font-montserrat">Mensualité:</span>
                      <p className="font-medium text-secondary-900 font-montserrat">{formatCurrency(request.monthlyPayment)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center space-x-4 text-xs text-neutral-500 font-montserrat">
                    <span>Documents: {request.documents.length}</span>
                    <span>ID: {request.user.studentId}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2 lg:flex-shrink-0">
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
            </Card>
          ))}
          
          {filteredRequests.length === 0 && (
            <Card className="bg-white">
              <div className="text-center py-8">
                <FileText size={48} className="mx-auto text-neutral-400 mb-4" />
                <p className="text-neutral-500 font-montserrat">
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
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-large max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-secondary-900 font-montserrat">
                  Détails de la demande
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
                {/* Informations client */}
                <div>
                  <h3 className="font-medium text-secondary-900 font-montserrat mb-3">Informations client</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-600 font-montserrat">Nom complet:</span>
                      <p className="font-medium text-secondary-900 font-montserrat">
                        {selectedRequest.user.firstName} {selectedRequest.user.lastName}
                      </p>
                    </div>
                    <div>
                      <span className="text-neutral-600 font-montserrat">Email:</span>
                      <p className="font-medium text-secondary-900 font-montserrat">{selectedRequest.user.email}</p>
                    </div>
                    <div>
                      <span className="text-neutral-600 font-montserrat">Téléphone:</span>
                      <p className="font-medium text-secondary-900 font-montserrat">{selectedRequest.user.phone}</p>
                    </div>
                    <div>
                      <span className="text-neutral-600 font-montserrat">ID Étudiant:</span>
                      <p className="font-medium text-secondary-900 font-montserrat">{selectedRequest.user.studentId}</p>
                    </div>
                  </div>
                </div>
                
                {/* Détails du prêt */}
                <div>
                  <h3 className="font-medium text-secondary-900 font-montserrat mb-3">Détails du prêt</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-600 font-montserrat">Montant demandé:</span>
                      <p className="font-medium text-secondary-900 font-montserrat">{formatCurrency(selectedRequest.amount)}</p>
                    </div>
                    <div>
                      <span className="text-neutral-600 font-montserrat">Objet:</span>
                      <p className="font-medium text-secondary-900 font-montserrat">{selectedRequest.purpose}</p>
                    </div>
                    <div>
                      <span className="text-neutral-600 font-montserrat">Plan de remboursement:</span>
                      <p className="font-medium text-secondary-900 font-montserrat">{selectedRequest.repaymentPlan}</p>
                    </div>
                    <div>
                      <span className="text-neutral-600 font-montserrat">Mensualité:</span>
                      <p className="font-medium text-secondary-900 font-montserrat">{formatCurrency(selectedRequest.monthlyPayment)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                <div>
                  <h3 className="font-medium text-secondary-900 font-montserrat mb-3">Description détaillée</h3>
                  <p className="text-sm text-neutral-600 font-montserrat">{selectedRequest.description}</p>
                </div>
                
                {/* Documents */}
                <div>
                  <h3 className="font-medium text-secondary-900 font-montserrat mb-3">Documents fournis</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.documents.map((doc, index) => (
                      <span key={index} className="px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-xs font-medium">
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Actions */}
                {selectedRequest.status === 'pending' && (
                  <div className="flex space-x-3 pt-4 border-t border-accent-200">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        handleApprove(selectedRequest.id);
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
                        handleReject(selectedRequest.id);
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

export default LoanRequests; 