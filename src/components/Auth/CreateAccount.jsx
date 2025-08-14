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
  Shield, 
  Phone,
  Clock,
  RefreshCw,
  Eye,
  EyeOff,
  MapPin
} from 'lucide-react';
import { validateEmail } from '../../utils/helpers';
import { generateOTP, verifyOTP } from '../../utils/supabaseAPI';
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

  // Étape 2 - OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [requestId, setRequestId] = useState(null);

  // Étape 3 - Confirmation
  const [isConfirmed, setIsConfirmed] = useState(false);

  const steps = [
    { id: 1, title: 'Informations de base', icon: User },
    { id: 2, title: 'Vérification OTP', icon: Shield },
    { id: 3, title: 'Confirmation', icon: CheckCircle },
    { id: 4, title: 'Inscription complète', icon: Phone }
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

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Empêcher plus d'un caractère
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus sur le champ suivant
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[name="otp-${index + 1}"]`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[name="otp-${index - 1}"]`);
      if (prevInput) prevInput.focus();
    }
  };

  const sendOtp = async () => {
    try {
      setLoading(true);
      
      const result = await generateOTP(basicInfo.phoneNumber, 'registration');
      
      if (result.success) {
        setOtpSent(true);
        setRequestId(result.requestId);
        setOtpTimer(60);
        
        const timer = setInterval(() => {
          setOtpTimer(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        showSuccess(result.message || 'Code OTP envoyé avec succès par SMS');
      } else {
        showError(result.error || 'Erreur lors de l\'envoi du code OTP');
      }
    } catch (error) {
      console.error('[AUTH] Erreur lors de l\'envoi OTP:', error.message);
      showError('Erreur lors de l\'envoi du code OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      showError('Veuillez saisir le code complet');
      return;
    }

    try {
      setLoading(true);
      
      const result = await verifyOTP(basicInfo.phoneNumber, otpString, requestId);
      
      if (result.success) {
        setCurrentStep(3);
        showSuccess('Code OTP vérifié avec succès');
      } else {
        showError(result.error || 'Code OTP incorrect');
      }
    } catch (error) {
      console.error('[AUTH] Erreur lors de la vérification OTP:', error.message);
      showError('Erreur lors de la vérification');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateBasicInfo()) {
        setCurrentStep(2);
        sendOtp();
      }
    } else if (currentStep === 2) {
      verifyOtp();
    } else if (currentStep === 3) {
      setIsConfirmed(true);
      setTimeout(() => {
        setCurrentStep(4);
      }, 2000);
    } else if (currentStep === 4) {
      // Rediriger vers l'inscription complète
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
          <Phone size={24} className="text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Vérification par SMS
        </h2>
        <p className="text-gray-600">
          Nous avons envoyé un code à <span className="font-semibold">{basicInfo.phoneNumber}</span>
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Code de vérification
          </label>
          <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                name={`otp-${index}`}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                maxLength={1}
                inputMode="numeric"
              />
            ))}
          </div>
        </div>

        <div className="text-center space-y-4">
          <Button
            onClick={verifyOtp}
            disabled={loading || otp.join('').length !== 6}
            className="w-full"
          >
            {loading ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <>
                <CheckCircle size={16} />
                <span>Vérifier le code</span>
              </>
            )}
          </Button>

          <div className="text-sm text-gray-600">
            {otpTimer > 0 ? (
              <p>Renvoyer le code dans {otpTimer}s</p>
            ) : (
              <button
                onClick={sendOtp}
                disabled={loading}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Renvoyer le code
              </button>
            )}
          </div>
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

  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone size={24} className="text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Complétez votre profil
        </h2>
        <p className="text-gray-600">
          Quelques informations supplémentaires pour finaliser votre inscription
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Informations à fournir :</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center space-x-2">
            <CheckCircle size={14} className="text-green-600" />
            <span>Numéro de téléphone</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle size={14} className="text-green-600" />
            <span>Informations personnelles</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle size={14} className="text-green-600" />
            <span>Contact d'urgence</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle size={14} className="text-green-600" />
            <span>Documents d'identité</span>
          </li>
        </ul>
      </div>

      <div className="text-center">
        <Button
          onClick={handleNext}
          className="w-full"
        >
          <span>Continuer l'inscription</span>
          <ArrowRight size={16} />
        </Button>
      </div>
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
      case 4:
        return renderStep4();
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
          
          {currentStep < steps.length && (
            <Button
              onClick={handleNext}
              disabled={loading}
              className="flex items-center space-x-2 ml-auto"
            >
              <span>
                {currentStep === 1 ? 'Continuer' :
                 currentStep === 2 ? 'Vérifier' :
                 currentStep === 3 ? 'Continuer' :
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
