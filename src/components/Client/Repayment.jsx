import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import NotificationBell from '../UI/NotificationBell';
import { ArrowLeft, CreditCard, Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const Repayment = () => {
  const { notifications, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeLoans, setActiveLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Simulation des données (à remplacer par des appels API)
    setTimeout(() => {
      const loans = [
        {
          id: 1,
          amount: 75000,
          monthlyPayment: 82500,
          totalAmount: 82500,
          paidAmount: 0,
          remainingAmount: 82500,
          dueDate: '2025-08-01',
          nextPaymentDate: '2025-08-01'
        }
      ];
      setActiveLoans(loans);
      
      // Si un loanId est passé dans l'état, sélectionner ce prêt
      if (location.state?.loanId) {
        const loan = loans.find(l => l.id === location.state.loanId);
        if (loan) {
          setSelectedLoan(loan);
          setPaymentAmount(loan.monthlyPayment.toString());
        }
      }
    }, 1000);
  }, [location.state]);

  const handleLoanSelect = (loan) => {
    setSelectedLoan(loan);
    setPaymentAmount(loan.monthlyPayment.toString());
    setErrors({});
  };

  const validatePayment = () => {
    const newErrors = {};

    if (!selectedLoan) {
      newErrors.loan = 'Veuillez sélectionner un prêt';
    }

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      newErrors.amount = 'Veuillez entrer un montant valide';
    } else if (parseFloat(paymentAmount) > selectedLoan?.remainingAmount) {
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
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirection vers le dashboard avec un message de succès
      navigate('/dashboard', { 
        state: { message: 'Paiement effectué avec succès' }
      });
    } catch (error) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Header centré style Apple */}
      <div className="text-center py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="w-full text-center">
              <h1 className="text-3xl font-bold text-gray-900 font-montserrat mb-3">
                Remboursement
              </h1>
              <p className="text-lg text-gray-600 font-montserrat leading-relaxed">
                Effectuez vos paiements de prêt en toute simplicité
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal centré */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sélection du prêt */}
          <div className="lg:col-span-1">
            <Card title="Prêts actifs" className="bg-white/90 backdrop-blur-sm border-white/20">
              {activeLoans.length > 0 ? (
                <div className="space-y-4">
                  {activeLoans.map((loan) => (
                    <div 
                      key={loan.id}
                      className={`border rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                        selectedLoan?.id === loan.id 
                          ? 'border-primary-500 bg-primary-50/80 shadow-lg' 
                          : 'border-gray-200/50 hover:border-primary-300 hover:shadow-md bg-white/60 backdrop-blur-sm'
                      }`}
                      onClick={() => handleLoanSelect(loan)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 text-lg font-montserrat">Prêt #{loan.id}</h3>
                        <span className="text-sm text-primary-600 font-medium bg-primary-100/80 px-3 py-1 rounded-full">
                          {formatCurrency(loan.remainingAmount)} restant
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 text-sm">
                        <div className="p-3 bg-accent-50/50 rounded-xl">
                          <span className="text-gray-600 text-xs uppercase tracking-wide">Mensualité</span>
                          <p className="font-semibold text-lg text-gray-900">{formatCurrency(loan.monthlyPayment)}</p>
                        </div>
                        <div className="p-3 bg-accent-50/50 rounded-xl">
                          <span className="text-gray-600 text-xs uppercase tracking-wide">Prochain paiement</span>
                          <p className="font-semibold text-lg text-gray-900">{new Date(loan.nextPaymentDate).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Wallet size={64} className="mx-auto mb-6 text-gray-300" />
                  <p className="text-gray-500 mb-6 text-lg">Aucun prêt actif à rembourser</p>
                  <Button 
                    onClick={() => navigate('/loan-request')}
                    className="px-8 py-4 text-lg rounded-2xl bg-primary-500 hover:bg-primary-600"
                  >
                    Demander un prêt
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Formulaire de paiement */}
          <div>
            <Card title="Paiement" className="bg-white/90 backdrop-blur-sm border-white/20">
              {selectedLoan ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errors.general && (
                    <div className="bg-red-50/80 border border-red-200/50 text-red-700 px-4 py-3 rounded-2xl flex items-center space-x-2">
                      <AlertCircle size={20} />
                      <span>{errors.general}</span>
                    </div>
                  )}

                  {/* Informations du prêt sélectionné */}
                  <div className="bg-blue-50/80 border border-blue-200/50 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <CreditCard size={24} className="text-blue-600" />
                      <h3 className="font-semibold text-blue-900 text-lg font-montserrat">Prêt #{selectedLoan.id}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 text-sm">
                      <div className="p-3 bg-blue-100/50 rounded-xl">
                        <span className="text-blue-700 text-xs uppercase tracking-wide">Reste à payer</span>
                        <p className="font-bold text-blue-900 text-xl">{formatCurrency(selectedLoan.remainingAmount)}</p>
                      </div>
                      <div className="p-3 bg-blue-100/50 rounded-xl">
                        <span className="text-blue-700 text-xs uppercase tracking-wide">Mensualité</span>
                        <p className="font-bold text-blue-900 text-xl">{formatCurrency(selectedLoan.monthlyPayment)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Montant du paiement */}
                  <div>
                    <Input
                      label="Montant du paiement (FCFA)"
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder={selectedLoan.monthlyPayment.toString()}
                      error={errors.amount}
                      required
                    />
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      Montant suggéré: <span className="font-semibold text-primary-600">{formatCurrency(selectedLoan.monthlyPayment)}</span>
                    </p>
                  </div>

                  {/* Mode de paiement */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Mode de paiement
                    </label>
                    <div className="space-y-3">
                      {[
                        { value: 'mobile_money', label: 'Mobile Money', description: 'Moov Money, MTN Mobile Money' }
                      ].map((method) => (
                        <label
                          key={method.value}
                          className={`flex items-center p-4 border rounded-2xl cursor-pointer transition-all duration-300 ${
                            paymentMethod === method.value
                              ? 'border-primary-500 bg-primary-50/80 shadow-lg'
                              : 'border-gray-200/50 hover:border-primary-300 hover:shadow-md bg-white/60 backdrop-blur-sm'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.value}
                            checked={paymentMethod === method.value}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="sr-only"
                          />
                          <div className="flex items-center space-x-4">
                            <span className="text-3xl">{getPaymentMethodIcon(method.value)}</span>
                            <div>
                              <p className="font-semibold text-gray-900 text-lg">{method.label}</p>
                              <p className="text-sm text-gray-500">{method.description}</p>
                            </div>
                          </div>
                          {paymentMethod === method.value && (
                            <CheckCircle size={24} className="text-primary-600 ml-auto" />
                          )}
                        </label>
                      ))}
                    </div>
                    {errors.method && (
                      <p className="mt-2 text-sm text-red-500">{errors.method}</p>
                    )}
                  </div>

                  {/* Résumé du paiement */}
                  <div className="bg-gray-50/80 border border-gray-200/50 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 text-lg">Résumé du paiement</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                        <span className="text-gray-600">Montant du paiement:</span>
                        <span className="font-semibold text-lg">{formatCurrency(parseFloat(paymentAmount) || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                        <span className="text-gray-600">Mode de paiement:</span>
                        <span className="font-semibold">{getPaymentMethodText(paymentMethod)}</span>
                      </div>
                      <div className="border-t border-gray-200/50 pt-3">
                        <div className="flex justify-between items-center p-3 bg-primary-50/50 rounded-xl">
                          <span className="text-gray-900 font-semibold text-lg">Total:</span>
                          <span className="text-gray-900 font-bold text-xl">{formatCurrency(parseFloat(paymentAmount) || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    loading={loading}
                    className="w-full px-8 py-4 text-lg rounded-2xl bg-primary-500 hover:bg-primary-600 font-semibold"
                  >
                    {loading ? 'Traitement...' : 'Effectuer le paiement'}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-12">
                  <CreditCard size={64} className="mx-auto mb-6 text-gray-300" />
                  <p className="text-gray-500 text-lg">Sélectionnez un prêt pour effectuer un paiement</p>
                </div>
              )}
            </Card>
          </div>


        </div>
      </div>
    </div>
  );
};

export default Repayment;

