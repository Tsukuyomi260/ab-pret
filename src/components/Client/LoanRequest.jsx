import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useNotification } from '../../context/NotificationContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import LoanCalculator from '../UI/LoanCalculator';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { LOAN_CONFIG } from '../../utils/loanConfig';

const LoanRequest = () => {

  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: '',
    duration: 1, // 1 semaine par défaut
    purpose: '',
    monthlyIncome: '',
    employmentStatus: 'employed'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});


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
        // La calculatrice se met à jour automatiquement
      }
    }
  };

  const handleCalculation = (result) => {
    setFormData(prev => ({
      ...prev,
      amount: result.principal.toString(),
      duration: result.duration
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) < LOAN_CONFIG.amounts.min) {
      newErrors.amount = `Le montant minimum est de ${LOAN_CONFIG.amounts.min.toLocaleString()} FCFA`;
    }

    if (parseFloat(formData.amount) > LOAN_CONFIG.amounts.max) {
      newErrors.amount = `Le montant maximum est de ${LOAN_CONFIG.amounts.max.toLocaleString()} FCFA`;
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Veuillez préciser l\'objet du prêt';
    }

    if (!formData.monthlyIncome) {
      newErrors.monthlyIncome = 'Le revenu mensuel est requis';
    } else {
      const income = parseFloat(formData.monthlyIncome);
      const incomeValidation = LOAN_CONFIG.validateMonthlyIncome(income);
      if (!incomeValidation.isValid) {
        newErrors.monthlyIncome = incomeValidation.errors[0];
      }
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
      
      showSuccess('Demande de prêt soumise avec succès !');
      navigate('/dashboard');
    } catch (error) {
      showError('Erreur lors de la soumission de la demande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header centré style Apple */}
      <div className="text-center py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 font-montserrat mb-3">
            Demande de prêt
          </h1>
          <p className="text-lg text-gray-600 font-montserrat leading-relaxed">
            Remplissez le formulaire ci-dessous pour demander votre prêt. 
            Notre équipe traitera votre demande dans les plus brefs délais.
          </p>
        </div>
      </div>

      {/* Contenu principal centré */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulaire */}
        <div className="lg:col-span-2">
          <Card title="Informations du prêt" className="bg-white/90 backdrop-blur-sm border-white/20">
            <div className="space-y-6">
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
                  placeholder="50000"
                  min={LOAN_CONFIG.amounts.min}
                  max={LOAN_CONFIG.amounts.max}
                  error={errors.amount}
                  required
                />

                <Input
                  label="Durée du prêt"
                  type="select"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  error={errors.duration}
                  required
                >
                  {LOAN_CONFIG.durations.map((option) => (
                    <option key={option.value} value={option.weeks}>
                      {option.label}
                    </option>
                  ))}
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
                  placeholder={`${LOAN_CONFIG.monthlyIncome.min.toLocaleString()} - ${LOAN_CONFIG.monthlyIncome.max.toLocaleString()}`}
                  min={LOAN_CONFIG.monthlyIncome.min}
                  max={LOAN_CONFIG.monthlyIncome.max}
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
            </div>
          </Card>
        </div>

        {/* Calculatrice */}
        <div className="space-y-6">
          <LoanCalculator onCalculate={handleCalculation} />

          {/* Informations importantes */}
          <Card title="Informations importantes" className="bg-white/90 backdrop-blur-sm border-white/20">
            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3 p-3 bg-accent-50/50 rounded-xl">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 font-medium">Taux d'intérêt: <span className="text-primary-600">10%</span> pour les prêts de 1-2 semaines, <span className="text-primary-600">35%</span> pour les prêts de plus d'un mois</p>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-accent-50/50 rounded-xl">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 font-medium">Montant minimum: <span className="text-primary-600">{LOAN_CONFIG.amounts.min.toLocaleString()} FCFA</span></p>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-accent-50/50 rounded-xl">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 font-medium">Montant maximum: <span className="text-primary-600">{LOAN_CONFIG.amounts.max.toLocaleString()} FCFA</span></p>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-accent-50/50 rounded-xl">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 font-medium">Durées disponibles: <span className="text-primary-600">1 semaine, 2 semaines, 1 mois</span></p>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-accent-50/50 rounded-xl">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 font-medium">Revenu mensuel: <span className="text-primary-600">{LOAN_CONFIG.monthlyIncome.min.toLocaleString()} - {LOAN_CONFIG.monthlyIncome.max.toLocaleString()} FCFA</span></p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Section de soumission centrée */}
      <div className="max-w-4xl mx-auto mt-8">
        <Card title="Soumission de la demande" className="bg-white/90 backdrop-blur-sm">
          <div className="text-center space-y-6">
            <div className="bg-blue-50/80 border border-blue-200/50 rounded-2xl p-6">
              <p className="text-blue-800 font-medium mb-3 text-lg">
                📋 Vérifiez vos informations
              </p>
              <p className="text-blue-700 text-base leading-relaxed">
                Assurez-vous que toutes les informations sont correctes et que vous avez bien vu les calculs de votre prêt avant de soumettre votre demande.
              </p>
            </div>
            
            <Button
              onClick={handleSubmit}
              loading={loading}
              className="px-12 py-4 text-lg bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? 'Soumission...' : 'Soumettre la demande'}
            </Button>
          </div>
        </Card>
      </div>
      </div>
    </div>
  );
};

export default LoanRequest;

