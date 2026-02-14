/**
 * Hook qui agrège prêts + paiements + épargne avec React Query (cache 2 min)
 * Évite de recharger à chaque visite du dashboard
 */
import { useQuery } from '@tanstack/react-query';
import { getLoans, getPayments } from '../utils/supabaseAPI';
import { supabase } from '../utils/supabaseClient';

async function fetchDashboardData(userId) {
  const [loansResult, paymentsResult, savingsResponse] = await Promise.all([
    getLoans(userId),
    getPayments(userId),
    supabase
      .from('savings_plans')
      .select('current_balance')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('current_balance', { ascending: false }),
  ]);

  const loans = loansResult.success ? (loansResult.data || []) : [];
  const payments = paymentsResult.success ? (paymentsResult.data || []) : [];
  const savingsPlans = savingsResponse?.data || [];
  const savingsBalance = savingsPlans.length > 0
    ? Math.max(...savingsPlans.map(p => p.current_balance || 0))
    : 0;

  const totalLoaned = loans.reduce((sum, l) => sum + (l.amount || 0), 0);
  const totalRepaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Solde restant par prêt (comme page Remboursement) : ne compter que les prêts vraiment à rembourser
  const getRemainingForLoan = (loan) => {
    const principal = parseFloat(loan.amount) || 0;
    const rate = parseFloat(loan.interest_rate) || 0;
    const totalWithInterest = principal * (1 + rate / 100);
    const penalty = parseFloat(loan.total_penalty_amount) || 0;
    const totalDue = totalWithInterest + penalty;
    const paid = payments
      .filter(p => p.loan_id === loan.id)
      .reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
    return Math.max(0, totalDue - paid);
  };
  const loansToRepay = loans.filter(l => {
    if (l.status !== 'active' && l.status !== 'overdue' && l.status !== 'approved') return false;
    return getRemainingForLoan(l) > 0;
  });
  const activeLoans = loansToRepay.length;
  const amountToRepay = totalLoaned - totalRepaid;

  let nextPayment = 0;
  let daysUntilNextPayment = 0;
  let dueDate = null;
  const activeLoan = loansToRepay[0] || null;
  if (activeLoan) {
    const principalAmount = parseFloat(activeLoan.amount) || 0;
    const interestRate = parseFloat(activeLoan.interest_rate) || 0;
    if (principalAmount > 0) nextPayment = Math.round(principalAmount * (1 + interestRate / 100));
    if (activeLoan.approved_at) {
      const approvedDate = new Date(activeLoan.approved_at);
      // IMPORTANT: duration_months contient déjà des jours (pas des mois !)
      // Si duration existe directement, c'est aussi en jours
      let durationDays = 30; // Par défaut
      if (activeLoan.duration_months != null && activeLoan.duration_months !== undefined) {
        durationDays = Number(activeLoan.duration_months); // Déjà en jours, pas besoin de multiplier
      } else if (activeLoan.duration != null && activeLoan.duration !== undefined) {
        durationDays = Number(activeLoan.duration);
      }
      dueDate = new Date(approvedDate);
      dueDate.setDate(dueDate.getDate() + durationDays);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      daysUntilNextPayment = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }
  }

  const loanById = new Map(loans.map(l => [l.id, l]));
  const completedPayments = payments.filter(p => (p.status || '').toLowerCase() === 'completed');
  const onTimeLoanIds = new Set();
  completedPayments.forEach(p => {
    const loan = loanById.get(p.loan_id);
    if (!loan?.approved_at) return;
    const startDate = new Date(loan.approved_at);
    const durationDays = parseInt(loan.duration_months || loan.duration || 30, 10);
    const loanDue = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    loanDue.setHours(23, 59, 59, 999);
    const payDate = new Date(p.payment_date || p.created_at || new Date());
    payDate.setHours(0, 0, 0, 0);
    if (payDate.getTime() <= loanDue.getTime()) onTimeLoanIds.add(p.loan_id);
  });
  loans.forEach(l => {
    const s = (l.status || '').toLowerCase();
    if ((s === 'completed' || s === 'remboursé') && !onTimeLoanIds.has(l.id)) onTimeLoanIds.add(l.id);
  });
  const loyaltyScore = Math.max(0, Math.min(5, onTimeLoanIds.size));
  // Prêt(s) à rembourser : seulement si solde restant > 0 (aligné avec la page Remboursement)
  const hasLoanToRepay = loansToRepay.length > 0;

  return {
    totalLoaned,
    totalRepaid,
    amountToRepay,
    activeLoans,
    hasLoanToRepay,
    nextPayment,
    daysUntilNextPayment,
    dueDate,
    loyaltyScore,
    savingsBalance,
  };
}

export function useDashboardStats(userId) {
  const query = useQuery({
    queryKey: ['dashboardStats', userId],
    queryFn: () => fetchDashboardData(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return {
    stats: query.data ?? {
      totalLoaned: 0,
      totalRepaid: 0,
      amountToRepay: 0,
      activeLoans: 0,
      hasLoanToRepay: false,
      nextPayment: 0,
      daysUntilNextPayment: 0,
      dueDate: null,
      loyaltyScore: 0,
      savingsBalance: 0,
    },
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
