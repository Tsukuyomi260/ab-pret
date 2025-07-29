import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Card from '../UI/Card';
import Button from '../UI/Button';
import { ArrowLeft, Search, Filter, Download } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';

const LoanHistory = () => {

  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Simulation des données (à remplacer par des appels API)
    setTimeout(() => {
      setLoans([
        {
          id: 1,
          amount: 75000,
          status: 'active',
          requestDate: '2025-07-01',
          dueDate: '2025-08-01',
          monthlyPayment: 82500,
          totalAmount: 82500,
          paidAmount: 0,
          remainingAmount: 82500
        },
        {
          id: 2,
          amount: 50000,
          status: 'completed',
          requestDate: '2025-06-01',
          dueDate: '2025-06-30',
          monthlyPayment: 55000,
          totalAmount: 55000,
          paidAmount: 55000,
          remainingAmount: 0
        },
        {
          id: 3,
          amount: 100000,
          status: 'pending',
          requestDate: '2025-08-15',
          dueDate: null,
          monthlyPayment: null,
          totalAmount: null,
          paidAmount: 0,
          remainingAmount: null
        },
        {
          id: 4,
          amount: 150000,
          status: 'rejected',
          requestDate: '2025-07-20',
          dueDate: null,
          monthlyPayment: null,
          totalAmount: null,
          paidAmount: 0,
          remainingAmount: null
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

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

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.id.toString().includes(searchTerm) || 
                         formatCurrency(loan.amount).includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportHistory = () => {
    // Simulation d'export
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Montant,Statut,Date de demande,Échéance,Montant total,Reste à payer\n" +
      filteredLoans.map(loan => 
        `${loan.id},${loan.amount},${getStatusText(loan.status)},${formatDate(loan.requestDate)},${loan.dueDate ? formatDate(loan.dueDate) : 'N/A'},${loan.totalAmount || 'N/A'},${loan.remainingAmount || 'N/A'}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "historique_prets.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header centré style Apple */}
      <div className="text-center py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 font-montserrat mb-3">
            Historique des prêts
          </h1>
          <p className="text-lg text-gray-600 font-montserrat leading-relaxed">
            Consultez tous vos prêts et leur statut en temps réel
          </p>
        </div>
      </div>

      {/* Contenu principal centré */}
      <div className="max-w-6xl mx-auto px-4 pb-8">

        {/* Filtres modernes */}
        <div className="mb-8">
          <Card className="bg-white/90 backdrop-blur-sm border-white/20">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par ID ou montant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter size={20} className="text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="completed">Remboursés</option>
                  <option value="pending">En attente</option>
                  <option value="rejected">Rejetés</option>
                </select>
              </div>
            </div>
          </Card>
        </div>

        {/* Liste des prêts modernisée */}
        <Card className="bg-white/90 backdrop-blur-sm border-white/20">
          {filteredLoans.length > 0 ? (
            <div className="space-y-6">
              {filteredLoans.map((loan) => (
                <div 
                  key={loan.id}
                  className="border border-gray-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 bg-white/60 backdrop-blur-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 font-montserrat">
                          Prêt #{loan.id}
                        </h3>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}>
                          {getStatusText(loan.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div className="p-3 bg-accent-50/50 rounded-xl">
                          <span className="text-gray-600 text-xs uppercase tracking-wide">Montant demandé</span>
                          <p className="font-semibold text-lg text-gray-900">{formatCurrency(loan.amount)}</p>
                        </div>
                        <div className="p-3 bg-accent-50/50 rounded-xl">
                          <span className="text-gray-600 text-xs uppercase tracking-wide">Date de demande</span>
                          <p className="font-semibold text-lg text-gray-900">{formatDate(loan.requestDate)}</p>
                        </div>
                        {loan.dueDate && (
                          <div className="p-3 bg-accent-50/50 rounded-xl">
                            <span className="text-gray-600 text-xs uppercase tracking-wide">Échéance</span>
                            <p className="font-semibold text-lg text-gray-900">{formatDate(loan.dueDate)}</p>
                          </div>
                        )}
                      </div>

                      {loan.status === 'active' && (
                        <div className="mt-6 p-6 bg-blue-50/80 rounded-2xl border border-blue-200/50">
                          <h4 className="font-semibold text-blue-900 mb-4">Détails du remboursement</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                            <div>
                              <span className="text-blue-700 text-xs uppercase tracking-wide">Mensualité</span>
                              <p className="font-semibold text-lg text-blue-900">{formatCurrency(loan.monthlyPayment)}</p>
                            </div>
                            <div>
                              <span className="text-blue-700 text-xs uppercase tracking-wide">Total à rembourser</span>
                              <p className="font-semibold text-lg text-blue-900">{formatCurrency(loan.totalAmount)}</p>
                            </div>
                            <div>
                              <span className="text-blue-700 text-xs uppercase tracking-wide">Reste à payer</span>
                              <p className="font-semibold text-lg text-blue-900">{formatCurrency(loan.remainingAmount)}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {loan.status === 'completed' && (
                        <div className="mt-6 p-6 bg-green-50/80 rounded-2xl border border-green-200/50">
                          <div className="flex items-center justify-between">
                            <span className="text-green-800 font-semibold text-lg">✅ Prêt entièrement remboursé</span>
                            <span className="text-green-600 font-bold text-xl">{formatCurrency(loan.paidAmount)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/loan-details/${loan.id}`)}
                        className="px-6 py-3 rounded-2xl font-medium"
                      >
                        Voir détails
                      </Button>
                      
                      {loan.status === 'active' && (
                        <Button
                          size="sm"
                          onClick={() => navigate('/repayment', { state: { loanId: loan.id } })}
                          className="px-6 py-3 rounded-2xl font-medium bg-primary-500 hover:bg-primary-600"
                        >
                          Rembourser
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-6">
                <Search size={80} className="mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 font-montserrat">Aucun prêt trouvé</h3>
              <p className="text-gray-500 mb-6 text-lg">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Aucun prêt ne correspond à vos critères de recherche'
                  : 'Vous n\'avez pas encore de prêts'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button 
                  onClick={() => navigate('/loan-request')}
                  className="px-8 py-4 text-lg rounded-2xl bg-primary-500 hover:bg-primary-600"
                >
                  Faire une demande
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* Bouton d'export flottant */}
        <div className="fixed bottom-24 right-6 z-10">
          <Button
            variant="outline"
            onClick={exportHistory}
            className="flex items-center space-x-2 px-4 py-3 rounded-full bg-white/90 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl"
          >
            <Download size={20} />
            <span className="hidden sm:inline">Exporter</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoanHistory;

