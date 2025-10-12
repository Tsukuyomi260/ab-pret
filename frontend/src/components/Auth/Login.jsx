import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Eye, EyeOff, Phone, Lock, LogIn, UserPlus, KeyRound } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signInWithPhoneNumber } = useAuth();
  const navigate = useNavigate();

  const isPhoneNumber = (identifier) => {
    const cleanIdentifier = identifier.replace(/[^0-9]/g, '');
    return cleanIdentifier.length >= 8 && cleanIdentifier.length <= 15;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
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
        result = await signInWithPhoneNumber(identifier, formData.password);
      } else {
        result = await signIn(identifier, formData.password);
      }
      
      console.log('[LOGIN] Résultat:', result);

      if (result.success) {
        if (result.user && result.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.error || 'Identifiants incorrects');
      }
    } catch (err) {
      console.error('[LOGIN] Erreur:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card principale */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header avec dégradé */}
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-8 text-center">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg p-2">
              <img 
                src="/logo-campus-finance.png" 
                alt="AB Campus Finance" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-white font-montserrat mb-2">
              Bienvenue
            </h1>
            <p className="text-slate-300 font-montserrat">
              Connectez-vous à votre compte
            </p>
          </div>

          {/* Formulaire */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Message d'erreur */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              {/* Identifiant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email ou Téléphone
                </label>
                <div className="relative">
                  {isPhoneNumber(formData.identifier) ? (
                    <Phone size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  ) : (
                    <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  )}
                  <input
                    type="text"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    placeholder="Entrez votre email ou téléphone"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Bouton de connexion */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogIn size={20} />
                <span>{loading ? 'Connexion en cours...' : 'Se connecter'}</span>
              </button>

              {/* Liens */}
              <div className="space-y-3">
                <div className="text-center">
                  <Link
                    to="/forgot-password"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-yellow-600 font-medium transition-colors"
                  >
                    <KeyRound size={16} />
                    Mot de passe oublié ?
                  </Link>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">ou</span>
                  </div>
                </div>

                <Link
                  to="/create-account"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-medium transition-all duration-200 border border-slate-200"
                >
                  <UserPlus size={20} />
                  <span>Créer un compte</span>
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            © 2024 AB Campus Finance. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
