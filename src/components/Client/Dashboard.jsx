import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus,
  History,
  Wallet
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalLoaned: 0,
    totalRepaid: 0,
    amountToRepay: 0,
    activeLoans: 0
  });
  const [recentLoans, setRecentLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulation des données (à remplacer par des appels API)
    setTimeout(() => {
      setStats({
        totalLoaned: 35000,
        totalRepaid: 28000,
        amountToRepay: 7000,
        activeLoans: 1
      });
      
      setRecentLoans([
        {
          id: 1,
          amount: 35000,
          status: 'active',
          requestDate: '2025-07-01',
          dueDate: '2025-08-01'
        },
        {
          id: 2,
          amount: 50000,
          status: 'completed',
          requestDate: '2025-06-01',
          dueDate: '2025-06-30'
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'completed': return 'Remboursé';
      case 'pending': return 'En attente';
      case 'rejected': return 'Rejeté';
      default: return 'Inconnu';
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 px-4 lg:px-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            Bienvenue, AVOCE Elodie !
          </h1>
          <p className="text-sm lg:text-base text-gray-600">
            Voici un aperçu de vos prêts et remboursements
          </p>
        </div>
        
        <Button 
          onClick={() => navigate('/loan-request')}
          className="flex items-center space-x-2 w-full lg:w-auto"
        >
          <Plus size={20} />
          <span>Nouveau prêt</span>
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total emprunté</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalLoaned)}
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <CreditCard className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total remboursé</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalRepaid)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Montant à rembourser</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">
                {formatCurrency(stats.amountToRepay)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Prêts actifs</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">
                {stats.activeLoans}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Prêts récents */}
      <Card title="Prêts récents">
        {recentLoans.length > 0 ? (
          <div className="space-y-4">
            {recentLoans.map((loan) => (
              <div 
                key={loan.id}
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex-1 mb-4 lg:mb-0">
                  <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-4 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                      {getStatusText(loan.status)}
                    </span>
                    <p className="font-medium text-gray-900">
                      {formatCurrency(loan.amount)}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Date de demande:</span>
                      <p className="font-medium text-gray-900">{new Date(loan.requestDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Date d'échéance:</span>
                      <p className="font-medium text-gray-900">{new Date(loan.dueDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/loan-history/${loan.id}`)}
                  >
                    <History size={16} />
                  </Button>
                  
                  {loan.status === 'active' && (
                    <Button
                      size="sm"
                      onClick={() => navigate('/repayment')}
                    >
                      <Wallet size={16} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun prêt récent</p>
          </div>
        )}
      </Card>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <Button
          variant="outline"
          onClick={() => navigate('/loan-request')}
          className="p-6 h-auto flex-col space-y-2"
        >
          <Plus size={24} />
          <span className="font-medium">Demander un prêt</span>
          <span className="text-sm text-gray-500">Nouvelle demande de financement</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate('/repayment')}
          className="p-6 h-auto flex-col space-y-2"
        >
          <Wallet size={24} />
          <span className="font-medium">Rembourser</span>
          <span className="text-sm text-gray-500">Effectuer un paiement</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate('/loan-history')}
          className="p-6 h-auto flex-col space-y-2"
        >
          <History size={24} />
          <span className="font-medium">Historique</span>
          <span className="text-sm text-gray-500">Voir tous vos prêts</span>
        </Button>
      </div>
    </div>
  );
};

export default ClientDashboard;