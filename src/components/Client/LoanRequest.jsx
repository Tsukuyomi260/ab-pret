import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { ArrowLeft, Calculator, AlertCircle } from 'lucide-react';
import { calculateLoanInterest } from '../../utils/helpers';

const LoanRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: '',
    duration: '12',
    purpose: '',
    monthlyIncome: '',
    employmentStatus: 'employed'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [calculation, setCalculation] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Effacer l'erreur du champ
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }

    // Calculer automatiquement si montant et durée sont remplis
    if (name === 'amount' || name === 'duration') {
      if (formData.amount && formData.duration) {
        calculateLoan();
      }
    }
  };

  const calculateLoan = () => {
    const amount = parseFloat(formData.amount);
    const duration = parseInt(formData.duration);
    
    if (amount && duration) {
      // Taux d'intérêt annuel de 12% (1% par mois)
      const result = calculateLoanInterest(amount, 12, duration);
      setCalculation(result);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) < 10000) {
      newErrors.amount = 'Le montant minimum est de 10 000 FCFA';
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Veuillez préciser l\'objet du prêt';
    }

    if (!formData.monthlyIncome || parseFloat(formData.monthlyIncome) < 50000) {
      newErrors.monthlyIncome = 'Le revenu mensuel minimum est de 50 000 FCFA';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirection vers le dashboard avec un message de succès
      navigate('/dashboard', { 
        state: { message: 'Votre demande de prêt a été soumise avec succès' }
      });
    } catch (error) {
      setErrors({ general: 'Erreur lors de la soumission de la demande' });
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold text-gray-900">Demande de prêt</h1>
          <p className="text-gray-600">Remplissez le formulaire pour demander un prêt</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulaire */}
        <div className="lg:col-span-2">
          <Card title="Informations du prêt">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
                  <AlertCircle size={20} />
                  <span>{errors.general}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Montant demandé (FCFA)"
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="100000"
                  error={errors.amount}
                  required
                />

                <Input
                  label="Durée (mois)"
                  type="select"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  error={errors.duration}
                  required
                >
                  <option value="6">6 mois</option>
                  <option value="12">12 mois</option>
                  <option value="18">18 mois</option>
                  <option value="24">24 mois</option>
                  <option value="36">36 mois</option>
                </Input>
              </div>

              <Input
                label="Objet du prêt"
                type="textarea"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="Décrivez l'utilisation prévue du prêt..."
                error={errors.purpose}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Revenu mensuel (FCFA)"
                  type="number"
                  name="monthlyIncome"
                  value={formData.monthlyIncome}
                  onChange={handleChange}
                  placeholder="150000"
                  error={errors.monthlyIncome}
                  required
                />

                <Input
                  label="Statut professionnel"
                  type="select"
                  name="employmentStatus"
                  value={formData.employmentStatus}
                  onChange={handleChange}
                  required
                >
                  <option value="employed">Salarié</option>
                  <option value="self-employed">Indépendant</option>
                  <option value="business-owner">Chef d'entreprise</option>
                  <option value="student">Étudiant</option>
                </Input>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full"
              >
                {loading ? 'Soumission...' : 'Soumettre la demande'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Calculatrice */}
        <div className="space-y-6">
          <Card title="Calculatrice de prêt">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-primary-600">
                <Calculator size={20} />
                <span className="font-medium">Simulation</span>
              </div>

              {calculation ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Montant demandé:</span>
                    <span className="font-medium">{new Intl.NumberFormat('fr-BJ', { style: 'currency', currency: 'XOF' }).format(parseFloat(formData.amount))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Durée:</span>
                    <span className="font-medium">{formData.duration} mois</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mensualité:</span>
                    <span className="font-medium">{new Intl.NumberFormat('fr-BJ', { style: 'currency', currency: 'XOF' }).format(calculation.monthlyPayment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Intérêts totaux:</span>
                    <span className="font-medium">{new Intl.NumberFormat('fr-BJ', { style: 'currency', currency: 'XOF' }).format(calculation.totalInterest)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-900 font-medium">Total à rembourser:</span>
                    <span className="text-gray-900 font-bold">{new Intl.NumberFormat('fr-BJ', { style: 'currency', currency: 'XOF' }).format(calculation.totalAmount)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calculator size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Remplissez le montant et la durée pour voir la simulation</p>
                </div>
              )}
            </div>
          </Card>

          {/* Informations importantes */}
          <Card title="Informations importantes">
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                <p>Le taux d'intérêt annuel est de 12%</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                <p>Le montant minimum est de 10 000 FCFA</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                <p>Le revenu mensuel minimum est de 50 000 FCFA</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                <p>La durée maximale est de 36 mois</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoanRequest;

