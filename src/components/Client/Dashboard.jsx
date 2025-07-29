import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';

import Card from '../UI/Card';
import Button from '../UI/Button';
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus,
  History,
  Wallet,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { LOAN_CONFIG } from '../../utils/loanConfig';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
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

      // Exemple d'ajout de notification (à supprimer en production)
      setTimeout(() => {
        addNotification({
          type: 'info',
          title: 'Bienvenue !',
          message: 'Votre tableau de bord a été mis à jour avec les dernières informations.',
          time: 'À l\'instant'
        });
      }, 2000);
    }, 1000);
  }, [addNotification]);

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
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-4 px-4 pt-4">
        {/* Header mobile-first */}
        <div className="flex flex-col space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-montserrat">
              Bonjour, AVOCE Elodie ! 👋
            </h1>
            <p className="text-gray-600 font-montserrat">
              Voici un aperçu de vos prêts
            </p>
          </div>
          
          <Button 
            onClick={() => navigate('/loan-request')}
            className="flex items-center justify-center space-x-2 w-full bg-primary-500 hover:bg-primary-600"
          >
            <Plus size={20} />
            <span className="font-medium">Nouveau prêt</span>
          </Button>
        </div>

      {/* Statistiques - Version mobile optimisée */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 font-montserrat">Total emprunté</p>
              <p className="text-lg font-bold text-gray-900 font-montserrat">
                {formatCurrency(stats.totalLoaned)}
              </p>
            </div>
            <div className="p-2 bg-primary-100 rounded-full">
              <CreditCard className="h-5 w-5 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 font-montserrat">Total remboursé</p>
              <p className="text-lg font-bold text-gray-900 font-montserrat">
                {formatCurrency(stats.totalRepaid)}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 font-montserrat">À rembourser</p>
              <p className="text-lg font-bold text-gray-900 font-montserrat">
                {formatCurrency(stats.amountToRepay)}
              </p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-full">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 font-montserrat">Prêts actifs</p>
              <p className="text-lg font-bold text-gray-900 font-montserrat">
                {stats.activeLoans}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Prêts récents - Version mobile optimisée */}
      <Card title="Prêts récents" className="bg-white">
        {recentLoans.length > 0 ? (
          <div className="space-y-3">
            {recentLoans.map((loan) => (
              <div 
                key={loan.id}
                className="p-3 border border-gray-200 rounded-xl hover:shadow-sm transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                    {getStatusText(loan.status)}
                  </span>
                  <p className="font-bold text-gray-900 font-montserrat">
                    {formatCurrency(loan.amount)}
                  </p>
                </div>
                
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-montserrat">Demande:</span>
                    <span className="font-medium text-gray-900 font-montserrat">
                      {new Date(loan.requestDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-montserrat">Échéance:</span>
                    <span className="font-medium text-gray-900 font-montserrat">
                      {new Date(loan.dueDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
                
                {loan.status === 'active' && (
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <Button
                      size="sm"
                      onClick={() => navigate('/repayment')}
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white"
                    >
                      <Wallet size={14} className="mr-1" />
                      Rembourser
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 font-montserrat">Aucun prêt récent</p>
          </div>
        )}
      </Card>

      {/* Informations sur les taux - Version mobile compacte */}
      <div className="grid grid-cols-1 gap-3">
        <Card title="Taux d'intérêt actuels" className="bg-white">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <TrendingUp size={16} className="text-green-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-gray-900 font-montserrat">Prêts courts</p>
              <p className="text-lg font-bold text-green-600 font-montserrat">{LOAN_CONFIG.interestRates.shortTerm}%</p>
              <p className="text-xs text-gray-600 font-montserrat">1-2 semaines</p>
            </div>
            
            <div className="text-center p-3 bg-orange-50 rounded-xl">
              <TrendingUp size={16} className="text-orange-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-gray-900 font-montserrat">Prêts longs</p>
              <p className="text-lg font-bold text-orange-600 font-montserrat">{LOAN_CONFIG.interestRates.longTerm}%</p>
              <p className="text-xs text-gray-600 font-montserrat">&gt; 1 mois</p>
            </div>
          </div>
        </Card>

        <Card title="Durées disponibles" className="bg-white">
          <div className="grid grid-cols-3 gap-2">
            {LOAN_CONFIG.durations.map((duration) => (
              <div key={duration.value} className="text-center p-2 bg-accent-50 rounded-lg">
                <Calendar size={14} className="text-primary-600 mx-auto mb-1" />
                <span className="text-xs font-medium text-gray-900 font-montserrat">{duration.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Actions rapides - Version mobile simplifiée */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={() => navigate('/loan-request')}
          className="p-4 h-auto flex-col space-y-2 bg-white"
        >
          <Plus size={20} className="text-primary-600" />
          <span className="font-medium text-sm">Nouveau prêt</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate('/repayment')}
          className="p-4 h-auto flex-col space-y-2 bg-white"
        >
          <Wallet size={20} className="text-primary-600" />
          <span className="font-medium text-sm">Rembourser</span>
        </Button>
      </div>

      {/* Actions rapides - Version desktop */}
      <div className="hidden lg:grid grid-cols-3 gap-4">
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
    </div>
  );
};

export default ClientDashboard;