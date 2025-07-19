import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Logo from '../UI/Logo';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

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

    const result = await login(formData);
    
    if (result.success) {
      // Redirection basée sur le rôle
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-50 to-primary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-large p-8 border border-accent-200">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Logo CAMPUS FINANCE */}
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
                label="Adresse email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                required
              />
              <Mail size={20} className="absolute right-3 top-11 text-neutral-400" />
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
                className="absolute right-3 top-11 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-montserrat"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          {/* Liens */}
          <div className="mt-6 text-center">
            <p className="text-neutral-600 font-montserrat">
              Pas encore de compte ?{' '}
              <Link 
                to="/register" 
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                S'inscrire
              </Link>
            </p>
          </div>
        </div>

        {/* Compte de test */}
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
          <h3 className="font-medium text-primary-800 mb-2 font-montserrat">Comptes de test :</h3>
          <div className="text-sm text-primary-700 space-y-1 font-montserrat">
            <p><strong>Client :</strong> client@test.com / password123</p>
            <p><strong>Admin :</strong> admin@test.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;