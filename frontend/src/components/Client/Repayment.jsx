import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import FedaPayRemboursementButton from '../UI/FedaPayRemboursementButton';
import { 
  getLoans, 
  getPayments 
} from '../../utils/supabaseAPI';
import { 
  ArrowLeft, 
  Wallet, 
  AlertTriangle, 
  CreditCard,
  Calendar,
  TrendingUp,
  CheckCircle,
  DollarSign,
  Info
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const Repayment = () => {
  const { showSuccess, showError } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentLoan, setCurrentLoan] = useState(null);
  const [loading, setLoading] = useState(false);



  const loadActiveLoan = async () => {
    if (!user?.id) {
      return;
    }

    try {
      setLoading(true);
      
      // Récupérer les prêts actifs de l'utilisateur
      const [loansResult, paymentsResult] = await Promise.all([
        getLoans(user.id),
        getPayments(user.id)
      ]);

      if (loansResult.success && paymentsResult.success) {
        const loans = loansResult.data || [];
        const payments = paymentsResult.data || [];

        // Trouver le prêt actif ou approuvé le plus récent (pas les prêts complétés)
        console.log('[REPAYMENT] Tous les prêts:', loans.map(loan => ({ id: loan.id, status: loan.status })));
        const activeLoan = loans.find(loan =>
          loan.status === 'active' || loan.status === 'approved' || loan.status === 'overdue'
        );
        console.log('[REPAYMENT] Prêt actif trouvé:', activeLoan ? { id: activeLoan.id, status: activeLoan.status } : 'Aucun');
        
        if (activeLoan) {
          // Calculer le montant payé pour ce prêt
          const loanPayments = payments.filter(payment => payment.loan_id === activeLoan.id);
          const paidAmount = loanPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
          
          // Calculer le montant total avec intérêts
          const principalAmount = parseFloat(activeLoan.amount);
          const interestAmount = principalAmount * (activeLoan.interest_rate || 0) / 100;
          const totalOriginalAmount = principalAmount + interestAmount;
          
          // Durée en jours : duration_months contient déjà des jours (pas des mois !)
          // Si duration existe directement, c'est aussi en jours
          let durationDays = 30; // Par défaut
          if (activeLoan.duration_months != null && activeLoan.duration_months !== undefined) {
            durationDays = Number(activeLoan.duration_months); // Déjà en jours, pas besoin de multiplier
          } else if (activeLoan.duration != null && activeLoan.duration !== undefined) {
            durationDays = Number(activeLoan.duration);
          }
          
          let dueDate = null;
          let nextPaymentDate = null;

          if (activeLoan.approved_at) {
            const approvedDate = new Date(activeLoan.approved_at);
            // Utiliser setDate pour éviter les problèmes de dépassement de mois
            dueDate = new Date(approvedDate);
            dueDate.setDate(dueDate.getDate() + durationDays);
          }

          // Pénalités : vérifier le statut overdue ET calculer les jours de retard
          let penaltyAmount = parseFloat(activeLoan.total_penalty_amount || 0);
          let daysOverdue = 0;
          const isOverdue = activeLoan.status === 'overdue';
          
          if (dueDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dueDateOnly = new Date(dueDate);
            dueDateOnly.setHours(0, 0, 0, 0);
            daysOverdue = Math.max(0, Math.floor((today - dueDateOnly) / (1000 * 60 * 60 * 24)));
            
            // Si le prêt est marqué overdue OU si on est en retard, calculer les pénalités
            // Système de pénalités : 2% tous les 5 jours complets, composées
            if ((isOverdue || daysOverdue > 0) && penaltyAmount === 0) {
              const penaltyRate = parseFloat(activeLoan.daily_penalty_rate) || 2.0;
              
              // Calculer le nombre de périodes complètes de 5 jours
              const periodsOf5Days = Math.floor(daysOverdue / 5);
              
              // Calculer les pénalités composées : 2% tous les 5 jours sur le solde actuel
              if (periodsOf5Days > 0) {
                const amountWithPenalties = totalOriginalAmount * Math.pow(1 + (penaltyRate / 100), periodsOf5Days);
                penaltyAmount = amountWithPenalties - totalOriginalAmount;
              } else {
                penaltyAmount = 0; // Pas encore 5 jours complets, pas de pénalité
              }
            }
            
            // Si le prêt est overdue mais qu'on n'a pas encore de pénalités calculées, utiliser le statut
            if (isOverdue && penaltyAmount === 0 && daysOverdue === 0) {
              // Le prêt est overdue mais la date d'échéance calculée ne montre pas de retard
              // Utiliser au moins 5 jours pour afficher les pénalités (première période)
              daysOverdue = 5;
              const penaltyRate = parseFloat(activeLoan.daily_penalty_rate) || 2.0;
              const amountWithPenalties = totalOriginalAmount * (1 + (penaltyRate / 100));
              penaltyAmount = amountWithPenalties - totalOriginalAmount;
            }
          }
          const totalAmountWithPenalty = totalOriginalAmount + penaltyAmount;
          const remainingAmount = Math.max(0, totalAmountWithPenalty - paidAmount);

          if (activeLoan.approved_at) {
            const approvedDate = new Date(activeLoan.approved_at);
            
            // Calculer la date du prochain paiement (basée sur la date d'approbation)
            const now = new Date();
            const daysSinceApproval = Math.floor((now - approvedDate) / (1000 * 60 * 60 * 24));
            const daysInMonth = 30;
            const nextPaymentDay = daysSinceApproval + daysInMonth - (daysSinceApproval % daysInMonth);
            nextPaymentDate = new Date(approvedDate.getTime() + (nextPaymentDay * 24 * 60 * 60 * 1000));
          }

          // Debug: Afficher les calculs du montant à rembourser
          console.log('[REPAYMENT] Calcul du montant à rembourser:', {
            loanId: activeLoan.id,
            originalAmount: activeLoan.amount,
            interestRate: activeLoan.interest_rate || 0,
            totalOriginalAmount: totalOriginalAmount,
            paidAmount: paidAmount,
            remainingAmount: remainingAmount,
            calculation: `${activeLoan.amount} * (1 + ${activeLoan.interest_rate || 0}/100) = ${totalOriginalAmount}`
          });

          const formattedLoan = {
            id: activeLoan.id,
            amount: activeLoan.amount,
            monthlyPayment: activeLoan.monthly_payment || Math.round(totalOriginalAmount / durationDays),
            totalAmount: Math.round(totalOriginalAmount),
            paidAmount: Math.round(paidAmount),
            remainingAmount: Math.round(remainingAmount),
            penaltyAmount: Math.round(penaltyAmount),
            daysOverdue: daysOverdue,
            totalAmountWithPenalty: Math.round(totalAmountWithPenalty),
            dueDate: dueDate ? dueDate.toISOString().split('T')[0] : null,
            nextPaymentDate: nextPaymentDate ? nextPaymentDate.toISOString().split('T')[0] : null,
            interest_rate: activeLoan.interest_rate || 0,
            duration: durationDays,
            purpose: activeLoan.purpose || 'Non spécifié',
            status: activeLoan.status
          };

          // Si le prêt est entièrement remboursé (solde <= 0), ne pas l'afficher :
          // on considère qu'il n'y a plus de prêt à rembourser (statut peut être encore "active" avant mise à jour backend)
          if (formattedLoan.remainingAmount <= 0) {
            setCurrentLoan(null);
            queryClient.invalidateQueries({ queryKey: ['dashboardStats', user?.id] });
          } else {
            setCurrentLoan(formattedLoan);
          }
        } else {
          // Aucun prêt actif trouvé
          setCurrentLoan(null);
        }
      } else {
        console.error('[REPAYMENT] Erreur lors du chargement des données:', {
          loans: loansResult.error,
          payments: paymentsResult.error
        });
      }
    } catch (error) {
      console.error('[REPAYMENT] Erreur lors du chargement du prêt actif:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveLoan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);




  const handleRepaymentSuccess = (message) => {
    showSuccess(message);
    queryClient.invalidateQueries({ queryKey: ['dashboardStats', user?.id] });
    setTimeout(() => {
      loadActiveLoan();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50 to-slate-100 pb-24">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-secondary-900 font-montserrat flex items-center justify-center gap-3">
                <CreditCard className="text-primary-600" size={32} />
                Remboursement de Prêt
              </h1>
            </div>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent"></div>
          </div>
        ) : currentLoan ? (
          <div className="space-y-6">
            {/* Card principale du prêt */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Header du prêt avec gradient */}
              <div className="bg-gradient-to-r from-secondary-800 to-secondary-900 p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white rounded-xl">
                      <Wallet size={28} className="text-primary-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Prêt Actif</h2>
                      <p className="text-gray-300 text-sm">ID: #{currentLoan.id.substring(0, 8)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-300 text-sm">Objet du prêt</p>
                    <p className="text-white font-semibold">{currentLoan.purpose}</p>
                  </div>
                </div>
                
                {/* Montant restant - mise en avant */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <p className="text-gray-200 text-sm mb-2">Montant restant à rembourser</p>
                  <p className="text-5xl font-bold text-white">{formatCurrency(currentLoan.remainingAmount)}</p>
                </div>
              </div>

              {/* Stats détaillées */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  {/* Montant initial */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-200 rounded-lg">
                        <DollarSign size={20} className="text-blue-700" />
                      </div>
                      <p className="text-blue-900 font-medium text-sm">Montant initial</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(currentLoan.amount)}</p>
                  </div>

                  {/* Montant payé */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-green-200 rounded-lg">
                        <CheckCircle size={20} className="text-green-700" />
                      </div>
                      <p className="text-green-900 font-medium text-sm">Déjà remboursé</p>
                    </div>
                    <p className="text-2xl font-bold text-green-900">{formatCurrency(currentLoan.paidAmount)}</p>
                  </div>

                  {/* Total à rembourser */}
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-5 border border-primary-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary-200 rounded-lg">
                        <TrendingUp size={20} className="text-primary-700" />
                      </div>
                      <p className="text-primary-900 font-medium text-sm">Total avec intérêts</p>
                    </div>
                    <p className="text-2xl font-bold text-primary-900">{formatCurrency(currentLoan.totalAmount)}</p>
                    <p className="text-xs text-primary-700 mt-1">Taux: {currentLoan.interest_rate}%</p>
                  </div>

                  {/* Pénalités */}
                  {(() => {
                    const hasPenalty = currentLoan.penaltyAmount > 0 || currentLoan.daysOverdue > 0 || currentLoan.status === 'overdue';
                    return (
                      <div className={`rounded-2xl p-5 border ${
                        hasPenalty 
                          ? 'bg-gradient-to-br from-red-50 to-orange-100 border-red-200' 
                          : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
                      }`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${
                            hasPenalty ? 'bg-red-200' : 'bg-gray-200'
                          }`}>
                            <AlertTriangle size={20} className={hasPenalty ? 'text-red-700' : 'text-gray-700'} />
                          </div>
                          <p className={`font-medium text-sm ${
                            hasPenalty ? 'text-red-900' : 'text-gray-900'
                          }`}>Pénalités</p>
                        </div>
                        {hasPenalty ? (
                          <>
                            <p className="text-2xl font-bold text-red-900">{formatCurrency(currentLoan.penaltyAmount || 0)}</p>
                            <p className="text-xs text-red-700 mt-1">
                              {currentLoan.daysOverdue === 1 
                                ? '1 jour de retard' 
                                : currentLoan.daysOverdue > 1
                                ? `${currentLoan.daysOverdue} jours de retard`
                                : 'En retard'}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-2xl font-bold text-gray-900">0 FCFA</p>
                            <p className="text-xs text-gray-700 mt-1">Aucun retard</p>
                          </>
                        )}
                      </div>
                    );
                  })()}

                  {/* Date d'échéance */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-200 rounded-lg">
                        <Calendar size={20} className="text-purple-700" />
                      </div>
                      <p className="text-purple-900 font-medium text-sm">Date d'échéance</p>
                    </div>
                    <p className="text-lg font-bold text-purple-900">
                      {currentLoan.dueDate ? new Date(currentLoan.dueDate).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      }) : 'Non défini'}
                    </p>
                    <p className="text-xs text-purple-700 mt-1">Durée: {currentLoan.duration} jours</p>
                  </div>
                </div>

                {/* Alerte pénalités si applicable */}
                {currentLoan.penaltyAmount > 0 && (
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-red-100 rounded-xl">
                        <AlertTriangle size={24} className="text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-red-900 text-lg mb-2">⚠️ Prêt en retard</h3>
                        <p className="text-red-800 mb-3">
                          Votre prêt a dépassé la date d'échéance. Des pénalités de <strong>2% tous les 5 jours</strong> sont appliquées (composées sur le solde total).
                        </p>
                        <div className="bg-white/50 rounded-xl p-4 border border-red-200">
                          <div className="flex items-center justify-between">
                            <span className="text-red-900 font-medium">Pénalités accumulées</span>
                            <span className="text-2xl font-bold text-red-700">{formatCurrency(currentLoan.penaltyAmount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info box */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Info size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">Informations importantes</h3>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Le remboursement se fait via Mobile Money (MTN, Moov)</li>
                        <li>• Vous pouvez rembourser partiellement ou totalement</li>
                        <li>• Le remboursement est instantané et sécurisé</li>
                        <li>• Évitez les pénalités en remboursant avant l'échéance</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Bouton de remboursement */}
                <div className="bg-gradient-to-br from-primary-50 to-yellow-50 rounded-2xl p-6 border-2 border-primary-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary-500 rounded-xl">
                      <CreditCard size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-secondary-900 text-lg">Effectuer un remboursement</h3>
                      <p className="text-gray-600 text-sm">Paiement sécurisé via FedaPay</p>
                    </div>
                  </div>
                  <FedaPayRemboursementButton
                    loan={currentLoan}
                    onSuccess={handleRepaymentSuccess}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Aucun prêt actif */
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-16 text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wallet size={64} className="text-gray-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-montserrat">
                Aucun prêt en cours
              </h2>
              <p className="text-gray-600 mb-2 max-w-md mx-auto">
                Vous n'avez actuellement aucun prêt actif à rembourser.
              </p>
              <p className="text-gray-500 text-sm mb-8">
                Un seul prêt peut être actif à la fois
              </p>
              <button
                onClick={() => navigate('/loan-request')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <CreditCard size={20} />
                Demander un nouveau prêt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Repayment;

