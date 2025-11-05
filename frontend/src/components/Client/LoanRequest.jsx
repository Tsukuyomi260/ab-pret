import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  ArrowLeft, 
  ArrowRight,
  AlertCircle, 
  CheckCircle, 
  CreditCard, 
  DollarSign, 
  Clock, 
  BookOpen,
  ShoppingBag,
  Home,
  Heart,
  User,
  FileText,
  Send,
  Calendar,
  Check
} from 'lucide-react';
import { LOAN_CONFIG } from '../../utils/loanConfig';
import { formatCurrency } from '../../utils/helpers';
import { getLoans, createLoan } from '../../utils/supabaseAPI';
import { BACKEND_URL } from '../../config/backend';
import { supabase } from '../../utils/supabaseClient';

const LoanRequest = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    amount: '',
    duration: 5,
    purpose: '',
    employmentStatus: 'student',
    guarantee: '',
    momoNumber: '',
    momoNetwork: '',
    momoName: '',
    category: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loanId, setLoanId] = useState(null);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [showPdfStep, setShowPdfStep] = useState(false);
  const [errors, setErrors] = useState({});
  const [calculation, setCalculation] = useState(null);
  const [hasActiveLoan, setHasActiveLoan] = useState(false);
  const [checkingLoans, setCheckingLoans] = useState(true);

  const totalSteps = 4;

  useEffect(() => {
    checkExistingLoans();
  }, [user?.id]);

    const checkExistingLoans = async () => {
      try {
        setCheckingLoans(true);
        const loansResult = await getLoans(user.id);
        
        if (loansResult.success) {
          const userLoans = loansResult.data || [];
          const activeLoan = userLoans.find(loan => 
            loan.status === 'active' || loan.status === 'approved' || loan.status === 'overdue'
          );
          
          setHasActiveLoan(!!activeLoan);
          
          if (activeLoan) {
            if (activeLoan.status === 'overdue') {
            showError('Vous ne pouvez pas demander un nouveau prêt tant que votre prêt en retard n\'est pas remboursé.');
            } else {
              showError('Vous avez déjà un prêt en cours. Vous devez le rembourser avant de faire une nouvelle demande.');
            }
          }
        }
      } catch (error) {
      console.error('[LOAN_REQUEST] Erreur:', error);
      } finally {
        setCheckingLoans(false);
      }
    };

  useEffect(() => {
    if (formData.amount && formData.duration) {
      calculateLoan();
    }
  }, [formData.amount, formData.duration]);

  const calculateLoan = () => {
    const amount = parseFloat(formData.amount);
    const duration = parseInt(formData.duration);
    
    if (!amount || amount < LOAN_CONFIG.amounts.min || amount > LOAN_CONFIG.amounts.max) {
      setCalculation(null);
      return;
    }

    const interestRate = LOAN_CONFIG.getInterestRate(duration, amount);
    const interest = Math.round(LOAN_CONFIG.calculateInterest(amount, duration));
    const totalAmount = Math.round(LOAN_CONFIG.calculateTotalAmount(amount, duration));

    setCalculation({
      principal: amount,
      interest,
      totalAmount,
      interestRate,
      duration
    });
  };

  const loanCategories = [
    { 
      id: 'education', 
      name: 'Éducation', 
      icon: BookOpen, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    { 
      id: 'business', 
      name: 'Entreprise', 
      icon: ShoppingBag, 
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    { 
      id: 'housing', 
      name: 'Logement', 
      icon: Home, 
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    { 
      id: 'personal', 
      name: 'Personnel', 
      icon: User, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    { 
      id: 'health', 
      name: 'Santé', 
      icon: Heart, 
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600'
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
    setFormData(prev => ({
      ...prev,
      category: categoryId
    }));
    setErrors(prev => ({ ...prev, category: '' }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.category) {
          newErrors.category = 'Veuillez sélectionner une catégorie';
        }
    }
    
    if (step === 2) {
      const amount = parseFloat(formData.amount);
      if (!amount || amount < LOAN_CONFIG.amounts.min) {
        newErrors.amount = `Le montant minimum est ${formatCurrency(LOAN_CONFIG.amounts.min)}`;
      } else if (amount > LOAN_CONFIG.amounts.max) {
        newErrors.amount = `Le montant maximum est ${formatCurrency(LOAN_CONFIG.amounts.max)}`;
      }
    }
    
    if (step === 3) {
      if (!formData.purpose || formData.purpose.trim().length < 10) {
        newErrors.purpose = 'Veuillez décrire l\'utilisation du prêt (min. 10 caractères)';
      }
      
      if (!formData.guarantee) {
        newErrors.guarantee = 'Veuillez sélectionner une garantie';
      }
    }
    
    if (step === 4) {
      if (!formData.momoNumber || formData.momoNumber.trim().length < 8) {
        newErrors.momoNumber = 'Numéro Mobile Money invalide';
      }
      
        if (!formData.momoNetwork) {
        newErrors.momoNetwork = 'Veuillez sélectionner votre opérateur';
        }
      
      if (!formData.momoName || formData.momoName.trim().length < 3) {
        newErrors.momoName = 'Veuillez entrer le nom du compte Mobile Money';
        }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      showError('Veuillez corriger les erreurs avant de continuer');
    }
  };

  const generatePreviewPDF = async () => {
    try {
      setLoading(true);
      
      // Récupérer les données complètes de l'utilisateur depuis Supabase
      if (!supabase) {
        throw new Error('Connexion à la base de données non disponible');
      }
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (userError) {
        console.error('[PDF] Erreur récupération utilisateur:', userError);
        throw new Error('Impossible de récupérer vos informations');
      }
      
      console.log('[PDF] Données utilisateur récupérées:', {
        id: userData.id,
        name: `${userData.first_name} ${userData.last_name}`,
        hasTemoinName: !!userData.temoin_name,
        hasTemoinPhone: !!userData.temoin_phone,
        hasTemoinQuartier: !!userData.temoin_quartier
      });
      
      const amount = parseFloat(formData.amount);
      const duration = parseInt(formData.duration);
      const interestRate = LOAN_CONFIG.getInterestRate(duration, amount);
      const interest = Math.round(LOAN_CONFIG.calculateInterest(amount, duration));
      const totalAmount = Math.round(LOAN_CONFIG.calculateTotalAmount(amount, duration));
      
      const pdfData = {
        user: {
          first_name: userData.first_name || user.user_metadata?.first_name,
          last_name: userData.last_name || user.user_metadata?.last_name,
          email: userData.email || user.email,
          phone_number: userData.phone_number || user.phone,
          temoin_name: userData.temoin_name,
          temoin_phone: userData.temoin_phone,
          temoin_quartier: userData.temoin_quartier,
          temoin_email: userData.temoin_email
        },
        loan: {
          amount: amount,
          duration: duration,
          interest_rate: interestRate,
          purpose: formData.purpose,
          guarantee: formData.guarantee,
          category: formData.category
        },
        calculation: {
          interest: interest,
          totalAmount: totalAmount
        }
      };

      console.log('[PDF] Envoi des données:', pdfData);
      
      const response = await fetch(`${BACKEND_URL}/api/generate-preview-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pdfData),
      });

      console.log('[PDF] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[PDF] Erreur serveur:', errorText);
        throw new Error(`Erreur lors de la génération du PDF: ${response.status} - ${errorText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `engagement-pret-preview.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setPdfDownloaded(true);
      showSuccess('PDF téléchargé avec succès ! Vous pouvez maintenant soumettre votre demande.');
    } catch (error) {
      console.error('[PDF] Erreur complète:', error);
      console.error('[PDF] Message:', error.message);
      console.error('[PDF] Stack:', error.stack);
      showError(error.message || 'Erreur lors de la génération du PDF');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!pdfDownloaded) {
      showError('Veuillez télécharger le PDF d\'engagement avant de soumettre');
      return;
    }

    if (!validateStep(currentStep)) {
      showError('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    if (hasActiveLoan) {
      showError('Vous avez déjà un prêt en cours');
      return;
    }

    setLoading(true);
    
    try {
      const amount = parseFloat(formData.amount);
      const duration = parseInt(formData.duration);
      const interestRate = LOAN_CONFIG.getInterestRate(duration, amount);
      
    const loanData = {
        user_id: user.id,
        amount: amount,
        duration: duration,
        duration_months: duration,
        interest_rate: interestRate,
        purpose: formData.purpose,
      employment_status: formData.employmentStatus,
      guarantee: formData.guarantee,
      momo_number: formData.momoNumber,
      momo_network: formData.momoNetwork,
      momo_name: formData.momoName,
        status: 'pending'
        // loan_type retiré car la colonne n'existe pas dans la table loans
      };

      console.log('[LOAN_REQUEST] Création du prêt via Supabase');
      console.log('[LOAN_REQUEST] Données:', loanData);

      // Utiliser la fonction createLoan de supabaseAPI
      const result = await createLoan(loanData);

      console.log('[LOAN_REQUEST] Résultat:', result);

      if (result.success && result.data) {
        setLoanId(result.data.id);
      setSubmitted(true);
        showSuccess('Demande de prêt soumise avec succès !');
      } else {
        throw new Error(result.error || 'Erreur lors de la soumission');
      }
    } catch (error) {
      console.error('[LOAN_REQUEST] Erreur:', error);
      showError(error.message || 'Erreur lors de la soumission de la demande');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!loanId) {
      showError('ID de prêt manquant');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/generate-pdf/${loanId}`);

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `engagement-pret-${loanId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setPdfDownloaded(true);
      showSuccess('PDF téléchargé avec succès !');
    } catch (error) {
      console.error('[PDF] Erreur:', error);
      showError('Erreur lors du téléchargement du PDF');
    }
  };

  if (checkingLoans) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Vérification...</p>
          </div>
        </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
            </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4 font-montserrat">Demande envoyée !</h2>
          <p className="text-gray-600 mb-6 font-montserrat">
            Votre demande de prêt a été soumise avec succès. Nous l'examinerons dans les plus brefs délais.
          </p>

          {!pdfDownloaded && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6 text-left">
              <div className="flex items-start gap-3">
                <FileText size={24} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-blue-900 mb-1">Document d'engagement</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Veuillez télécharger et signer votre document d'engagement de prêt.
                  </p>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 text-sm"
                  >
                    <FileText size={18} />
                    <span>Télécharger le PDF</span>
                  </button>
            </div>
          </div>
        </div>
          )}

          {pdfDownloaded && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-6 text-left">
              <div className="flex items-start gap-3">
                <CheckCircle size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-green-900 mb-1">PDF téléchargé</h3>
                  <p className="text-sm text-green-700">
                    Veuillez signer le document et le conserver précieusement.
                  </p>
        </div>
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200"
          >
            <ArrowLeft size={20} />
            <span>Retour au tableau de bord</span>
          </button>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: 'Catégorie', icon: FileText },
    { number: 2, title: 'Montant', icon: DollarSign },
    { number: 3, title: 'Détails', icon: FileText },
    { number: 4, title: 'Paiement', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-24">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/50 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft size={24} className="text-gray-700" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                  <CreditCard size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-montserrat">Demande de prêt</h1>
                  <p className="text-sm text-gray-600 font-montserrat">Étape {currentStep} sur {totalSteps}</p>
                </div>
              </div>
            </div>
            </div>

          {/* Progress Steps */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      currentStep > step.number
                        ? 'bg-green-500 text-white'
                        : currentStep === step.number
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {currentStep > step.number ? (
                        <Check size={24} />
                      ) : (
                        <step.icon size={24} />
                      )}
                    </div>
                    <p className={`text-xs mt-2 font-medium ${
                      currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                </React.Fragment>
                ))}
              </div>
              </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message d'avertissement si prêt actif */}
        {hasActiveLoan && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-900 mb-1">Prêt actif détecté</h3>
                <p className="text-sm text-red-700">
                  Vous avez déjà un prêt en cours. Vous devez le rembourser avant de faire une nouvelle demande.
                        </p>
                      </div>
                                  </div>
                                  </div>
                                )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Catégorie */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-montserrat flex items-center gap-2">
                <FileText size={24} className="text-blue-600" />
                Sélectionnez la catégorie de votre prêt
              </h2>
              <p className="text-gray-600 mb-6">Choisissez la catégorie qui correspond le mieux à votre besoin</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {loanCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategorySelect(category.id)}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                      formData.category === category.id
                        ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-16 h-16 ${category.bgColor} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                      <category.icon size={32} className={category.iconColor} />
                            </div>
                    <p className="text-sm font-medium text-gray-900 text-center">{category.name}</p>
                  </button>
                        ))}
                      </div>
                      {errors.category && (
                <p className="text-red-500 text-sm mt-4">{errors.category}</p>
              )}
                        </div>
                      )}

          {/* Step 2: Montant et Durée */}
                {currentStep === 2 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-montserrat flex items-center gap-2">
                <DollarSign size={24} className="text-green-600" />
                Montant et durée du prêt
              </h2>
              <p className="text-gray-600 mb-6">Indiquez le montant souhaité et la durée de remboursement</p>
                        
                        <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant souhaité <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                              type="number"
                              name="amount"
                              value={formData.amount}
                              onChange={handleChange}
                      placeholder="Ex: 50000"
                      min={LOAN_CONFIG.amounts.min}
                      max={LOAN_CONFIG.amounts.max}
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.amount ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Min: {formatCurrency(LOAN_CONFIG.amounts.min)} - Max: {formatCurrency(LOAN_CONFIG.amounts.max)}
                  </p>
                </div>

                            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                    >
                      {LOAN_CONFIG.durations.map((duration) => (
                        <option key={duration.value} value={duration.value}>
                          {duration.label}
                                  </option>
                                ))}
                    </select>
                            </div>
                  <p className="text-xs text-gray-500 mt-1">Choisissez la durée de remboursement</p>
                    </div>

                {/* Calcul */}
                {calculation && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                    <h3 className="font-bold text-gray-900 mb-4">Récapitulatif</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Montant demandé</span>
                        <span className="font-bold text-gray-900">{formatCurrency(calculation.principal)}</span>
                            </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Intérêts ({calculation.interestRate}%)</span>
                        <span className="font-bold text-orange-600">{formatCurrency(calculation.interest)}</span>
                                  </div>
                      <div className="border-t border-gray-300 pt-3 flex justify-between">
                        <span className="font-bold text-gray-900">Montant total à rembourser</span>
                        <span className="font-bold text-2xl text-blue-600">{formatCurrency(calculation.totalAmount)}</span>
                                  </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Durée</span>
                        <span className="font-medium text-gray-900">{calculation.duration} jours</span>
                                  </div>
                                  </div>
                                </div>
                )}
                              </div>
                            </div>
          )}

          {/* Step 3: Détails */}
                {currentStep === 3 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-montserrat flex items-center gap-2">
                <FileText size={24} className="text-purple-600" />
                Détails de la demande
              </h2>
              <p className="text-gray-600 mb-6">Fournissez plus d'informations sur votre demande</p>

                      <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Utilisation du prêt <span className="text-red-500">*</span>
                  </label>
                  <textarea
                          name="purpose"
                          value={formData.purpose}
                          onChange={handleChange}
                    placeholder="Décrivez précisément l'utilisation du prêt..."
                    rows="4"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.purpose ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  {errors.purpose && (
                    <p className="text-red-500 text-sm mt-1">{errors.purpose}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut professionnel <span className="text-red-500">*</span>
                  </label>
                  <select
                          name="employmentStatus"
                          value={formData.employmentStatus}
                          onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="student">Étudiant</option>
                    <option value="self-employed">Indépendant</option>
                    <option value="employed">Salarié</option>
                    <option value="unemployed">Sans emploi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Garantie <span className="text-red-500">*</span>
                  </label>
                  <select
                          name="guarantee"
                          value={formData.guarantee}
                          onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.guarantee ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Sélectionnez votre garantie</option>
                    <option value="🪪 Carte d'identité / étudiante">🪪 Carte d'identité / étudiante</option>
                    <option value="📱 Téléphone portable">📱 Téléphone portable</option>
                    <option value="💻 Ordinateur portable">💻 Ordinateur portable</option>
                    <option value="🔥 Bouteille de gaz">🔥 Bouteille de gaz</option>
                    <option value="🪙 Montre connectée ou classique de valeur">🪙 Montre connectée ou classique de valeur</option>
                    <option value="📷 Tablette">📷 Tablette</option>
                    <option value="🎧 Écouteurs ou casque Bluetooth">🎧 Écouteurs ou casque Bluetooth</option>
                    <option value="🧳 Petit ventilateur ou cuisinière électrique">🧳 Petit ventilateur ou cuisinière électrique</option>
                    <option value="💾 Disque dur externe ou clé USB haut de gamme">💾 Disque dur externe ou clé USB haut de gamme</option>
                    <option value="🪑 Petit appareil électroménager (fer à repasser, mixeur, etc.)">🪑 Petit appareil électroménager (fer à repasser, mixeur, etc.)</option>
                  </select>
                  {errors.guarantee && (
                    <p className="text-red-500 text-sm mt-1">{errors.guarantee}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Mobile Money */}
          {currentStep === 4 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-montserrat flex items-center gap-2">
                <CreditCard size={24} className="text-green-600" />
                Informations Mobile Money
              </h2>
              <p className="text-gray-600 mb-6">Indiquez vos coordonnées de paiement Mobile Money</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opérateur <span className="text-red-500">*</span>
                  </label>
                  <select
                          name="momoNetwork"
                          value={formData.momoNetwork}
                          onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.momoNetwork ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Sélectionnez votre opérateur</option>
                    <option value="MTN">MTN Mobile Money</option>
                    <option value="Moov">Moov Money</option>
                    <option value="Celtiis">Celtiis Cash</option>
                  </select>
                  {errors.momoNetwork && (
                    <p className="text-red-500 text-sm mt-1">{errors.momoNetwork}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro Mobile Money <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="momoNumber"
                    value={formData.momoNumber}
                    onChange={handleChange}
                    placeholder="Ex: 97123456"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.momoNumber ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  {errors.momoNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.momoNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du compte <span className="text-red-500">*</span>
                  </label>
                  <input
                          type="text"
                          name="momoName"
                          value={formData.momoName}
                          onChange={handleChange}
                    placeholder="Nom complet du titulaire"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.momoName ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  {errors.momoName && (
                    <p className="text-red-500 text-sm mt-1">{errors.momoName}</p>
                  )}
                        </div>
                      </div>

              {/* Message pour télécharger le PDF */}
              {!pdfDownloaded && (
                <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <FileText size={24} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-900 mb-1">Document d'engagement requis</h3>
                      <p className="text-sm text-blue-700 mb-3">
                        Avant de soumettre votre demande, vous devez télécharger et signer le document d'engagement de prêt.
                      </p>
                      <button
                        type="button"
                        onClick={generatePreviewPDF}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            <span>Génération...</span>
                          </>
                        ) : (
                          <>
                            <FileText size={18} />
                            <span>Télécharger le PDF d'engagement</span>
                          </>
                        )}
                      </button>
                          </div>
                        </div>
                      </div>
              )}

              {pdfDownloaded && (
                <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                      <h3 className="font-bold text-green-900 mb-1">PDF téléchargé ✓</h3>
                      <p className="text-sm text-green-700">
                        Vous pouvez maintenant soumettre votre demande. Veuillez signer le document et le conserver précieusement.
                            </p>
                          </div>
                        </div>
                      </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8">
            <button
              type="button"
              onClick={handlePrevious}
                    disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ArrowLeft size={20} />
                    <span>Précédent</span>
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                            <span>Suivant</span>
                <ArrowRight size={20} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || hasActiveLoan}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Envoi en cours...</span>
                        </>
                      ) : (
                        <>
                    <Send size={20} />
                          <span>Soumettre la demande</span>
                        </>
                      )}
              </button>
            )}
            </div>
        </form>
          </div>
    </div>
  );
};

export default LoanRequest;
