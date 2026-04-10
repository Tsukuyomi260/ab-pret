import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Phone
} from 'lucide-react';
import { validateEmail } from '../../utils/helpers';
import { validateBeninPhoneNumber } from '../../utils/smsService';

const CreateAccount = () => {
  const navigate = useNavigate();
  useNotifications();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Étape 1 - Informations de base
  const [basicInfo, setBasicInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    facebookName: '',
    phoneNumber: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  // Étape 2 - Confirmation
  const [, setIsConfirmed] = useState(false);

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

    // Validation de l'email
    if (!basicInfo.email.trim()) {
      newErrors.email = 'L\'adresse email est requise';
    } else if (!validateEmail(basicInfo.email)) {
      newErrors.email = 'Email invalide';
    }

    // Validation du champ Facebook
    if (!basicInfo.facebookName.trim()) {
      newErrors.facebookName = 'Le nom du profil Facebook est requis';
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
              email: basicInfo.email,
              facebookName: basicInfo.facebookName,
              phoneNumber: basicInfo.phoneNumber,
              address: basicInfo.address,
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

  // Helper: champ de saisie stylé
  const Field = ({ label, name, type = 'text', value, onChange, error, placeholder, icon: Icon }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        {Icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Icon size={15} /></span>}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 text-sm bg-white border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f2d6b]/20 focus:border-[#0f2d6b] transition ${error ? 'border-red-300' : 'border-slate-200'}`}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );

  const renderStep1 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Prénom" name="firstName" value={basicInfo.firstName} onChange={handleBasicInfoChange} error={errors.firstName} icon={User} placeholder="Votre prénom" />
        <Field label="Nom" name="lastName" value={basicInfo.lastName} onChange={handleBasicInfoChange} error={errors.lastName} icon={User} placeholder="Votre nom" />
      </div>
      <Field label="Adresse email" type="email" name="email" value={basicInfo.email} onChange={handleBasicInfoChange} error={errors.email} icon={Mail} placeholder="votre@email.com" />
      <Field label="Nom du profil Facebook" name="facebookName" value={basicInfo.facebookName} onChange={handleBasicInfoChange} error={errors.facebookName} icon={User} placeholder="Votre nom de profil Facebook" />
      <Field label="Numéro de téléphone" type="tel" name="phoneNumber" value={basicInfo.phoneNumber} onChange={handleBasicInfoChange} error={errors.phoneNumber} icon={Phone} placeholder="Ex: 53448573" />
      <Field label="Adresse" name="address" value={basicInfo.address} onChange={handleBasicInfoChange} error={errors.address} icon={MapPin} placeholder="Votre adresse complète" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Mot de passe</label>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} name="password" value={basicInfo.password} onChange={handleBasicInfoChange} placeholder="••••••••"
              className={`w-full pl-4 pr-10 py-2.5 text-sm bg-white border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f2d6b]/20 focus:border-[#0f2d6b] transition ${errors.password ? 'border-red-300' : 'border-slate-200'}`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Confirmer le mot de passe</label>
          <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={basicInfo.confirmPassword} onChange={handleBasicInfoChange} placeholder="••••••••"
            className={`w-full px-4 py-2.5 text-sm bg-white border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f2d6b]/20 focus:border-[#0f2d6b] transition ${errors.confirmPassword ? 'border-red-300' : 'border-slate-200'}`} />
          {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
      <div className="flex items-center gap-3 p-4 bg-[#0f2d6b]/5 border border-[#0f2d6b]/10 rounded-xl">
        <CheckCircle size={20} className="text-[#0f2d6b] flex-shrink-0" />
        <p className="text-sm text-[#0f2d6b] font-medium">Vérifiez vos informations avant de continuer</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Récapitulatif</p>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            ['Nom complet', `${basicInfo.firstName} ${basicInfo.lastName}`],
            ['Email', basicInfo.email],
            ['Facebook', basicInfo.facebookName],
            ['Téléphone', basicInfo.phoneNumber],
            ['Adresse', basicInfo.address],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-center px-4 py-2.5 text-sm">
              <span className="text-slate-500">{label}</span>
              <span className="text-slate-800 font-medium">{value || '—'}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-slate-400 text-center">En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.</p>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-4">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle size={28} className="text-green-600" />
      </motion.div>
      <div>
        <h3 className="text-xl font-bold text-[#0f2d6b]">Informations validées !</h3>
        <p className="text-sm text-slate-500 mt-1">Vous allez être redirigé pour finaliser votre inscription.</p>
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
      default:
        return null;
    }
  };

  const stepLabels = ['Informations', 'Confirmation', 'Validation'];

  return (
    <div className="min-h-screen flex">
      {/* Panneau gauche branding – desktop */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#0f2d6b] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute bottom-10 -right-16 w-56 h-56 rounded-full bg-[#e8a020]/10" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md p-1">
            <img src="/logo-campus-finance.png" alt="AB Campus Finance" className="w-full h-full object-contain" />
          </div>
          <span className="text-white font-bold text-lg tracking-wide">AB Campus Finance</span>
        </div>
        <div className="relative z-10 space-y-5">
          <div className="w-12 h-1 bg-[#e8a020] rounded-full" />
          <h2 className="text-4xl font-bold text-white leading-snug">
            Rejoignez la<br /><span className="text-[#e8a020]">communauté.</span>
          </h2>
          <p className="text-slate-300 text-base leading-relaxed max-w-sm">
            Créez votre compte étudiant en quelques minutes et accédez à nos services financiers.
          </p>
          <div className="space-y-3 pt-2">
            {['Inscription rapide et simple', 'Compte sécurisé', 'Accès immédiat aux services'].map(item => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#e8a020]/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-[#e8a020]" />
                </div>
                <span className="text-slate-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-slate-500 text-xs">Made with pride in Bénin 🇧🇯</p>
      </div>

      {/* Panneau droit – formulaire */}
      <div className="w-full lg:w-7/12 flex items-center justify-center bg-slate-50 p-6 sm:p-10">
        <div className="w-full max-w-lg space-y-6">

          {/* Logo mobile */}
          <div className="flex lg:hidden flex-col items-center gap-2">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-md p-1.5 flex items-center justify-center">
              <img src="/logo-campus-finance.png" alt="AB Campus Finance" className="w-full h-full object-contain" />
            </div>
            <span className="text-[#0f2d6b] font-bold text-base tracking-wide">AB Campus Finance</span>
          </div>

          {/* Titre */}
          <div>
            <h1 className="text-2xl font-bold text-[#0f2d6b]">Créer un compte</h1>
            <p className="text-slate-500 text-sm mt-1">Étape {currentStep} sur {steps.length} — {stepLabels[currentStep - 1]}</p>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                  currentStep > step.id ? 'bg-[#e8a020] text-white' :
                  currentStep === step.id ? 'bg-[#0f2d6b] text-white' :
                  'bg-slate-200 text-slate-500'
                }`}>
                  {currentStep > step.id ? <CheckCircle size={13} /> : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full transition-all ${currentStep > step.id ? 'bg-[#e8a020]' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Contenu carte */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            {currentStep > 1 ? (
              <button onClick={handlePrevious}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition">
                <ArrowLeft size={15} /> Précédent
              </button>
            ) : <div />}
            {currentStep <= steps.length && (
              <button onClick={handleNext} disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0f2d6b] hover:bg-[#0a2255] rounded-xl shadow-md hover:shadow-lg transition disabled:opacity-50">
                <span>{currentStep === 3 ? 'Finaliser l\'inscription' : 'Continuer'}</span>
                <ArrowRight size={15} />
              </button>
            )}
          </div>

          {/* Lien connexion */}
          <p className="text-center text-sm text-slate-500">
            Déjà un compte ?{' '}
            <button onClick={() => navigate('/login')} className="text-[#0f2d6b] font-semibold hover:underline">
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
