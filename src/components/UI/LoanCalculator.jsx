import React, { useState, useEffect } from 'react';
import { LOAN_CONFIG } from '../../utils/loanConfig';
import Card from './Card';
import { Calculator, DollarSign, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

const LoanCalculator = ({ 
  onCalculate, 
  className = '', 
  initialAmount = '', 
  initialDuration = 1,
  syncWithForm = false 
}) => {
  const [amount, setAmount] = useState(initialAmount);
  const [duration, setDuration] = useState(initialDuration);
  const [calculation, setCalculation] = useState(null);
  const [errors, setErrors] = useState([]);

  // Synchroniser avec les props si syncWithForm est activé
  useEffect(() => {
    if (syncWithForm) {
      setAmount(initialAmount);
      setDuration(initialDuration);
    }
  }, [initialAmount, initialDuration, syncWithForm]);

  useEffect(() => {
    if (amount && duration) {
      const numAmount = parseFloat(amount);
      const numDuration = parseInt(duration);

      // Validation
      const validation = LOAN_CONFIG.validateLoan(numAmount, numDuration);
      setErrors(validation.errors);

      if (validation.isValid) {
        const interestRate = LOAN_CONFIG.getInterestRate(numDuration);
        const interestAmount = LOAN_CONFIG.calculateInterest(numAmount, numDuration);
        const totalAmount = LOAN_CONFIG.calculateTotalAmount(numAmount, numDuration);
        const monthlyPayment = LOAN_CONFIG.calculateMonthlyPayment(totalAmount, numDuration);

        const result = {
          principal: numAmount,
          duration: numDuration,
          interestRate,
          interestAmount,
          totalAmount,
          monthlyPayment,
          durationLabel: LOAN_CONFIG.durations.find(d => d.weeks === numDuration)?.label
        };

        setCalculation(result);
        
        // Appeler le callback si fourni
        if (onCalculate) {
          onCalculate(result);
        }
      } else {
        setCalculation(null);
      }
    }
  }, [amount, duration, onCalculate]);



  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  const getRateColor = (rate) => {
    return rate <= 15 ? 'text-green-600' : 'text-orange-600';
  };

  return (
    <Card className={`bg-white ${className}`}>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Calculator size={24} className="text-primary-600" />
          <h3 className="text-xl font-semibold text-secondary-900 font-montserrat">
            Calculateur de prêt
          </h3>
          {syncWithForm && (
            <div className="ml-auto">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                Synchronisé
              </span>
            </div>
          )}
        </div>

        {/* Formulaire */}
        <div className="space-y-4 mb-6">
          {/* Montant */}
          <div>
            <label className="block text-sm font-medium text-secondary-900 font-montserrat mb-2">
              Montant du prêt (FCFA)
            </label>
            <div className="relative">
              <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Entrez le montant"
                className={`w-full pl-10 pr-4 py-3 border border-accent-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  syncWithForm ? 'bg-gray-50 cursor-not-allowed' : ''
                }`}
                min={LOAN_CONFIG.amounts.min}
                max={LOAN_CONFIG.amounts.max}
                readOnly={syncWithForm}
              />
            </div>
            <p className="text-xs text-neutral-600 font-montserrat mt-1">
              Min: {formatCurrency(LOAN_CONFIG.amounts.min)} - Max: {formatCurrency(LOAN_CONFIG.amounts.max)}
            </p>
            {syncWithForm && (
              <p className="text-xs text-green-600 font-montserrat mt-1">
                💡 Synchronisé avec le formulaire principal
              </p>
            )}
          </div>

          {/* Durée */}
          <div>
            <label className="block text-sm font-medium text-secondary-900 font-montserrat mb-2">
              Durée du prêt
            </label>
            <div className="relative">
              <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className={`w-full pl-10 pr-4 py-3 border border-accent-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  syncWithForm ? 'bg-gray-50 cursor-not-allowed' : ''
                }`}
                disabled={syncWithForm}
              >
                {LOAN_CONFIG.durations.map((option) => (
                  <option key={option.value} value={option.weeks}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Erreurs */}
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <AlertCircle size={16} className="text-red-600" />
              <span className="text-sm font-medium text-red-700 font-montserrat">Erreurs de validation</span>
            </div>
            <ul className="mt-2 space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-sm text-red-600 font-montserrat">
                  • {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Résultats */}
        {calculation && (
          <div className="space-y-4">
            <div className="border-t border-accent-200 pt-4">
              <h4 className="text-lg font-semibold text-secondary-900 font-montserrat mb-4">
                Résultats du calcul
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Montant principal */}
                <div className="p-4 bg-accent-50 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign size={16} className="text-primary-600" />
                    <span className="text-sm font-medium text-secondary-900 font-montserrat">Montant principal</span>
                  </div>
                  <p className="text-lg font-bold text-secondary-900 font-montserrat">
                    {formatCurrency(calculation.principal)}
                  </p>
                </div>

                {/* Taux d'intérêt */}
                <div className="p-4 bg-accent-50 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp size={16} className="text-primary-600" />
                    <span className="text-sm font-medium text-secondary-900 font-montserrat">Taux d'intérêt</span>
                  </div>
                  <p className={`text-lg font-bold font-montserrat ${getRateColor(calculation.interestRate)}`}>
                    {calculation.interestRate}%
                  </p>
                </div>

                {/* Intérêts */}
                <div className="p-4 bg-accent-50 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp size={16} className="text-orange-600" />
                    <span className="text-sm font-medium text-secondary-900 font-montserrat">Intérêts</span>
                  </div>
                  <p className="text-lg font-bold text-orange-600 font-montserrat">
                    {formatCurrency(calculation.interestAmount)}
                  </p>
                </div>

                {/* Montant total */}
                <div className="p-4 bg-primary-50 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign size={16} className="text-primary-600" />
                    <span className="text-sm font-medium text-secondary-900 font-montserrat">Total à rembourser</span>
                  </div>
                  <p className="text-lg font-bold text-primary-600 font-montserrat">
                    {formatCurrency(calculation.totalAmount)}
                  </p>
                </div>
              </div>

              {/* Informations supplémentaires */}
              <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-start space-x-2">
                  <Calendar size={16} className="text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-700 font-montserrat">
                      Durée: {calculation.durationLabel}
                    </p>
                    <p className="text-xs text-blue-600 font-montserrat mt-1">
                      {calculation.duration <= 4 
                        ? 'Paiement unique à la fin de la période'
                        : `Paiement mensuel de ${formatCurrency(calculation.monthlyPayment)}`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default LoanCalculator; 