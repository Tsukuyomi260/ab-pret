import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../context/NotificationContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import LoanCalculator from '../UI/LoanCalculator';
import { 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Clock, 
  Star,
  Zap,
  Target,
  BookOpen,
  ShoppingBag,
  Home,
  Car,
  Heart,
  Smartphone,
  GraduationCap,
  Briefcase,
  User,
  FileText,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { LOAN_CONFIG } from '../../utils/loanConfig';
import { formatCurrency } from '../../utils/helpers';

const LoanRequest = () => {
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    amount: '',
    duration: 1,
    purpose: '',
    monthlyIncome: '',
    employmentStatus: 'employed',
    category: '',
    documents: []
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');

  // Catégories de prêts avec icônes et couleurs
  const loanCategories = [
    { 
      id: 'education', 
      name: 'Éducation', 
      icon: <BookOpen className="w-6 h-6" />, 
      color: 'from-blue-500 to-blue-600',
      description: 'Frais de scolarité, matériel scolaire, formation'
    },
    { 
      id: 'business', 
      name: 'Entreprise', 
      icon: <ShoppingBag className="w-6 h-6" />, 
      color: 'from-green-500 to-green-600',
      description: 'Démarrage d\'activité, investissement, stock'
    },
    { 
      id: 'housing', 
      name: 'Logement', 
      icon: <Home className="w-6 h-6" />, 
      color: 'from-orange-500 to-orange-600',
      description: 'Loyer, rénovation, ameublement'
    },
    { 
      id: 'personal', 
      name: 'Raison personnelle', 
      icon: <User className="w-6 h-6" />, 
      color: 'from-purple-500 to-purple-600',
      description: 'Voyage, événement spécial, projet personnel'
    },
    { 
      id: 'health', 
      name: 'Santé', 
      icon: <Heart className="w-6 h-6" />, 
      color: 'from-pink-500 to-pink-600',
      description: 'Soins médicaux, médicaments, consultation'
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setFormData(prev => ({
      ...prev,
      category: categoryId
    }));
  };

  const handleCalculation = (result) => {
    setFormData(prev => ({
      ...prev,
      amount: result.principal.toString(),
      duration: result.duration
    }));
  };

  // Calcul automatique quand le montant ou la durée change
  useEffect(() => {
    if (formData.amount && formData.duration) {
      const numAmount = parseFloat(formData.amount);
      const numDuration = parseInt(formData.duration);
      
      if (numAmount >= LOAN_CONFIG.amounts.min && numAmount <= LOAN_CONFIG.amounts.max) {
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

        handleCalculation(result);
      }
    }
  }, [formData.amount, formData.duration]);

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!selectedCategory) {
          newErrors.category = 'Veuillez sélectionner une catégorie';
        }
        break;
      case 2:
    if (!formData.amount || parseFloat(formData.amount) < LOAN_CONFIG.amounts.min) {
      newErrors.amount = `Le montant minimum est de ${LOAN_CONFIG.amounts.min.toLocaleString()} FCFA`;
    }
    if (parseFloat(formData.amount) > LOAN_CONFIG.amounts.max) {
      newErrors.amount = `Le montant maximum est de ${LOAN_CONFIG.amounts.max.toLocaleString()} FCFA`;
    }
        if (!formData.duration) {
          newErrors.duration = 'Veuillez sélectionner une durée';
        }
        break;
      case 3:
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
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      // Scroll vers le haut de la page avec animation fluide
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    // Scroll vers le haut de la page avec animation fluide
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;

    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitted(true);
      
      // Attendre un peu pour montrer l'animation de succès
      setTimeout(() => {
        showSuccess('Demande de prêt soumise avec succès ! Notre équipe vous contactera dans les 24h.');
      navigate('/dashboard');
      }, 1500);
      
    } catch (error) {
      showError('Erreur lors de la soumission de la demande');
      setLoading(false);
    }
  };

  const getStepIcon = (step) => {
    switch (step) {
      case 1: return <Target className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 2: return <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 3: return <User className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 4: return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />;
      default: return <FileText className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  const getStepTitle = (step) => {
    switch (step) {
      case 1: return 'Catégorie du prêt';
      case 2: return 'Montant et durée';
      case 3: return 'Informations personnelles';
      case 4: return 'Validation';
      default: return 'Étape';
    }
  };

  return (
    <div id="loan-request-page" className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50">
      {/* Header avec gradient et animations */}
      <motion.div 
        className="relative overflow-hidden"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10" />
        <div className="relative px-4 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {/* En-tête principal */}
            <div className="text-center mb-8">
              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center mb-6 space-y-4 sm:space-y-0 sm:space-x-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="p-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full shadow-lg">
                  <CreditCard className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary-900 font-montserrat text-center sm:text-left">
            Demande de prêt
          </h1>
              </motion.div>
              <motion.p 
                className="text-lg sm:text-xl text-secondary-600 font-montserrat max-w-3xl mx-auto text-center leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Remplissez les étapes ci-dessous pour demander votre prêt. 
                Notre processus est simple, rapide et sécurisé.
              </motion.p>
            </div>

            {/* Indicateur de progression */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-center space-x-2 sm:space-x-4 px-4 max-w-md mx-auto">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center flex-1 max-w-16 sm:max-w-20">
                    <div className={`flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-300 flex-shrink-0 ${
                      step <= currentStep 
                        ? 'bg-primary-500 border-primary-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {step < currentStep ? (
                        <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 flex-shrink-0" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          {getStepIcon(step)}
                        </div>
                      )}
                    </div>
                    {step < 4 && (
                      <div className={`flex-1 h-1 mx-1 sm:mx-2 transition-all duration-300 ${
                        step < currentStep ? 'bg-primary-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center mt-4 px-4 max-w-md mx-auto">
                <p className="text-base sm:text-lg font-semibold text-secondary-900 font-montserrat">
                  {getStepTitle(currentStep)}
                </p>
                <p className="text-xs sm:text-sm text-secondary-600 font-montserrat">
                  Étape {currentStep} sur 4
                </p>
              </div>
            </motion.div>

            {/* Contenu des étapes */}
            <div className="max-w-6xl mx-auto">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                  >
                    {/* Sélection de catégorie */}
                    <Card className="bg-white">
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-secondary-900 font-montserrat mb-2">
                          Choisissez votre catégorie
                        </h3>
                        <p className="text-secondary-600 font-montserrat">
                          Sélectionnez la catégorie qui correspond le mieux à votre besoin
          </p>
        </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {loanCategories.map((category) => (
                          <motion.div
                            key={category.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                              selectedCategory === category.id
                                ? 'border-primary-500 bg-primary-50 shadow-lg'
                                : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
                            }`}
                            onClick={() => handleCategorySelect(category.id)}
                          >
                            <div className="flex items-center space-x-3 mb-2">
                              <div className={`p-2 bg-gradient-to-r ${category.color} rounded-lg text-white`}>
                                {category.icon}
                              </div>
                              <h4 className="font-semibold text-secondary-900 font-montserrat">
                                {category.name}
                              </h4>
                            </div>
                            <p className="text-sm text-secondary-600 font-montserrat">
                              {category.description}
                            </p>
                          </motion.div>
                        ))}
      </div>

                      {errors.category && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2">
                  <AlertCircle size={20} />
                          <span>{errors.category}</span>
                </div>
              )}
                    </Card>

                    {/* Informations sur les catégories */}
                    <div className="space-y-6">
                      <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                        <div className="flex items-center space-x-3 mb-4">
                          <Sparkles className="w-8 h-8" />
                          <h3 className="text-xl font-bold font-montserrat">
                            Pourquoi choisir AB PRET ?
                          </h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-300" />
                            <span className="font-montserrat">Traitement rapide en 24h</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-300" />
                            <span className="font-montserrat">Taux d'intérêt compétitifs</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-300" />
                            <span className="font-montserrat">Processus simplifié</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-300" />
                            <span className="font-montserrat">Support client 24/7</span>
                          </div>
                        </div>
                      </Card>

                      <Card className="bg-white">
                        <div className="flex items-center space-x-3 mb-4">
                          <Shield className="w-6 h-6 text-primary-600" />
                          <h3 className="text-lg font-semibold text-secondary-900 font-montserrat">
                            Sécurité garantie
                          </h3>
                        </div>
                        <p className="text-secondary-600 font-montserrat text-sm">
                          Vos données sont protégées et sécurisées. Nous respectons les normes de sécurité les plus strictes.
                        </p>
                      </Card>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                  >
                    {/* Formulaire montant et durée */}
                    <div className="lg:col-span-2">
                      <Card className="bg-white">
                        <div className="mb-6">
                          <h3 className="text-2xl font-bold text-secondary-900 font-montserrat mb-2">
                            Montant et durée
                          </h3>
                          <p className="text-secondary-600 font-montserrat">
                            Définissez le montant que vous souhaitez emprunter et la durée de remboursement
                          </p>
                        </div>
                        
                        <div className="space-y-6">
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

                            <div>
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
                              {formData.amount && formData.duration && (
                                <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                                  <p className="text-xs text-blue-700 font-montserrat">
                                    💰 Taux d'intérêt: <span className="font-semibold">
                                      {LOAN_CONFIG.getInterestRate(parseInt(formData.duration))}%
                                    </span>
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Calculatrice */}
                    <div className="space-y-6">
                      <LoanCalculator 
                        onCalculate={handleCalculation}
                        initialAmount={formData.amount}
                        initialDuration={formData.duration}
                        syncWithForm={true}
                      />
                      
                      <Card className="bg-white">
                        <div className="flex items-center space-x-3 mb-4">
                          <TrendingUp className="w-6 h-6 text-primary-600" />
                          <h3 className="text-lg font-semibold text-secondary-900 font-montserrat">
                            Taux d'intérêt
                          </h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span className="text-sm font-medium text-green-800 font-montserrat">Prêts courts (1-2 semaines)</span>
                            <span className="text-lg font-bold text-green-600 font-montserrat">10%</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                            <span className="text-sm font-medium text-orange-800 font-montserrat">Prêts longs (&gt; 1 mois)</span>
                            <span className="text-lg font-bold text-orange-600 font-montserrat">35%</span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                  >
                    {/* Informations personnelles */}
                    <Card className="bg-white">
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-secondary-900 font-montserrat mb-2">
                          Informations personnelles
                        </h3>
                        <p className="text-secondary-600 font-montserrat">
                          Aidez-nous à mieux comprendre votre situation financière
                        </p>
              </div>

                      <div className="space-y-6">
              <Input
                label="Objet du prêt"
                type="textarea"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                          placeholder="Décrivez en détail l'utilisation prévue du prêt..."
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

          {/* Informations importantes */}
                    <div className="space-y-6">
                      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <div className="flex items-center space-x-3 mb-4">
                          <Clock className="w-6 h-6" />
                          <h3 className="text-lg font-semibold font-montserrat">
                            Délais de traitement
                          </h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-300" />
                            <span className="font-montserrat">Validation automatique : 2h</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-300" />
                            <span className="font-montserrat">Validation manuelle : 24h</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-300" />
                            <span className="font-montserrat">Versement : 48h max</span>
                          </div>
                        </div>
                      </Card>

                      <Card className="bg-white">
                        <div className="flex items-center space-x-3 mb-4">
                          <Shield className="w-6 h-6 text-primary-600" />
                          <h3 className="text-lg font-semibold text-secondary-900 font-montserrat">
                            Documents requis
                          </h3>
              </div>
                        <div className="space-y-2 text-sm text-secondary-600 font-montserrat">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Pièce d'identité valide</span>
              </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Justificatif de domicile</span>
              </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Justificatif de revenus</span>
              </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Relevé bancaire (3 mois)</span>
              </div>
            </div>
          </Card>
        </div>
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-4xl mx-auto"
                  >
                    <Card className="bg-white">
                      <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
                        <h3 className="text-2xl font-bold text-secondary-900 font-montserrat mb-2">
                          Récapitulatif de votre demande
                        </h3>
                        <p className="text-secondary-600 font-montserrat">
                          Vérifiez toutes les informations avant de soumettre votre demande
              </p>
            </div>
            
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-4">
                          <div className="p-4 bg-accent-50 rounded-xl">
                            <h4 className="font-semibold text-secondary-900 font-montserrat mb-2">Détails du prêt</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-secondary-600 font-montserrat">Catégorie:</span>
                                <span className="font-medium text-secondary-900 font-montserrat">
                                  {loanCategories.find(c => c.id === selectedCategory)?.name}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-secondary-600 font-montserrat">Montant:</span>
                                <span className="font-medium text-secondary-900 font-montserrat">
                                  {formatCurrency(parseFloat(formData.amount) || 0)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-secondary-600 font-montserrat">Durée:</span>
                                <span className="font-medium text-secondary-900 font-montserrat">
                                  {LOAN_CONFIG.durations.find(d => d.weeks === parseInt(formData.duration))?.label}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="p-4 bg-accent-50 rounded-xl">
                            <h4 className="font-semibold text-secondary-900 font-montserrat mb-2">Informations personnelles</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-secondary-600 font-montserrat">Revenu mensuel:</span>
                                <span className="font-medium text-secondary-900 font-montserrat">
                                  {formatCurrency(parseFloat(formData.monthlyIncome) || 0)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-secondary-600 font-montserrat">Statut:</span>
                                <span className="font-medium text-secondary-900 font-montserrat">
                                  {formData.employmentStatus === 'employed' ? 'Salarié' : 
                                   formData.employmentStatus === 'self-employed' ? 'Indépendant' :
                                   formData.employmentStatus === 'business-owner' ? 'Chef d\'entreprise' : 'Étudiant'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="w-6 h-6 text-blue-600 mt-1" />
                          <div>
                            <h4 className="font-semibold text-blue-900 font-montserrat mb-2">
                              Important à savoir
                            </h4>
                            <ul className="text-blue-800 font-montserrat text-sm space-y-1">
                              <li>• Votre demande sera traitée dans les 24h</li>
                              <li>• Vous recevrez un email de confirmation</li>
                              <li>• Notre équipe vous contactera pour finaliser le processus</li>
                              <li>• Le versement sera effectué sous 48h après approbation</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation entre les étapes */}
              <motion.div 
                className="flex justify-between items-center mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Précédent</span>
                </Button>

                {currentStep < 4 ? (
                  <Button
                    onClick={nextStep}
                    className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600"
                  >
                    <span>Suivant</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={submitted ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  >
            <Button
              onClick={handleSubmit}
                      disabled={loading || submitted}
                      className={`relative overflow-hidden flex items-center space-x-2 px-4 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg transition-all duration-500 ${
                        submitted 
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/50' 
                          : loading
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                          : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl hover:shadow-green-500/50 transform hover:scale-105'
                      }`}
                    >
                      {submitted ? (
                        <>
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex items-center justify-center"
                          >
                            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                          </motion.div>
                          <motion.span
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.4 }}
                          >
                            Demande soumise !
                          </motion.span>
                        </>
                      ) : loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="flex items-center justify-center"
                          >
                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full" />
                          </motion.div>
                          <span>Soumission en cours...</span>
                        </>
                      ) : (
                        <>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="flex items-center justify-center"
                          >
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                          </motion.div>
                          <span>Soumettre la demande</span>
                        </>
                      )}
            </Button>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
      </div>
      </motion.div>
    </div>
  );
};

export default LoanRequest;

