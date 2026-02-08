import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPayments } from '../../utils/supabaseAPI';
import {
  ArrowLeft,
  Calendar,
  Receipt,
  RefreshCw,
  ChevronRight,
  Search,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import TransactionDrawer from './TransactionDrawer';

const PERIODS = [
  { id: 'day', label: 'Aujourd\'hui' },
  { id: 'week', label: 'Cette semaine' },
  { id: 'month', label: 'Ce mois' },
  { id: 'quarter', label: 'Ce trimestre' },
  { id: 'year', label: 'Cette année' }
];

function getPeriodRange(periodId) {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  let start = new Date(now);

  switch (periodId) {
    case 'day':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      break;
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'quarter':
      const q = Math.floor(now.getMonth() / 3) + 1;
      start.setMonth((q - 1) * 3, 1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'year':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      break;
    default:
      start.setMonth(start.getMonth() - 1);
  }
  return { start, end };
}

function isInRange(dateStr, start, end) {
  const d = new Date(dateStr);
  return d >= start && d <= end;
}

const formatDateForInput = (d) => d.toISOString().slice(0, 10);

const Transactions = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const now = useMemo(() => new Date(), []);
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 1);
    return formatDateForInput(d);
  });
  const [customEndDate, setCustomEndDate] = useState(() => formatDateForInput(now));

  const range = useMemo(() => {
    if (period === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    return getPeriodRange(period);
  }, [period, customStartDate, customEndDate]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const result = await getPayments();
      if (result.success) {
        setTransactions(result.data || []);
      }
    } catch (error) {
      console.error('[TRANSACTIONS] Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    const { start, end } = range;
    let filtered = transactions.filter(t => {
      const transactionDate = t.payment_date || t.created_at;
      return isInRange(transactionDate, start, end);
    });

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => {
        const user = t.users || t.loans?.users;
        const userName = user ? `${user.first_name} ${user.last_name}`.toLowerCase() : '';
        const userEmail = user?.email?.toLowerCase() || '';
        const amount = formatCurrency(t.amount || 0).toLowerCase();
        return userName.includes(term) || userEmail.includes(term) || amount.includes(term);
      });
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.payment_date || a.created_at);
      const dateB = new Date(b.payment_date || b.created_at);
      return dateB - dateA;
    });
  }, [transactions, range, searchTerm]);

  const stats = useMemo(() => {
    const total = filteredTransactions.length;
    const totalAmount = filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const successCount = filteredTransactions.filter(t => 
      t.status === 'completed' || t.status === 'success'
    ).length;
    const failedCount = filteredTransactions.filter(t => 
      t.status === 'failed' || t.status === 'overdue'
    ).length;
    const pendingCount = filteredTransactions.filter(t => 
      t.status === 'pending' || t.status === 'processing'
    ).length;

    return { total, totalAmount, successCount, failedCount, pendingCount };
  }, [filteredTransactions]);

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setIsDrawerOpen(true);
  };

  const getStatusIcon = (status) => {
    if (status === 'completed' || status === 'success') {
      return <CheckCircle size={20} className="text-green-600" />;
    }
    if (status === 'failed' || status === 'overdue') {
      return <XCircle size={20} className="text-red-600" />;
    }
    return <Clock size={20} className="text-yellow-600" />;
  };

  const getStatusBadge = (status) => {
    if (status === 'completed' || status === 'success') {
      return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">Réussi</span>;
    }
    if (status === 'failed' || status === 'overdue') {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium">Échoué</span>;
    }
    return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium">En attente</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-24">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="p-2 rounded-xl bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
                aria-label="Retour"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="p-2.5 bg-purple-100 rounded-xl">
                <Receipt size={24} className="text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-montserrat">Transactions</h1>
                <p className="text-sm text-gray-500">Gestion et suivi des transactions</p>
              </div>
            </div>
            <button
              type="button"
              onClick={loadTransactions}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline text-sm font-medium">Actualiser</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-500 border-t-transparent" />
            <p className="text-gray-500 text-sm">Chargement des transactions...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Receipt size={18} className="text-purple-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Total</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign size={18} className="text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Montant total</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle size={18} className="text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Réussies</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.successCount}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <XCircle size={18} className="text-red-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Échouées</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.failedCount}</p>
              </div>
            </div>

            {/* Filtre période */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-purple-600" />
                Période
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {PERIODS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPeriod(p.id)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      period === p.id && period !== 'custom'
                        ? 'bg-purple-500 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-purple-50 hover:border-purple-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {/* Sélection de dates précises */}
              <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={20} className="text-purple-600 flex-shrink-0" />
                  <span className="text-sm font-medium">Dates personnalisées</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 whitespace-nowrap">Du</span>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => {
                        setCustomStartDate(e.target.value);
                        setPeriod('custom');
                        if (e.target.value > customEndDate) setCustomEndDate(e.target.value);
                      }}
                      className="px-3 py-2 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-gray-900"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 whitespace-nowrap">au</span>
                    <input
                      type="date"
                      value={customEndDate}
                      min={customStartDate}
                      onChange={(e) => {
                        setCustomEndDate(e.target.value);
                        setPeriod('custom');
                        if (e.target.value < customStartDate) setCustomStartDate(e.target.value);
                      }}
                      className="px-3 py-2 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-gray-900"
                    />
                  </label>
                  {period === 'custom' && (
                    <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-lg">Personnalisé</span>
                  )}
                </div>
              </div>
            </div>

            {/* Recherche */}
            <div className="mb-6">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email ou montant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                />
              </div>
            </div>

            {/* Liste des transactions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {filteredTransactions.length === 0 ? (
                <div className="p-12 text-center">
                  <Receipt size={64} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Aucune transaction trouvée</p>
                  <p className="text-sm text-gray-400 mt-2">Essayez de modifier les filtres</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredTransactions.map((transaction) => {
                    const user = transaction.users || transaction.loans?.users;
                    const paymentDate = transaction.payment_date || transaction.created_at;
                    const dateObj = new Date(paymentDate);
                    const formattedDate = dateObj.toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    });
                    const formattedTime = dateObj.toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    });

                    return (
                      <div
                        key={transaction.id}
                        onClick={() => handleTransactionClick(transaction)}
                        className="p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {getStatusIcon(transaction.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {user ? `${user.first_name} ${user.last_name}` : 'Utilisateur inconnu'}
                                </p>
                                {user?.email && (
                                  <p className="text-sm text-gray-500">{user.email}</p>
                                )}
                              </div>
                              {getStatusBadge(transaction.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="font-bold text-purple-600">{formatCurrency(transaction.amount || 0)}</span>
                              <span>•</span>
                              <span>{formattedDate}</span>
                              <span>•</span>
                              <span>{formattedTime}</span>
                            </div>
                          </div>
                          <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Drawer */}
      <TransactionDrawer
        transaction={selectedTransaction}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedTransaction(null);
        }}
      />
    </div>
  );
};

export default Transactions;
