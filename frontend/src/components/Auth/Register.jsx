import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { signUpWithPhone, updateUserProfile } from '../../utils/supabaseAPI';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Logo from '../UI/Logo';
import StarBorder from '../UI/StarBorder';
import { Mail, Lock, Phone, Eye, EyeOff, Camera, GraduationCap, Building, User, Shield, CheckCircle, ArrowRight, ArrowLeft, MapPin } from 'lucide-react';
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
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    facebookName: '',
    filiere: '',
    anneeEtude: '',
    entite: '',
    userIdentityCard: null,
    temoinIdentityCard: null,
    studentCard: null,
    temoinName: '',
    temoinQuartier: '',
    temoinPhone: '',
    temoinEmail: '',
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

  // Pré-remplir le formulaire avec les données reçues de CreateAccount
  useEffect(() => {
    if (basicInfo && fromCreateAccount) {
      console.log('[REGISTER] Pré-remplissage du formulaire avec:', basicInfo);
      setFormData(prevData => ({
        ...prevData,
        firstName: basicInfo.firstName || '',
        lastName: basicInfo.lastName || '',
        email: basicInfo.email || '',
        phone: basicInfo.phoneNumber || '',
        password: basicInfo.password || '',
        confirmPassword: basicInfo.confirmPassword || '',
        address: basicInfo.address || '',
        facebookName: basicInfo.facebookName || ''
      }));
    }
  }, [basicInfo, fromCreateAccount]);

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
        if (!formData.facebookName.trim()) newErrors.facebookName = 'Le nom du profil Facebook est requis';
        if (!formData.filiere.trim()) newErrors.filiere = 'La filière est requise';
        if (!formData.anneeEtude.trim()) newErrors.anneeEtude = "L'année d'étude est requise";
        if (!formData.entite.trim()) newErrors.entite = "L'entité est requise";
        if (!formData.email.trim()) newErrors.email = 'L\'adresse email est requise';
        if (formData.email && !validateEmail(formData.email)) newErrors.email = 'Email invalide';
        if (!validatePhone(formData.phone)) newErrors.phone = 'Numéro de téléphone invalide';
        if (formData.password.length < 6) newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        if (!formData.userIdentityCard) newErrors.userIdentityCard = 'La photo de votre carte d\'identité est requise';
        if (!formData.studentCard) newErrors.studentCard = 'La photo de votre carte d\'étudiant est requise';
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
      default:
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
        email: formData.email,
        address: formData.address,
        facebookName: formData.facebookName,
        filiere: formData.filiere,
        anneeEtude: formData.anneeEtude,
        entite: formData.entite
      });
      
      // 1) Créer l'utilisateur Auth via téléphone (sans OTP)
      const signUp = await signUpWithPhone(formData.phone, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email // Ajouter l'email si fourni
      });

      console.log('[REGISTER] Résultat signUp:', signUp);

      if (!signUp.success || !signUp.user?.id) {
        console.error('[REGISTER] Erreur signUp:', signUp.error);
        throw new Error(signUp.error || 'Création du compte échouée');
      }

      let userIdentityCardUrl = null;
      let temoinIdentityCardUrl = null;
      let studentCardUrl = null;

      // 2) Uploader les photos si fournies
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

      if (formData.studentCard) {
        console.log('[REGISTER] Upload carte d\'étudiant...');
        const uploadResult = await uploadIdentityCard(formData.studentCard, signUp.user.id, 'student');
        if (uploadResult.success) {
          studentCardUrl = uploadResult.url;
          console.log('[REGISTER] ✅ Carte d\'étudiant uploadée');
        } else {
          console.error('[REGISTER] ❌ Erreur upload carte d\'étudiant:', uploadResult.error);
        }
      }

      // 3) Enregistrer/compléter le profil utilisateur
      console.log('[REGISTER] Mise à jour du profil avec les données:', {
        address: formData.address,
        filiere: formData.filiere,
        annee_etude: formData.anneeEtude,
        entite: formData.entite,
        facebook_name: formData.facebookName
      });

      const profileUpdate = await updateUserProfile(signUp.user.id, {
        address: formData.address,
        filiere: formData.filiere,
        annee_etude: formData.anneeEtude,
        entite: formData.entite,
        facebook_name: formData.facebookName,
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
        student_card_url: studentCardUrl,
        user_identity_card_name: formData.userIdentityCard?.name || null,
        temoin_identity_card_name: formData.temoinIdentityCard?.name || null,
        student_card_name: formData.studentCard?.name || null
      });

      console.log('[REGISTER] Résultat mise à jour profil:', profileUpdate);

      if (!profileUpdate.success) {
        console.error('[REGISTER] Erreur mise à jour profil:', profileUpdate.error);
        throw new Error(`Erreur mise à jour profil: ${profileUpdate.error}`);
      }

      showSuccess('Inscription complétée ! Votre compte a été créé avec succès.');
      navigate('/dashboard');

    } catch (error) {
      console.error('[REGISTER] Erreur détaillée lors de l\'inscription:', {
        message: error.message,
        stack: error.stack,
        error: error
      });
      setErrors({ general: `Erreur lors de l'inscription: ${error.message}` });
      showError('Inscription échouée', `Une erreur est survenue: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 5:
        return (
          <div className="space-y-4">
            {fromCreateAccount && (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700 mb-2">
                <CheckCircle size={16} className="flex-shrink-0" />
                <span>Informations de base pré-remplies depuis l'étape précédente.</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                   readOnly={fromCreateAccount}
                   className={`group-hover:shadow-md transition-all duration-300 ${fromCreateAccount ? 'bg-gray-50 cursor-not-allowed' : ''}`}
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
                   readOnly={fromCreateAccount}
                   className={`group-hover:shadow-md transition-all duration-300 ${fromCreateAccount ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                 />
               </div>
            </div>

                         <div className="relative group">
               <Input
                 label="Nom du profil Facebook"
                 type="text"
                 name="facebookName"
                 value={formData.facebookName}
                 onChange={handleChange}
                 placeholder="Votre nom de profil Facebook"
                 error={errors.facebookName}
                 required
                 readOnly={fromCreateAccount}
                 className={`group-hover:shadow-md transition-all duration-300 ${fromCreateAccount ? 'bg-gray-50 cursor-not-allowed' : ''}`}
               />
             </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                   readOnly={fromCreateAccount}
                   className={`group-hover:shadow-md transition-all duration-300 ${fromCreateAccount ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                 />
                 <MapPin size={20} className="absolute right-4 top-12 text-neutral-400 group-hover:text-primary-500 transition-colors duration-300" />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  className=""
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
                  className=""
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative group">
                <Input
                  label="Adresse email (optionnel)"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com (optionnel)"
                  error={errors.email}
                  className=""
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
                   placeholder="+229 12345678"
                   error={errors.phone}
                   required
                   className=""
                 />
                 <Phone size={20} className="absolute right-4 top-12 text-neutral-400 group-hover:text-primary-500 transition-colors duration-300" />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className=""
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
                  className=""
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

            <div className="group">
              <label className="block text-sm font-medium text-secondary-900 font-montserrat mb-3">
                Photo de votre carte d'étudiant *
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'studentCard')}
                  className="hidden"
                  id="studentCard"
                  required
                />
                <label
                  htmlFor="studentCard"
                  className="flex items-center justify-center w-full px-6 py-8 border-2 border-dashed border-accent-300 rounded-2xl cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-all duration-300 group-hover:shadow-md"
                >
                  <div className="text-center">
                    <Camera size={32} className="text-neutral-400 group-hover:text-primary-500 transition-colors duration-300 mx-auto mb-2" />
                    <span className="text-neutral-600 font-montserrat block">
                      {formData.studentCard ? formData.studentCard.name : 'Choisir une photo'}
                    </span>
                    <span className="text-sm text-neutral-400 font-montserrat">
                      {formData.studentCard ? 'Fichier sélectionné' : 'Cliquez pour sélectionner'}
                    </span>
                  </div>
                </label>
              </div>
              {errors.studentCard && (
                <p className="text-red-500 text-sm mt-2 font-montserrat">{errors.studentCard}</p>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className=""
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
                  className=""
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative group">
                                 <Input
                   label="Téléphone du témoin"
                   type="tel"
                   name="temoinPhone"
                   value={formData.temoinPhone}
                   onChange={handleChange}
                   placeholder="+229 12345678"
                   error={errors.temoinPhone}
                   required
                   className=""
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
                  className=""
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
          <div className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className=""
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
                  className=""
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative group">
                                 <Input
                   label="Téléphone d'urgence"
                   type="tel"
                   name="emergencyPhone"
                   value={formData.emergencyPhone}
                   onChange={handleChange}
                   placeholder="+229 12345678"
                   error={errors.emergencyPhone}
                   required
                   className=""
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
                  className=""
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
                className=""
              />
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Récapitulatif</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                <div className="divide-y divide-slate-100">
                  {[
                    ['Nom', `${formData.firstName} ${formData.lastName}`],
                    ['Facebook', formData.facebookName],
                    ['Filière', `${formData.filiere} — ${formData.anneeEtude}`],
                    ['Entité', formData.entite],
                    ['Email', formData.email],
                    ['Téléphone', formData.phone],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between items-center px-4 py-2 text-xs">
                      <span className="text-slate-400">{label}</span>
                      <span className="text-slate-700 font-medium text-right max-w-[55%] truncate">{value || '—'}</span>
                    </div>
                  ))}
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    ['Témoin', formData.temoinName],
                    ['Quartier témoin', formData.temoinQuartier],
                    ['Urgence', formData.emergencyName],
                    ['Relation', formData.emergencyRelation],
                    ['Tél. urgence', formData.emergencyPhone],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between items-center px-4 py-2 text-xs">
                      <span className="text-slate-400">{label}</span>
                      <span className="text-slate-700 font-medium text-right max-w-[55%] truncate">{value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-[#0f2d6b]/5 border border-[#0f2d6b]/10 rounded-xl px-4 py-3 text-sm">
              <span className="w-5 h-5 bg-[#0f2d6b] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">i</span>
              <p className="text-[#0f2d6b] text-xs">Après la création de votre compte, vous recevrez un code OTP par email pour finaliser l'inscription.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const stepIndex = steps.findIndex(s => s.id === currentStep);
  const stepLabels = ['Infos personnelles', 'Témoin', 'Contact urgence', 'Validation'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-start py-8 px-4">

      {/* Header compact */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex items-center justify-center">
            <img src="/logo-campus-finance.png" alt="AB Campus Finance" className="w-full h-full object-contain" />
          </div>
          <span className="text-[#0f2d6b] font-bold text-sm hidden sm:block">AB Campus Finance</span>
        </div>
        <p className="text-xs text-slate-500">
          Étape <span className="font-semibold text-[#0f2d6b]">{stepIndex + 1}</span>/{steps.length} — {stepLabels[stepIndex]}
        </p>
      </div>

      {/* Progress steps */}
      <div className="w-full max-w-2xl mb-6">
        <div className="flex items-center gap-1.5">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className={`flex items-center gap-1.5 flex-shrink-0 transition-all ${currentStep === step.id ? 'opacity-100' : 'opacity-60'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep > step.id ? 'bg-[#e8a020] text-white' :
                  currentStep === step.id ? 'bg-[#0f2d6b] text-white' :
                  'bg-slate-200 text-slate-500'
                }`}>
                  {currentStep > step.id ? <CheckCircle size={12} /> : stepIndex + 1 === index + 1 ? index + 1 : index + 1}
                </div>
                <span className="text-xs text-slate-600 hidden sm:block">{stepLabels[index]}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 rounded-full transition-all ${currentStep > step.id ? 'bg-[#e8a020]' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Carte formulaire */}
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Titre section */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0f2d6b]/8 rounded-lg flex items-center justify-center">
            {React.createElement(steps[stepIndex]?.icon || User, { size: 16, className: 'text-[#0f2d6b]' })}
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#0f2d6b]">{stepLabels[stepIndex]}</h2>
            <p className="text-xs text-slate-400">Renseignez les champs ci-dessous</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {errors.general && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 text-sm mb-5">
                <span className="mt-0.5 flex-shrink-0">⚠</span>
                <span>{errors.general}</span>
              </div>
            )}
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="px-6 pb-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            {currentStep > 5 ? (
              <button type="button" onClick={handlePrevious}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition">
                <ArrowLeft size={15} /> Précédent
              </button>
            ) : <div />}

            {currentStep < 8 ? (
              <button type="button" onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0f2d6b] hover:bg-[#0a2255] rounded-xl shadow-md hover:shadow-lg transition ml-auto">
                Suivant <ArrowRight size={15} />
              </button>
            ) : (
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#0f2d6b] hover:bg-[#0a2255] rounded-xl shadow-md hover:shadow-lg transition disabled:opacity-50 ml-auto">
                {loading ? (
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : <CheckCircle size={15} />}
                {loading ? 'Création...' : 'Créer mon compte'}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lien connexion */}
      <p className="text-center text-sm text-slate-500 mt-5">
        Déjà un compte ?{' '}
        <Link to="/login" className="text-[#0f2d6b] font-semibold hover:underline">Se connecter</Link>
      </p>
    </div>
  );
};

export default Register;