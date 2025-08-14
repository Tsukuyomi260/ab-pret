import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
// Finalisation côté Supabase (auth + profil)
import { signUpWithPhone, updateUserProfile } from '../../utils/supabaseAPI';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Logo from '../UI/Logo';
import StarBorder from '../UI/StarBorder';
import { Mail, Lock, Phone, Eye, EyeOff, Camera, GraduationCap, Building, User, Shield, CheckCircle, Upload, ArrowRight, ArrowLeft, MapPin } from 'lucide-react';
import { validateEmail, validatePhone } from '../../utils/helpers';
import { uploadIdentityCard } from '../../utils/fileUpload';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { basicInfo, fromCreateAccount } = location.state || {};
  
  // Debug: Afficher les données reçues
  console.log('[REGISTER] Données reçues:', { basicInfo, fromCreateAccount });
  console.log('[REGISTER] Location state:', location.state);
  console.log('[REGISTER] basicInfo.firstName:', basicInfo?.firstName);
  console.log('[REGISTER] basicInfo.lastName:', basicInfo?.lastName);
  console.log('[REGISTER] basicInfo.phoneNumber:', basicInfo?.phoneNumber);
  
  const [currentStep, setCurrentStep] = useState(5);
  const [formData, setFormData] = useState({
    // Informations personnelles
    firstName: basicInfo?.firstName || '',
    lastName: basicInfo?.lastName || '',
    address: basicInfo?.address || '', // Ajouter l'adresse
    filiere: '',
    anneeEtude: '',
    entite: '',
    phone: basicInfo?.phoneNumber || '',
    email: basicInfo?.email || '', // Utiliser l'email fourni
    password: basicInfo?.password || '',
    confirmPassword: basicInfo?.confirmPassword || '',
    userIdentityCard: null,
    // Informations du témoin
    temoinName: '',
    temoinQuartier: '',
    temoinPhone: '',
    temoinEmail: '',
    temoinIdentityCard: null,
    // Informations d'urgence
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
    emergencyEmail: '',
    emergencyAddress: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { showSuccess, showError } = useNotifications();

  const steps = [
    { id: 5, title: 'Informations personnelles', icon: User },
    { id: 6, title: 'Informations du témoin', icon: Shield },
    { id: 7, title: 'Contact d\'urgence', icon: Phone },
    { id: 8, title: 'Validation', icon: CheckCircle }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        [type]: file
      });
    }
  };

  const validateCurrentStep = () => {
    const newErrors = {};

    switch (currentStep) {
      case 5:
        if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis';
        if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est requis';
        if (!formData.address.trim()) newErrors.address = 'L\'adresse est requise';
        if (!formData.filiere.trim()) newErrors.filiere = 'La filière est requise';
        if (!formData.anneeEtude.trim()) newErrors.anneeEtude = "L'année d'étude est requise";
        if (!formData.entite.trim()) newErrors.entite = "L'entité est requise";
        if (formData.email && !validateEmail(formData.email)) newErrors.email = 'Email invalide';
        if (!validatePhone(formData.phone)) newErrors.phone = 'Numéro de téléphone invalide';
        if (formData.password.length < 6) newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        if (!formData.userIdentityCard) newErrors.userIdentityCard = 'La photo de votre carte d\'identité est requise';
        break;

      case 6:
        if (!formData.temoinName.trim()) newErrors.temoinName = 'Le nom du témoin est requis';
        if (!formData.temoinQuartier.trim()) newErrors.temoinQuartier = 'Le quartier du témoin est requis';
        if (!validatePhone(formData.temoinPhone)) newErrors.temoinPhone = 'Numéro de téléphone invalide';
        if (!validateEmail(formData.temoinEmail)) newErrors.temoinEmail = 'Email invalide';
        if (!formData.temoinIdentityCard) newErrors.temoinIdentityCard = 'La photo de la carte d\'identité du témoin est requise';
        break;

      case 7:
        if (!formData.emergencyName.trim()) newErrors.emergencyName = 'Le nom du contact d\'urgence est requis';
        if (!formData.emergencyRelation.trim()) newErrors.emergencyRelation = 'La relation est requise';
        if (!validatePhone(formData.emergencyPhone)) newErrors.emergencyPhone = 'Numéro de téléphone invalide';
        if (!validateEmail(formData.emergencyEmail)) newErrors.emergencyEmail = 'Email invalide';
        if (!formData.emergencyAddress.trim()) newErrors.emergencyAddress = 'L\'adresse est requise';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 5) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) return;

    setLoading(true);
    
    try {
      console.log('[REGISTER] Données pour inscription:', {
        phone: formData.phone,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      });
      
          // 1) Créer l'utilisateur Auth via téléphone (OTP déjà validé en étape précédente)
    const signUp = await signUpWithPhone(formData.phone, formData.password, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email // Ajouter l'email si fourni
    });

      if (!signUp.success || !signUp.user?.id) {
        throw new Error(signUp.error || 'Création du compte échouée');
      }

      // 2) Uploader les photos si fournies
      let userIdentityCardUrl = null;
      let temoinIdentityCardUrl = null;

      if (formData.userIdentityCard) {
        console.log('[REGISTER] Upload carte d\'identité utilisateur...');
        const uploadResult = await uploadIdentityCard(formData.userIdentityCard, signUp.user.id, 'user');
        if (uploadResult.success) {
          userIdentityCardUrl = uploadResult.url;
          console.log('[REGISTER] ✅ Carte d\'identité utilisateur uploadée');
        } else {
          console.error('[REGISTER] ❌ Erreur upload carte d\'identité utilisateur:', uploadResult.error);
        }
      }

      if (formData.temoinIdentityCard) {
        console.log('[REGISTER] Upload carte d\'identité témoin...');
        const uploadResult = await uploadIdentityCard(formData.temoinIdentityCard, signUp.user.id, 'temoin');
        if (uploadResult.success) {
          temoinIdentityCardUrl = uploadResult.url;
          console.log('[REGISTER] ✅ Carte d\'identité témoin uploadée');
        } else {
          console.error('[REGISTER] ❌ Erreur upload carte d\'identité témoin:', uploadResult.error);
        }
      }

      // 3) Enregistrer/compléter le profil utilisateur
      await updateUserProfile(signUp.user.id, {
        address: formData.address, // Ajouter l'adresse
        filiere: formData.filiere,
        annee_etude: formData.anneeEtude,
        entite: formData.entite,
        temoin_name: formData.temoinName,
        temoin_quartier: formData.temoinQuartier,
        temoin_phone: formData.temoinPhone,
        temoin_email: formData.temoinEmail,
        emergency_name: formData.emergencyName,
        emergency_relation: formData.emergencyRelation,
        emergency_phone: formData.emergencyPhone,
        emergency_email: formData.emergencyEmail,
        emergency_address: formData.emergencyAddress,
        user_identity_card_url: userIdentityCardUrl,
        temoin_identity_card_url: temoinIdentityCardUrl,
        user_identity_card_name: formData.userIdentityCard?.name || null,
        temoin_identity_card_name: formData.temoinIdentityCard?.name || null
      });

      showSuccess('Inscription complétée ! Votre compte a été créé avec succès.');
      navigate('/dashboard');

    } catch (error) {
              console.error('[AUTH] Erreur lors de l\'inscription:', error.message);
      setErrors({ general: 'Erreur lors de l\'inscription. Veuillez réessayer.' });
      showError('Inscription échouée', 'Une erreur est survenue lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 5:
        return (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <User size={20} className="text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 font-montserrat">
                Informations personnelles
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <Input
                  label="Prénom"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Votre prénom"
                  error={errors.firstName}
                  required
                  className="group-hover:shadow-md transition-all duration-300"
                />
              </div>
              
              <div className="relative group">
                <Input
                  label="Nom"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Votre nom"
                  error={errors.lastName}
                  required
                  className="group-hover:shadow-md transition-all duration-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <Input
                  label="Adresse"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Votre adresse complète"
                  error={errors.address}
                  required
                  className="group-hover:shadow-md transition-all duration-300"
                />
                <MapPin size={20} className="absolute right-4 top-12 text-neutral-400 group-hover:text-primary-500 transition-colors duration-300" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative group">
                <Input
                  label="Filière"
                  type="text"
                  name="filiere"
                  value={formData.filiere}
                  onChange={handleChange}
                  placeholder="Ex: Informatique"
                  error={errors.filiere}
                  required
                  className="group-hover:shadow-md transition-all duration-300"
                />
                <GraduationCap size={20} className="absolute right-4 top-12 text-neutral-400 group-hover:text-primary-500 transition-colors duration-300" />
              </div>
              
              <div className="relative group">
                <Input
                  label="Année d'étude"
                  type="text"
                  name="anneeEtude"
                  value={formData.anneeEtude}
                  onChange={handleChange}
                  placeholder="Ex: 2ème année"
                  error={errors.anneeEtude}
                  required
                  className="group-hover:shadow-md transition-all duration-300"
                />
              </div>
              
              <div className="relative group">
                <select
                  name="entite"
                  value={formData.entite}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-montserrat transition-all duration-300 group-hover:shadow-md ${
                    errors.entite ? 'border-red-300' : 'border-accent-200'
                  }`}
                  required
                >
                  <option value="">Sélectionner une entité</option>
                  <option value="INSTI">INSTI</option>
                  <option value="ENSET">ENSET</option>
                </select>
                <Building size={20} className="absolute right-4 top-12 text-neutral-400 group-hover:text-primary-500 transition-colors duration-300" />
                {errors.entite && (
                  <p className="text-red-500 text-sm mt-1 font-montserrat">{errors.entite}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <Input
                  label="Adresse email (optionnel)"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com (optionnel)"
                  error={errors.email}
                  className="group-hover:shadow-md transition-all duration-300"
                />
                <Mail size={20} className="absolute right-4 top-12 text-neutral-400 group-hover:text-primary-500 transition-colors duration-300" />
              </div>

              <div className="relative group">
                <Input
                  label="Numéro de téléphone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+229 53463606"
                  error={errors.phone}
                  required
                  className="group-hover:shadow-md transition-all duration-300"
                />
                <Phone size={20} className="absolute right-4 top-12 text-neutral-400 group-hover:text-primary-500 transition-colors duration-300" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <Input
                  label="Mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  error={errors.password}
                  required
                  className="group-hover:shadow-md transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-12 text-neutral-400 hover:text-primary-500 transition-colors duration-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="relative group">
                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  error={errors.confirmPassword}
                  required
                  className="group-hover:shadow-md transition-all duration-300"
                />
                <Lock size={20} className="absolute right-4 top-12 text-neutral-400 group-hover:text-primary-500 transition-colors duration-300" />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-secondary-900 font-montserrat mb-3">
                Photo de votre carte d'identité *
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'userIdentityCard')}
                  className="hidden"
                  id="userIdentityCard"
                  required
                />
                <label
                  htmlFor="userIdentityCard"
                  className="flex items-center justify-center w-full px-6 py-8 border-2 border-dashed border-accent-300 rounded-2xl cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-all duration-300 group-hover:shadow-md"
                >
                  <div className="text-center">
                    <Camera size={32} className="text-neutral-400 group-hover:text-primary-500 transition-colors duration-300 mx-auto mb-2" />
                    <span className="text-neutral-600 font-montserrat block">
                      {formData.userIdentityCard ? formData.userIdentityCard.name : 'Choisir une photo'}
                    </span>
                    <span className="text-sm text-neutral-400 font-montserrat">
                      {formData.userIdentityCard ? 'Fichier sélectionné' : 'Cliquez pour sélectionner'}
                    </span>
                  </div>
                </label>
              </div>
              {errors.userIdentityCard && (
                <p className="text-red-500 text-sm mt-2 font-montserrat">{errors.userIdentityCard}</p>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-secondary-100 rounded-xl flex items-center justify-center">
                <Shield size={20} className="text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 font-montserrat">
                Informations du témoin
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <Input
                  label="Nom complet du témoin"
                  type="text"
                  name="temoinName"
                  value={formData.temoinName}
                  onChange={handleChange}
                  placeholder="Nom et prénom du témoin"
                  error={errors.temoinName}
                  required
                  className="group-hover:shadow-md transition-all duration-300"
                />
              </div>
              
              <div className="relative group">
                <Input
                  label="Quartier du témoin"
                  type="text"
                  name="temoinQuartier"
                  value={formData.temoinQuartier}
                  onChange={handleChange}
                  placeholder="Ex: Akpakpa, Cotonou"
                  error={errors.temoinQuartier}
                  required
                  className="group-hover:shadow-md transition-all duration-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <Input
                  label="Téléphone du témoin"
                  type="tel"
                  name="temoinPhone"
                  value={formData.temoinPhone}
                  onChange={handleChange}
                  placeholder="+229 53463606"
                  error={errors.temoinPhone}
                  required
                  className="group-hover:shadow-md transition-all duration-300"
                />
                <Phone size={20} className="absolute right-4 top-12 text-neutral-400 group-hover:text-primary-500 transition-colors duration-300" />
              </div>

              <div className="relative group">
                <Input
                  label="Email du témoin"
                  type="email"
                  name="temoinEmail"
                  value={formData.temoinEmail}
                  onChange={handleChange}
                  placeholder="temoins@email.com"
                  error={errors.temoinEmail}
                  required
                  className="group-hover:shadow-md transition-all duration-300"
                />
                <Mail size={20} className="absolute right-4 top-12 text-neutral-400 group-hover:text-primary-500 transition-colors duration-300" />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-secondary-900 font-montserrat mb-3">
                Photo de la carte d'identité du témoin *
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'temoinIdentityCard')}
                  className="hidden"
                  id="temoinIdentityCard"
                  required
                />
                <label
                  htmlFor="temoinIdentityCard"
                  className="flex items-center justify-center w-full px-6 py-8 border-2 border-dashed border-accent-300 rounded-2xl cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-all duration-300 group-hover:shadow-md"
                >
                  <div className="text-center">
                    <Camera size={32} className="text-neutral-400 group-hover:text-primary-500 transition-colors duration-300 mx-auto mb-2" />
                    <span className="text-neutral-600 font-montserrat block">
                      {formData.temoinIdentityCard ? formData.temoinIdentityCard.name : 'Choisir une photo'}
                    </span>
                    <span className="text-sm text-neutral-400 font-montserrat">
                      {formData.temoinIdentityCard ? 'Fichier sélectionné' : 'Cliquez pour sélectionner'}
                    </span>
                  </div>
                </label>
              </div>
              {errors.temoinIdentityCard && (
                <p className="text-red-500 text-sm mt-2 font-montserrat">{errors.temoinIdentityCard}</p>
              )}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
                <Phone size={20} className="text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 font-montserrat">
                Contact d'urgence
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <Input
                  label="Nom complet du contact"
                  type="text"
                  name="emergencyName"
                  value={formData.emergencyName}
                  onChange={handleChange}
                  placeholder="Nom et prénom"
                  error={errors.emergencyName}
                  required
                  className="group-hover:shadow-md transition-all duration-300"
                />
              </div>
              
              <div className="relative group">
                <Input
                  label="Relation avec vous"
                  type="text"
                  name="emergencyRelation"
                  value={formData.emergencyRelation}
                  onChange={handleChange}
                  placeholder="Ex: Parent, Frère, Sœur"
                  error={errors.emergencyRelation}
                  required
                  className="group-hover:shadow-md transition-all duration-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <Input
                  label="Téléphone d'urgence"
                  type="tel"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  placeholder="+229 53463606"
                  error={errors.emergencyPhone}
                  required
                  className="group-hover:shadow-md transition-all duration-300"
                />
                <Phone size={20} className="absolute right-4 top-12 text-neutral-400 group-hover:text-primary-500 transition-colors duration-300" />
              </div>

              <div className="relative group">
                <Input
                  label="Email d'urgence"
                  type="email"
                  name="emergencyEmail"
                  value={formData.emergencyEmail}
                  onChange={handleChange}
                  placeholder="contact@email.com"
                  error={errors.emergencyEmail}
                  required
                  className="group-hover:shadow-md transition-all duration-300"
                />
                <Mail size={20} className="absolute right-4 top-12 text-neutral-400 group-hover:text-primary-500 transition-colors duration-300" />
              </div>
            </div>

            <div className="relative group">
              <Input
                label="Adresse complète"
                type="textarea"
                name="emergencyAddress"
                value={formData.emergencyAddress}
                onChange={handleChange}
                placeholder="Adresse complète du contact d'urgence"
                error={errors.emergencyAddress}
                required
                className="group-hover:shadow-md transition-all duration-300"
              />
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 font-montserrat">
                Validation et création du compte
              </h3>
            </div>

            <div className="bg-accent-50 rounded-2xl p-6 space-y-4">
              <h4 className="font-semibold text-secondary-900 font-montserrat">Récapitulatif de vos informations :</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-secondary-900">Informations personnelles :</p>
                  <p className="text-neutral-600">{formData.firstName} {formData.lastName}</p>
                  <p className="text-neutral-600">{formData.filiere} - {formData.anneeEtude}</p>
                  <p className="text-neutral-600">{formData.entite}</p>
                </div>
                
                <div>
                  <p className="font-medium text-secondary-900">Contact :</p>
                  <p className="text-neutral-600">{formData.email}</p>
                  <p className="text-neutral-600">{formData.phone}</p>
                </div>
                
                <div>
                  <p className="font-medium text-secondary-900">Témoin :</p>
                  <p className="text-neutral-600">{formData.temoinName}</p>
                  <p className="text-neutral-600">{formData.temoinQuartier}</p>
                </div>
                
                <div>
                  <p className="font-medium text-secondary-900">Contact d'urgence :</p>
                  <p className="text-neutral-600">{formData.emergencyName}</p>
                  <p className="text-neutral-600">{formData.emergencyRelation}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <div>
                  <p className="font-medium text-blue-900 font-montserrat">Important :</p>
                  <p className="text-blue-700 text-sm font-montserrat">
                    Après la création de votre compte, vous recevrez un code OTP par email pour finaliser l'inscription.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-400/20 to-secondary-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-accent-400/20 to-primary-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl w-full space-y-8 relative z-10">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="flex justify-center mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft">
              <Logo size="xl" showText={true} />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-secondary-900 font-montserrat mb-3 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Créer votre compte étudiant
          </h1>
          <p className="text-lg text-neutral-600 font-montserrat max-w-2xl mx-auto">
            Rejoignez la communauté AB CAMPUS FINANCE et accédez à nos services de prêt étudiant
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-soft">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                  currentStep >= step.id 
                    ? 'bg-primary-500 border-primary-500 text-white' 
                    : 'bg-white border-accent-300 text-neutral-400'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle size={20} className="text-white" />
                  ) : (
                    <step.icon size={20} />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 transition-all duration-300 ${
                    currentStep > step.id ? 'bg-primary-500' : 'bg-accent-300'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl font-montserrat animate-fade-in-up">
                {errors.general}
              </div>
            )}

            {renderStepContent()}

            <div className="flex justify-between pt-6">
              {currentStep < 8 ? (
                <>
                                      {currentStep > 5 && (
                    <Button
                      type="button"
                      onClick={handlePrevious}
                      className="flex items-center space-x-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-montserrat px-6 py-3 rounded-xl transition-all duration-300"
                    >
                      <ArrowLeft size={20} />
                      <span>Précédent</span>
                    </Button>
                  )}

                  <div className="flex-1"></div>

                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-montserrat px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <span>Suivant</span>
                    <ArrowRight size={20} />
                  </Button>
                </>
              ) : (
                <div className="flex items-center space-x-4 w-full">
                  <Button
                    type="button"
                    onClick={handlePrevious}
                    className="flex items-center space-x-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-montserrat px-6 py-3 rounded-xl transition-all duration-300 text-sm"
                  >
                    <ArrowLeft size={18} />
                    <span>Précédent</span>
                  </Button>
                  
                  <div className="flex-1"></div>
                  
                  <StarBorder
                    color="#FF6B35"
                    speed="2s"
                    thickness={3}
                    className="w-auto"
                  >
                    <Button
                      type="submit"
                      loading={loading}
                      className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-montserrat px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] text-sm"
                    >
                      {loading ? 'Création...' : 'Créer mon compte'}
                    </Button>
                  </StarBorder>
                </div>
              )}
            </div>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-accent-200">
            <p className="text-neutral-600 font-montserrat">
              Déjà un compte ?{' '}
              <Link 
                to="/login" 
                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors duration-300"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;