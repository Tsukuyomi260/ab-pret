import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import FedaPayRemboursementButton from '../UI/FedaPayRemboursementButton';
import { 
  getLoans, 
  getPayments 
} from '../../utils/supabaseAPI';
import { ArrowLeft, Wallet } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const Repayment = () => {
  const { showSuccess, showError } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();
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
          loan.status === 'active' || loan.status === 'approved'
        );
        console.log('[REPAYMENT] Prêt actif trouvé:', activeLoan ? { id: activeLoan.id, status: activeLoan.status } : 'Aucun');
        
        if (activeLoan) {
          // Calculer le montant payé pour ce prêt
          const loanPayments = payments.filter(payment => payment.loan_id === activeLoan.id);
          const paidAmount = loanPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
          
          // Calculer le montant total avec intérêts
          const totalAmount = activeLoan.amount * (1 + (activeLoan.interest_rate || 0) / 100);
          const remainingAmount = Math.max(0, totalAmount - paidAmount);
          
          // Debug: Vérifier les calculs
          console.log('[REPAYMENT] Calculs détaillés:', {
            originalAmount: activeLoan.amount,
            interestRate: activeLoan.interest_rate || 0,
            totalAmount: totalAmount,
            paidAmount: paidAmount,
            remainingAmount: remainingAmount,
            remainingAmountRounded: Math.round(remainingAmount)
          });
          
          // Calculer la date d'échéance
          const loanDate = new Date(activeLoan.created_at);
          const durationDays = activeLoan.duration || 30; // duration contient le nombre de jours
          const dueDate = new Date(loanDate.getTime() + (durationDays * 24 * 60 * 60 * 1000));
          
          // Calculer la date du prochain paiement
          const now = new Date();
          const daysSinceLoan = Math.floor((now - loanDate) / (1000 * 60 * 60 * 24));
          const daysInMonth = 30;
          const nextPaymentDay = daysSinceLoan + daysInMonth - (daysSinceLoan % daysInMonth);
          const nextPaymentDate = new Date(loanDate.getTime() + (nextPaymentDay * 24 * 60 * 60 * 1000));

          // Debug: Afficher les calculs du montant à rembourser
          console.log('[REPAYMENT] Calcul du montant à rembourser:', {
            loanId: activeLoan.id,
            originalAmount: activeLoan.amount,
            interestRate: activeLoan.interest_rate || 0,
            totalAmount: totalAmount,
            paidAmount: paidAmount,
            remainingAmount: remainingAmount,
            calculation: `${activeLoan.amount} * (1 + ${activeLoan.interest_rate || 0}/100) = ${totalAmount}`
          });

          const formattedLoan = {
            id: activeLoan.id,
            amount: activeLoan.amount,
            monthlyPayment: activeLoan.monthly_payment || Math.round(totalAmount / durationDays),
            totalAmount: Math.round(totalAmount),
            paidAmount: Math.round(paidAmount),
            remainingAmount: Math.round(remainingAmount),
            dueDate: dueDate.toISOString().split('T')[0],
            nextPaymentDate: nextPaymentDate.toISOString().split('T')[0],
            interest_rate: activeLoan.interest_rate || 0,
            duration: activeLoan.duration || 30,
            purpose: activeLoan.purpose || 'Non spécifié'
          };

          setCurrentLoan(formattedLoan);
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
  }, [user?.id]);




  const handleRepaymentSuccess = (message) => {
    showSuccess(message);
    // Recharger les données après un remboursement réussi
    setTimeout(() => {
      loadActiveLoan();
    }, 1000);
  };

  const handleRepaymentError = (error) => {
    showError(error);
  };

  return (
    <div className="bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50">
      
      
      {/* Section Hero - En-tête principal */}
      <div className="relative overflow-hidden">
        {/* Background avec gradient animé - Thème remboursement (vert/orange) */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-600 to-orange-500 opacity-15 animate-gradient"></div>
        
        {/* Couche de profondeur supplémentaire */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent"></div>
        


        {/* Contenu Header */}
        <div className="relative px-4 lg:px-8 py-8 lg:py-12 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-8">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm border-white/30"
              >
                <ArrowLeft size={20} />
                <span>Retour</span>
              </Button>
            </div>

            {/* Section Hero - En-tête principal */}
            <div className="text-center mb-8 lg:mb-12">


              {/* Titre principal */}
              <h1 className="text-4xl lg:text-6xl font-bold text-secondary-900 font-montserrat mb-4">
                Remboursement de Prêt{' '}
                <span className="inline-block">
                  💳
                </span>
              </h1>


            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal centré */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Informations du prêt actif */}
          {currentLoan ? (
            <Card title="Votre prêt" className="bg-white/90 backdrop-blur-sm border-white/20">
              <div className="border rounded-2xl p-6 bg-gradient-to-r from-primary-50/80 to-accent-50/80 border-primary-200/50 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900 text-xl font-montserrat">Prêt #{currentLoan.id}</h3>
                  <span className="text-sm text-primary-600 font-medium bg-primary-100/80 px-4 py-2 rounded-full">
                    {formatCurrency(currentLoan.remainingAmount)} à rembourser
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 bg-white/60 rounded-xl border border-white/50">
                    <span className="text-gray-600 text-xs uppercase tracking-wide">Montant du prêt</span>
                    <p className="font-semibold text-xl text-gray-900">{formatCurrency(currentLoan.amount)}</p>
                  </div>
                  <div className="p-4 bg-white/60 rounded-xl border border-white/50">
                    <span className="text-gray-600 text-xs uppercase tracking-wide">Montant payé</span>
                    <p className="font-semibold text-xl text-gray-900">{formatCurrency(currentLoan.paidAmount)}</p>
                  </div>
                  <div className="p-4 bg-white/60 rounded-xl border border-white/50">
                    <span className="text-gray-600 text-xs uppercase tracking-wide">Montant à rembourser</span>
                    <p className="font-semibold text-xl text-gray-900">{formatCurrency(currentLoan.remainingAmount)}</p>
                  </div>
                </div>
              </div>
              
              {/* Bouton Effectuer le paiement */}
              <div className="mt-6">
                <FedaPayRemboursementButton
                  loan={currentLoan}
                  onSuccess={handleRepaymentSuccess}
                />
              </div>
            </Card>
          ) : (
            <Card title="Aucun prêt" className="bg-white/90 backdrop-blur-sm border-white/20">
              <div className="text-center py-12">
                <Wallet size={64} className="mx-auto mb-6 text-gray-300" />
                <p className="text-gray-500 mb-6 text-lg">Vous n'avez actuellement aucun prêt en cours</p>
                <p className="text-gray-400 mb-6 text-sm">Un seul prêt autorisé à la fois</p>
                <Button 
                  onClick={() => navigate('/loan-request')}
                  className="px-8 py-4 text-lg rounded-2xl bg-primary-500 hover:bg-primary-600"
                >
                  Demander un prêt
                </Button>
              </div>
            </Card>
          )}



        </div>
      </div>
    </div>
  );
};

export default Repayment;

