import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import NotificationBell from '../UI/NotificationBell';
import { getLoans, getPayments, createPayment } from '../../utils/supabaseAPI';
import { ArrowLeft, CreditCard, Wallet, CheckCircle, AlertCircle, Activity, BarChart3, Percent, Award, Gift, Rocket, Shield, TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const Repayment = () => {
  const { notifications, markAsRead } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentLoan, setCurrentLoan] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});



  useEffect(() => {
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

          // Trouver le prêt actif ou approuvé le plus récent
          const activeLoan = loans.find(loan => loan.status === 'active' || loan.status === 'approved');
          
          if (activeLoan) {
            // Calculer le montant payé pour ce prêt
            const loanPayments = payments.filter(payment => payment.loan_id === activeLoan.id);
            const paidAmount = loanPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
            
            // Calculer le montant total avec intérêts
            const totalAmount = activeLoan.amount * (1 + (activeLoan.interest_rate || 0) / 100);
            const remainingAmount = totalAmount - paidAmount;
            
            // Calculer la date d'échéance
            const loanDate = new Date(activeLoan.created_at);
            const durationMonths = activeLoan.duration || 12;
            const dueDate = new Date(loanDate.getTime() + (durationMonths * 30 * 24 * 60 * 60 * 1000));
            
            // Calculer la date du prochain paiement
            const now = new Date();
            const daysSinceLoan = Math.floor((now - loanDate) / (1000 * 60 * 60 * 24));
            const daysInMonth = 30;
            const nextPaymentDay = daysSinceLoan + daysInMonth - (daysSinceLoan % daysInMonth);
            const nextPaymentDate = new Date(loanDate.getTime() + (nextPaymentDay * 24 * 60 * 60 * 1000));

            const formattedLoan = {
              id: activeLoan.id,
              amount: activeLoan.amount,
              monthlyPayment: activeLoan.monthly_payment || Math.round(totalAmount / durationMonths),
              totalAmount: Math.round(totalAmount),
              paidAmount: Math.round(paidAmount),
              remainingAmount: Math.round(remainingAmount),
              dueDate: dueDate.toISOString().split('T')[0],
              nextPaymentDate: nextPaymentDate.toISOString().split('T')[0],
              interest_rate: activeLoan.interest_rate || 0,
              duration: activeLoan.duration || 12,
              purpose: activeLoan.purpose || 'Non spécifié'
            };

            setCurrentLoan(formattedLoan);
            setPaymentAmount(formattedLoan.monthlyPayment.toString());
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

    loadActiveLoan();
  }, [user?.id]);

  const validatePayment = () => {
    const newErrors = {};

    if (!currentLoan) {
      newErrors.loan = 'Aucun prêt actif trouvé';
    }

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      newErrors.amount = 'Veuillez entrer un montant valide';
    } else if (parseFloat(paymentAmount) > currentLoan?.remainingAmount) {
      newErrors.amount = 'Le montant ne peut pas dépasser le reste à payer';
    }

    if (!paymentMethod) {
      newErrors.method = 'Veuillez sélectionner un mode de paiement';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePayment()) return;

    setLoading(true);
    
    try {
      const paymentData = {
        loan_id: currentLoan.id,
        user_id: user.id,
        amount: parseFloat(paymentAmount),
        payment_method: paymentMethod,
        status: 'completed',
        payment_date: new Date().toISOString(),
        description: `Paiement pour le prêt: ${currentLoan.purpose}`
      };

      const result = await createPayment(paymentData);
      
      if (result.success) {
        // Redirection vers le dashboard avec un message de succès
        navigate('/dashboard', { 
          state: { message: 'Paiement effectué avec succès' }
        });
      } else {
        setErrors({ general: result.error || 'Erreur lors du paiement' });
      }
    } catch (error) {
      console.error('[REPAYMENT] Erreur lors du paiement:', error.message);
      setErrors({ general: 'Erreur lors du paiement' });
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'mobile_money': return '📱';
      default: return '💳';
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'mobile_money': return 'Mobile Money';
      default: return 'Carte bancaire';
    }
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
                    {formatCurrency(currentLoan.remainingAmount)} restant
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 bg-white/60 rounded-xl border border-white/50">
                    <span className="text-gray-600 text-xs uppercase tracking-wide">Mensualité</span>
                    <p className="font-semibold text-xl text-gray-900">{formatCurrency(currentLoan.monthlyPayment)}</p>
                  </div>
                  <div className="p-4 bg-white/60 rounded-xl border border-white/50">
                    <span className="text-gray-600 text-xs uppercase tracking-wide">Prochain paiement</span>
                    <p className="font-semibold text-xl text-gray-900">{new Date(currentLoan.nextPaymentDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="p-4 bg-white/60 rounded-xl border border-white/50">
                    <span className="text-gray-600 text-xs uppercase tracking-wide">Montant total</span>
                    <p className="font-semibold text-xl text-gray-900">{formatCurrency(currentLoan.totalAmount)}</p>
                  </div>
                </div>
              </div>
              
              {/* Bouton Effectuer le paiement */}
              <div className="mt-6">
                <Button
                  onClick={handleSubmit}
                  loading={loading}
                  className="w-full px-8 py-4 text-lg rounded-2xl bg-primary-500 hover:bg-primary-600 font-semibold"
                >
                  {loading ? 'Traitement...' : 'Effectuer le paiement'}
                </Button>
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

