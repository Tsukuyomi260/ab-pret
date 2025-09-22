import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Logo from '../UI/Logo';
import StarBorder from '../UI/StarBorder';
import { Mail, Eye, EyeOff, Phone } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '', // email ou téléphone
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signInWithPhoneNumber } = useAuth();
  const navigate = useNavigate();

  // Fonction pour détecter si c'est un téléphone ou un email
  const isPhoneNumber = (identifier) => {
    const cleanIdentifier = identifier.replace(/[^0-9]/g, '');
    return cleanIdentifier.length >= 8 && cleanIdentifier.length <= 15;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Effacer l'erreur quand l'utilisateur tape
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const identifier = formData.identifier.trim();
      const isPhone = isPhoneNumber(identifier);
      
      console.log('[LOGIN] Tentative de connexion avec:', {
        identifier,
        type: isPhone ? 'téléphone' : 'email'
      });
      
      let result;
      
      if (isPhone) {
        // Connexion par téléphone
        console.log('[LOGIN] Connexion par téléphone');
        result = await signInWithPhoneNumber(identifier, formData.password);
      } else {
        // Connexion par email
        console.log('[LOGIN] Connexion par email');
        result = await signIn(identifier, formData.password);
      }
      
      console.log('[LOGIN] Résultat de la connexion:', result);

      if (result.success) {
        if (result.user && result.user.role === 'admin') {
          console.log('[LOGIN] Connexion admin réussie, redirection vers /admin');
          navigate('/admin');
        } else {
          console.log('[LOGIN] Connexion client réussie, redirection vers /dashboard');
          navigate('/dashboard');
        }
      } else {
        console.error('[LOGIN] Échec de la connexion:', result.error);
        setError(result.error || 'Erreur de connexion');
      }
    } catch (err) {
      console.error('[LOGIN] Erreur exceptionnelle:', err);
      setError('Erreur de connexion inattendue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-50 to-primary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-large p-8 border border-accent-200">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Logo AB CAMPUS FINANCE animé */}
            <div className="flex justify-center mb-6">
              <Logo size="xl" showText={true} />
            </div>
            
            <h2 className="text-2xl font-semibold text-secondary-900 font-montserrat mb-2">
              Connexion
            </h2>
            <p className="text-neutral-600 font-montserrat">
              Accédez à votre compte
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl font-montserrat">
                {error}
              </div>
            )}

            <div className="relative">
              <Input
                label="Identifiant"
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Email ou numéro de téléphone"
                required
              />
              {isPhoneNumber(formData.identifier) ? (
                <Phone size={20} className="absolute right-3 top-11 text-neutral-400" />
              ) : (
                <Mail size={20} className="absolute right-3 top-11 text-neutral-400" />
              )}
            </div>

            <div className="relative">
              <Input
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-11 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>

            <div className="text-center space-y-3">
              <div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div>
                <Link
                  to="/create-account"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  Pas encore de compte ? Créer un compte
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Éléments décoratifs */}
      <StarBorder />
    </div>
  );
};

export default Login;