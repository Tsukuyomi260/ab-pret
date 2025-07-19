import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { ArrowLeft, CreditCard, Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const Repayment = () => {
  const { user } = useAuth();
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
      case 'bank_transfer': return '🏦';
      case 'cash': return '💵';
      default: return '💳';
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'mobile_money': return 'Mobile Money';
      case 'bank_transfer': return 'Virement bancaire';
      case 'cash': return 'Espèces';
      default: return 'Carte bancaire';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft size={20} />
          <span>Retour</span>
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Remboursement</h1>
          <p className="text-gray-600">Effectuez vos paiements de prêt</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sélection du prêt */}
        <div className="space-y-6">
          <Card title="Prêts actifs">
            {activeLoans.length > 0 ? (
              <div className="space-y-4">
                {activeLoans.map((loan) => (
                  <div 
                    key={loan.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors duration-200 ${
                      selectedLoan?.id === loan.id 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                    onClick={() => handleLoanSelect(loan)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">Prêt #{loan.id}</h3>
                      <span className="text-sm text-primary-600 font-medium">
                        {formatCurrency(loan.remainingAmount)} restant
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Mensualité:</span>
                        <p className="font-medium">{formatCurrency(loan.monthlyPayment)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Prochain paiement:</span>
                        <p className="font-medium">{new Date(loan.nextPaymentDate).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Wallet size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">Aucun prêt actif à rembourser</p>
                <Button onClick={() => navigate('/loan-request')}>
                  Demander un prêt
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Formulaire de paiement */}
        <div className="space-y-6">
          <Card title="Paiement">
            {selectedLoan ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
                    <AlertCircle size={20} />
                    <span>{errors.general}</span>
                  </div>
                )}

                {/* Informations du prêt sélectionné */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <CreditCard size={20} className="text-blue-600" />
                    <h3 className="font-medium text-blue-900">Prêt #{selectedLoan.id}</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Reste à payer:</span>
                      <p className="font-bold text-blue-900">{formatCurrency(selectedLoan.remainingAmount)}</p>
                    </div>
                    <div>
                      <span className="text-blue-700">Mensualité:</span>
                      <p className="font-bold text-blue-900">{formatCurrency(selectedLoan.monthlyPayment)}</p>
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
                  <p className="text-sm text-gray-500 mt-1">
                    Montant suggéré: {formatCurrency(selectedLoan.monthlyPayment)}
                  </p>
                </div>

                {/* Mode de paiement */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Mode de paiement
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: 'mobile_money', label: 'Mobile Money', description: 'Moov Money, MTN Mobile Money' },
                      { value: 'bank_transfer', label: 'Virement bancaire', description: 'Transfert vers notre compte bancaire' },
                      { value: 'cash', label: 'Espèces', description: 'Paiement en agence' }
                    ].map((method) => (
                      <label
                        key={method.value}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${
                          paymentMethod === method.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300'
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
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getPaymentMethodIcon(method.value)}</span>
                          <div>
                            <p className="font-medium text-gray-900">{method.label}</p>
                            <p className="text-sm text-gray-500">{method.description}</p>
                          </div>
                        </div>
                        {paymentMethod === method.value && (
                          <CheckCircle size={20} className="text-primary-600 ml-auto" />
                        )}
                      </label>
                    ))}
                  </div>
                  {errors.method && (
                    <p className="mt-1 text-sm text-red-500">{errors.method}</p>
                  )}
                </div>

                {/* Résumé du paiement */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Résumé du paiement</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Montant du paiement:</span>
                      <span className="font-medium">{formatCurrency(parseFloat(paymentAmount) || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mode de paiement:</span>
                      <span className="font-medium">{getPaymentMethodText(paymentMethod)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-900 font-medium">Total:</span>
                        <span className="text-gray-900 font-bold">{formatCurrency(parseFloat(paymentAmount) || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full"
                >
                  {loading ? 'Traitement...' : 'Effectuer le paiement'}
                </Button>
              </form>
            ) : (
              <div className="text-center py-8">
                <CreditCard size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Sélectionnez un prêt pour effectuer un paiement</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Repayment;

