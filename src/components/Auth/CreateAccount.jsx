import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Logo from '../UI/Logo';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Mail, 
  User, 
  Eye,
  EyeOff,
  MapPin,
  Phone,
  Shield
} from 'lucide-react';
import { validateEmail } from '../../utils/helpers';
import { validateBeninPhoneNumber } from '../../utils/smsService';

const CreateAccount = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Étape 1 - Informations de base
  const [basicInfo, setBasicInfo] = useState({
    firstName: '',
    lastName: '',
    email: '', // Ajouter l'email
    phoneNumber: '',
    address: '', // Ajouter l'adresse
    password: '',
    confirmPassword: ''
  });

  // Étape 2 - Confirmation
  const [isConfirmed, setIsConfirmed] = useState(false);

  const steps = [
    { id: 1, title: 'Informations de base', icon: User },
    { id: 2, title: 'Confirmation', icon: CheckCircle },
    { id: 3, title: 'Inscription complète', icon: Phone }
  ];

  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;
    setBasicInfo(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validation en temps réel
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateBasicInfo = () => {
    const newErrors = {};

    if (!basicInfo.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }

    if (!basicInfo.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }

    if (!basicInfo.address.trim()) {
      newErrors.address = 'L\'adresse est requise';
    }

    // Validation de l'email (optionnel mais doit être valide si fourni)
    if (basicInfo.email && !validateEmail(basicInfo.email)) {
      newErrors.email = 'Email invalide';
    }

    // Validation du numéro de téléphone béninois
    const phoneValidation = validateBeninPhoneNumber(basicInfo.phoneNumber);
    if (!phoneValidation.valid) {
      newErrors.phoneNumber = phoneValidation.error;
    }

    if (basicInfo.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (basicInfo.password !== basicInfo.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleNext = () => {
    if (currentStep === 1) {
      if (validateBasicInfo()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      setIsConfirmed(true);
      setTimeout(() => {
        setCurrentStep(3);
      }, 2000);
    } else if (currentStep === 3) {
      // Rediriger vers l'inscription complète après un délai
      setTimeout(() => {
        console.log('[CREATEACCOUNT] Données transmises:', basicInfo);
        navigate('/register', { 
          state: { 
            basicInfo: {
              firstName: basicInfo.firstName,
              lastName: basicInfo.lastName,
              email: basicInfo.email, // Ajouter l'email
              phoneNumber: basicInfo.phoneNumber,
              address: basicInfo.address, // Ajouter l'adresse
              password: basicInfo.password,
              confirmPassword: basicInfo.confirmPassword
            },
            fromCreateAccount: true 
          } 
        });
      }, 3000); // Délai de 3 secondes pour voir l'étape 3
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Créer votre compte
        </h2>
        <p className="text-gray-600">
          Commençons par vos informations de base
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Prénom"
            name="firstName"
            value={basicInfo.firstName}
            onChange={handleBasicInfoChange}
            error={errors.firstName}
            icon={User}
          />
          <Input
            label="Nom"
            name="lastName"
            value={basicInfo.lastName}
            onChange={handleBasicInfoChange}
            error={errors.lastName}
            icon={User}
          />
        </div>

        <Input
          label="Adresse email (optionnel)"
          type="email"
          name="email"
          value={basicInfo.email}
          onChange={handleBasicInfoChange}
          error={errors.email}
          icon={Mail}
          placeholder="votre@email.com (optionnel)"
        />

        <Input
          label="Numéro de téléphone"
          type="tel"
          name="phoneNumber"
          value={basicInfo.phoneNumber}
          onChange={handleBasicInfoChange}
          error={errors.phoneNumber}
          icon={Phone}
          placeholder="Ex: 0123456789 ou +229 12345678"
        />

        <Input
          label="Adresse"
          name="address"
          value={basicInfo.address}
          onChange={handleBasicInfoChange}
          error={errors.address}
          icon={MapPin}
          placeholder="Votre adresse complète"
        />

        <Input
          label="Mot de passe"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={basicInfo.password}
          onChange={handleBasicInfoChange}
          error={errors.password}
          icon={showPassword ? EyeOff : Eye}
          onIconClick={() => setShowPassword(!showPassword)}
        />

        <Input
          label="Confirmer le mot de passe"
          type={showPassword ? 'text' : 'password'}
          name="confirmPassword"
          value={basicInfo.confirmPassword}
          onChange={handleBasicInfoChange}
          error={errors.confirmPassword}
          icon={showPassword ? EyeOff : Eye}
          onIconClick={() => setShowPassword(!showPassword)}
        />
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={24} className="text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Confirmation
        </h2>
        <p className="text-gray-600">
          Vérifiez vos informations avant de continuer
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Informations personnelles</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Nom complet:</span> {basicInfo.firstName} {basicInfo.lastName}</p>
            <p><span className="font-medium">Téléphone:</span> {basicInfo.phoneNumber}</p>
            {basicInfo.email && <p><span className="font-medium">Email:</span> {basicInfo.email}</p>}
            <p><span className="font-medium">Adresse:</span> {basicInfo.address}</p>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
          </p>
        </div>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
      >
        <CheckCircle size={32} className="text-green-600" />
      </motion.div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Compte créé avec succès !
        </h2>
        <p className="text-gray-600">
          Votre compte a été créé avec succès. Nous allons maintenant compléter votre profil.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4"
      >
        <div className="flex items-center space-x-2">
          <Shield size={16} className="text-blue-600" />
          <p className="text-sm text-blue-800">
            Vos données sont sécurisées et protégées par notre système de sécurité avancé.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );



  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Logo />
        </div>

        {/* Indicateur de progression */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.id 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle size={16} />
                  ) : (
                    step.id
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    currentStep > step.id ? 'bg-primary-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Étape {currentStep} sur {steps.length} : {steps[currentStep - 1].title}
          </p>
        </div>

        {/* Contenu de l'étape */}
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-6">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {currentStep > 1 && (
            <Button
              onClick={handlePrevious}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>Précédent</span>
            </Button>
          )}
          
                     {currentStep <= steps.length && (
             <Button
               onClick={handleNext}
               disabled={loading}
               className="flex items-center space-x-2 ml-auto"
             >
               <span>
                 {currentStep === 1 ? 'Continuer' :
                  currentStep === 2 ? 'Continuer' :
                  currentStep === 3 ? 'Continuer vers l\'inscription complète' :
                  'Suivant'}
               </span>
               <ArrowRight size={16} />
             </Button>
           )}
        </div>

        {/* Lien de connexion */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Déjà un compte ?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
