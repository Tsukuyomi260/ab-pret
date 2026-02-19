import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLoans, getPayments } from '../../utils/supabaseAPI';
import {
  BarChart3,
  ArrowLeft,
  Calendar,
  TrendingUp,
  CreditCard,
  CheckCircle,
  DollarSign,
  Activity,
  RefreshCw,
  Target
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { formatCurrency } from '../../utils/helpers';

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

const AdminDetailedStatistics = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState([]);
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
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [loansRes, paymentsRes] = await Promise.all([
          getLoans(),
          getPayments()
        ]);
        if (!cancelled) {
          setLoans(loansRes.success ? loansRes.data || [] : []);
          setPayments(paymentsRes.success ? paymentsRes.data || [] : []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const stats = useMemo(() => {
    const { start, end } = range;
    const validated = (l) => l.approved_at && l.status !== 'pending' && l.status !== 'rejected';
    const completedLoans = loans.filter(l => l.status === 'completed' && l.approved_at);

    const loansCreatedInPeriod = loans.filter(l => isInRange(l.created_at, start, end));
    const loansValidatedInPeriod = loans.filter(l => l.approved_at && isInRange(l.approved_at, start, end));
    const paymentsInPeriod = payments.filter(p => isInRange(p.payment_date || p.created_at, start, end));

    const totalPaidInPeriod = paymentsInPeriod.reduce((s, p) => s + (p.amount || 0), 0);
    const principalValidatedInPeriod = loansValidatedInPeriod.reduce((s, l) => s + (l.amount || 0), 0);
    const interestValidatedInPeriod = loansValidatedInPeriod.reduce((s, l) => {
      return s + Math.round((l.amount || 0) * ((l.interest_rate || 0) / 100));
    }, 0);

    const completedInPeriod = completedLoans.filter(l => {
      const loanPayments = payments.filter(p => p.loan_id === l.id);
      const lastDate = loanPayments.length ? Math.max(...loanPayments.map(p => new Date(p.payment_date || p.created_at).getTime())) : new Date(l.updated_at || l.approved_at).getTime();
      return lastDate >= start.getTime() && lastDate <= end.getTime();
    });
    const interestCollectedInPeriod = completedInPeriod.reduce((s, l) => {
      return s + Math.round((l.amount || 0) * ((l.interest_rate || 0) / 100));
    }, 0);

    const totalPrincipalValidated = loans.filter(validated).reduce((s, l) => s + (l.amount || 0), 0);
    const totalPaidAll = payments.reduce((s, p) => s + (p.amount || 0), 0);
    const repaymentRate = totalPrincipalValidated > 0 ? Math.round((totalPaidAll / totalPrincipalValidated) * 100) : 0;

    return {
      loansCreatedInPeriod: loansCreatedInPeriod.length,
      loansValidatedInPeriod: loansValidatedInPeriod.length,
      principalValidatedInPeriod,
      interestCollectedInPeriod,
      totalPaidInPeriod,
      interestValidatedInPeriod,
      repaymentRate,
      byDay: groupRequestsForChart(loansCreatedInPeriod, start, end, period === 'custom' ? 'day' : period),
      byStatus: getStatusDistribution(loans),
      interestByMonth: getInterestByMonth(loans, payments)
    };
  }, [loans, payments, range, period]);

  function groupRequestsForChart(loanList, start, end, periodId) {
    if (periodId === 'year') {
      const byMonth = {};
      for (let m = 0; m < 12; m++) {
        const key = `${start.getFullYear()}-${String(m + 1).padStart(2, '0')}`;
        byMonth[key] = { date: key, demandes: 0, label: new Date(start.getFullYear(), m, 1).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }) };
      }
      loanList.forEach(l => {
        const key = new Date(l.created_at).toISOString().slice(0, 7);
        if (byMonth[key]) byMonth[key].demandes += 1;
      });
      return Object.values(byMonth).sort((a, b) => a.date.localeCompare(b.date));
    }
    if (periodId === 'quarter') {
      const buckets = {};
      const d = new Date(start);
      while (d <= end) {
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const weekKey = weekStart.toISOString().slice(0, 10);
        if (!buckets[weekKey]) buckets[weekKey] = { date: weekKey, demandes: 0, label: `S. ${weekStart.getMonth() + 1}/${String(weekStart.getDate()).padStart(2, '0')}` };
        d.setDate(d.getDate() + 1);
      }
      loanList.forEach(l => {
        const dt = new Date(l.created_at);
        const weekStart = new Date(dt);
        weekStart.setDate(dt.getDate() - dt.getDay());
        const weekKey = weekStart.toISOString().slice(0, 10);
        if (buckets[weekKey]) buckets[weekKey].demandes += 1;
      });
      return Object.values(buckets).sort((a, b) => a.date.localeCompare(b.date));
    }
    const map = {};
    const d = new Date(start);
    while (d <= end) {
      const key = d.toISOString().slice(0, 10);
      map[key] = { date: key, demandes: 0, label: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) };
      d.setDate(d.getDate() + 1);
    }
    loanList.forEach(l => {
      const key = new Date(l.created_at).toISOString().slice(0, 10);
      if (map[key]) map[key].demandes += 1;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }

  function getStatusDistribution(loanList) {
    const statuses = { pending: 0, active: 0, approved: 0, overdue: 0, completed: 0, rejected: 0 };
    loanList.forEach(l => {
      const s = l.status || 'pending';
      if (statuses[s] !== undefined) statuses[s] += 1;
    });
    return [
      { name: 'En attente', value: statuses.pending, color: '#eab308' },
      { name: 'Actifs', value: statuses.active + statuses.approved + statuses.overdue, color: '#3b82f6' },
      { name: 'Remboursés', value: statuses.completed, color: '#22c55e' },
      { name: 'Rejetés', value: statuses.rejected, color: '#ef4444' }
    ].filter(d => d.value > 0);
  }

  function getInterestByMonth(loanList, paymentList) {
    const completed = loanList.filter(l => l.status === 'completed' && l.approved_at);
    const byMonth = {};
    completed.forEach(l => {
      const loanPays = paymentList.filter(p => p.loan_id === l.id);
      const lastDate = loanPays.length
        ? new Date(Math.max(...loanPays.map(p => new Date(p.payment_date || p.created_at).getTime())))
        : new Date(l.updated_at || l.approved_at);
      const key = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, '0')}`;
      const interest = Math.round((l.amount || 0) * ((l.interest_rate || 0) / 100));
      byMonth[key] = (byMonth[key] || 0) + interest;
    });
    return Object.entries(byMonth)
      .map(([month, value]) => ({ month, value, label: month }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50/30 pb-24">
      <div className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/analytics')}
                className="p-2 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                aria-label="Retour"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="p-2.5 bg-green-100 rounded-xl">
                <BarChart3 size={24} className="text-green-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-montserrat">Statistiques détaillées</h1>
                <p className="text-sm text-gray-500">Graphiques et filtres par période</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <RefreshCw size={18} />
              <span className="hidden sm:inline text-sm font-medium">Actualiser</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-500 border-t-transparent" />
            <p className="text-gray-500 text-sm">Chargement des données...</p>
          </div>
        ) : (
          <>
            {/* Filtre période */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-green-600" />
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
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-green-50 hover:border-green-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {/* Sélection de dates précises */}
              <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={20} className="text-green-600 flex-shrink-0" />
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
                      className="px-3 py-2 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none text-gray-900"
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
                      className="px-3 py-2 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none text-gray-900"
                    />
                  </label>
                  {period === 'custom' && (
                    <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-lg">Personnalisé</span>
                  )}
                </div>
              </div>
            </div>

            {/* Cartes stats période */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CreditCard size={18} className="text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Demandes reçues</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.loansCreatedInPeriod}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle size={18} className="text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Prêts validés</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.loansValidatedInPeriod}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <DollarSign size={18} className="text-emerald-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Intérêts collectés (période)</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.interestCollectedInPeriod)}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Target size={18} className="text-amber-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Taux remboursement</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.repaymentRate}%</p>
              </div>
            </div>

            {/* Montant prêté & Paiements période */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                <p className="text-sm font-medium text-gray-500 mb-1">Principal prêté (période)</p>
                <p className="text-xl font-bold text-green-700">{formatCurrency(stats.principalValidatedInPeriod)}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                <p className="text-sm font-medium text-gray-500 mb-1">Paiements reçus (période)</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(stats.totalPaidInPeriod)}</p>
              </div>
            </div>

            {/* Graphique demandes */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity size={20} className="text-green-600" />
                Demandes de prêts (période)
              </h3>
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.byDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                      formatter={(value) => [value, 'Demandes']}
                      labelFormatter={(label) => `Jour: ${label}`}
                    />
                    <Bar dataKey="demandes" fill="#22c55e" radius={[6, 6, 0, 0]} name="Demandes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Intérêts par mois + Répartition statuts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-green-600" />
                  Intérêts collectés (par mois)
                </h3>
                <div className="h-64">
                  {stats.interestByMonth.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.interestByMonth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={(v) => `${v / 1000}k`} />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                          formatter={(value) => [formatCurrency(value), 'Intérêts']}
                        />
                        <Area type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} fill="url(#colorInterest)" name="Intérêts" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">Aucune donnée sur les intérêts par mois</div>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Répartition des prêts</h3>
                <div className="h-64 flex items-center justify-center">
                  {stats.byStatus.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.byStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {stats.byStatus.map((entry, index) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, 'Prêts']} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-400 text-sm">Aucun prêt</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDetailedStatistics;
