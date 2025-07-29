import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { registerUser } from '../../utils/supabaseClient';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Logo from '../UI/Logo';
import StarBorder from '../UI/StarBorder';
import { Mail, Lock, Phone, Eye, EyeOff, Camera, GraduationCap, Building } from 'lucide-react';
import { validateEmail, validatePhone } from '../../utils/helpers';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    filiere: '',
    anneeEtude: '',
    entite: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [studentCard, setStudentCard] = useState(null);
  const [identityCard, setIdentityCard] = useState(null);


  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Effacer l'erreur du champ quand l'utilisateur tape
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
      if (type === 'studentCard') {
        setStudentCard(file);
      } else if (type === 'identityCard') {
        setIdentityCard(file);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }

    if (!formData.filiere.trim()) {
      newErrors.filiere = 'La filière est requise';
    }

    if (!formData.anneeEtude.trim()) {
      newErrors.anneeEtude = "L'année d'étude est requise";
    }

    if (!formData.entite.trim()) {
      newErrors.entite = "L'entité est requise";
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Numéro de téléphone invalide';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (!studentCard) {
      newErrors.studentCard = 'La photo de la carte étudiant est requise';
    }

    if (!identityCard) {
      newErrors.identityCard = 'La photo de la carte d\'identité est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Préparer les données utilisateur pour Supabase
      const userData = {
        ...formData,
        status: 'pending',
        created_at: new Date().toISOString(),
        student_card_name: studentCard?.name || 'Carte étudiant',
        identity_card_name: identityCard?.name || 'Carte d\'identité',
        role: 'client'
      };
      
      // Enregistrer l'utilisateur dans Supabase
      const result = await registerUser(userData);
      
      if (result.success) {
        // Rediriger vers page "en attente"
        navigate('/pending-approval', { 
          state: { user: result.data[0] } 
        });
        
        showSuccess('Inscription réussie ! Votre compte est en attente d\'approbation.');
      } else {
        throw new Error(result.error?.message || 'Erreur lors de l\'enregistrement');
      }

    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      setErrors({ general: 'Erreur lors de l\'inscription. Veuillez réessayer.' });
      showError('Inscription échouée', 'Une erreur est survenue lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-50 to-primary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-large p-8 border border-accent-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo size="xl" showText={true} />
            </div>
            
            <h2 className="text-2xl font-semibold text-secondary-900 font-montserrat mb-2">
              Inscription Étudiant
            </h2>
            <p className="text-neutral-600 font-montserrat">
              Créez votre compte étudiant
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl font-montserrat">
                {errors.general}
              </div>
            )}

            {/* Informations personnelles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  label="Prénom"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Votre prénom"
                  error={errors.firstName}
                  required
                />
              </div>
              
              <div className="relative">
                <Input
                  label="Nom"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Votre nom"
                  error={errors.lastName}
                  required
                />
              </div>
            </div>

            {/* Informations académiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Input
                  label="Filière"
                  type="text"
                  name="filiere"
                  value={formData.filiere}
                  onChange={handleChange}
                  placeholder="Ex: Informatique"
                  error={errors.filiere}
                  required
                />
                <GraduationCap size={20} className="absolute right-3 top-11 text-neutral-400" />
              </div>
              
              <div className="relative">
                <Input
                  label="Année d'étude"
                  type="text"
                  name="anneeEtude"
                  value={formData.anneeEtude}
                  onChange={handleChange}
                  placeholder="Ex: 2ème année"
                  error={errors.anneeEtude}
                  required
                />
              </div>
              
              <div className="relative">
                <select
                  name="entite"
                  value={formData.entite}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-montserrat ${
                    errors.entite ? 'border-red-300' : 'border-accent-200'
                  }`}
                  required
                >
                  <option value="">Sélectionner une entité</option>
                  <option value="INSTI">INSTI</option>
                  <option value="ENSET">ENSET</option>
                </select>
                <Building size={20} className="absolute right-3 top-11 text-neutral-400" />
                {errors.entite && (
                  <p className="text-red-500 text-sm mt-1 font-montserrat">{errors.entite}</p>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  label="Adresse email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  error={errors.email}
                  required
                />
                <Mail size={20} className="absolute right-3 top-11 text-neutral-400" />
              </div>

              <div className="relative">
                <Input
                  label="Numéro de téléphone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+229 53463606"
                  error={errors.phone}
                  required
                />
                <Phone size={20} className="absolute right-3 top-11 text-neutral-400" />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  label="Mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  error={errors.password}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-11 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  error={errors.confirmPassword}
                  required
                />
                <Lock size={20} className="absolute right-3 top-11 text-neutral-400" />
              </div>
            </div>

            {/* Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-900 font-montserrat mb-2">
                  Photo de la carte étudiant *
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
                    className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-accent-200 rounded-xl cursor-pointer hover:border-primary-500 transition-colors duration-200"
                  >
                    <Camera size={20} className="text-neutral-400 mr-2" />
                    <span className="text-neutral-600 font-montserrat">
                      {studentCard ? studentCard.name : 'Choisir une photo'}
                    </span>
                  </label>
                </div>
                {errors.studentCard && (
                  <p className="text-red-500 text-sm mt-1 font-montserrat">{errors.studentCard}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-900 font-montserrat mb-2">
                  Photo de la carte d'identité *
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'identityCard')}
                    className="hidden"
                    id="identityCard"
                    required
                  />
                  <label
                    htmlFor="identityCard"
                    className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-accent-200 rounded-xl cursor-pointer hover:border-primary-500 transition-colors duration-200"
                  >
                    <Camera size={20} className="text-neutral-400 mr-2" />
                    <span className="text-neutral-600 font-montserrat">
                      {identityCard ? identityCard.name : 'Choisir une photo'}
                    </span>
                  </label>
                </div>
                {errors.identityCard && (
                  <p className="text-red-500 text-sm mt-1 font-montserrat">{errors.identityCard}</p>
                )}
              </div>
            </div>

            <StarBorder
              color="#FF6B35"
              speed="2s"
              thickness={3}
              className="w-full"
            >
              <Button
                type="submit"
                loading={loading}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-montserrat"
              >
                {loading ? 'Création du compte...' : 'Créer mon compte'}
              </Button>
            </StarBorder>
          </form>

          {/* Liens */}
          <div className="mt-6 text-center">
            <p className="text-neutral-600 font-montserrat">
              Déjà un compte ?{' '}
              <Link 
                to="/login" 
                className="text-primary-600 hover:text-primary-700 font-medium"
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