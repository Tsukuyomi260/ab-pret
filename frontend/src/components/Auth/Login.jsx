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
    <div className="min-h-screen flex">

      {/* ── Panneau gauche – branding (visible desktop uniquement) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0f2d6b] flex-col justify-between p-12 relative overflow-hidden">
        {/* Cercles décoratifs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute bottom-10 -right-16 w-56 h-56 rounded-full bg-[#e8a020]/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/3" />

        {/* Logo + nom */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md p-1">
            <img src="/logo-campus-finance.png" alt="AB Campus Finance" className="w-full h-full object-contain" />
          </div>
          <span className="text-white font-bold text-lg tracking-wide">AB Campus Finance</span>
        </div>

        {/* Texte central */}
        <div className="relative z-10 space-y-6">
          <div className="w-12 h-1 bg-[#e8a020] rounded-full" />
          <h2 className="text-4xl font-bold text-white leading-snug">
            La finance étudiante,<br />
            <span className="text-[#e8a020]">réinventée.</span>
          </h2>
          <p className="text-slate-300 text-base leading-relaxed max-w-sm">
            Prêts rapides, épargne intelligente et suivi en temps réel — tout ce dont vous avez besoin pour réussir.
          </p>

          {/* Trois points clés */}
          <div className="space-y-3 pt-2">
            {['Prêts approuvés en 24h', 'Épargne avec intérêts 5%/mois', 'Sécurisé & 100% en ligne'].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#e8a020]/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-[#e8a020]" />
                </div>
                <span className="text-slate-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer branding */}
        <div className="relative z-10">
          <p className="text-slate-500 text-xs">Made with pride in Bénin 🇧🇯</p>
        </div>
      </div>

      {/* ── Panneau droit – formulaire ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 p-6 sm:p-10">
        <div className="w-full max-w-sm space-y-8">

          {/* Logo mobile uniquement */}
          <div className="flex lg:hidden flex-col items-center gap-2">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-md p-2 flex items-center justify-center">
              <img src="/logo-campus-finance.png" alt="AB Campus Finance" className="w-full h-full object-contain" />
            </div>
            <span className="text-[#0f2d6b] font-bold text-base tracking-wide">AB Campus Finance</span>
          </div>

          {/* Titre formulaire */}
          <div>
            <h1 className="text-2xl font-bold text-[#0f2d6b]">Connexion</h1>
            <p className="text-slate-500 text-sm mt-1">Entrez vos identifiants pour accéder à votre espace.</p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Erreur */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 text-sm">
                <span className="mt-0.5 flex-shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Email / Téléphone */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Email ou Téléphone</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  {isPhoneNumber(formData.identifier)
                    ? <Phone size={16} />
                    : <Mail size={16} />}
                </span>
                <input
                  type="text"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  placeholder="vous@email.com ou 97000000"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f2d6b]/20 focus:border-[#0f2d6b] transition"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Mot de passe</label>
                <Link to="/forgot-password" className="text-xs text-[#e8a020] hover:underline font-medium">
                  Oublié ?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f2d6b]/20 focus:border-[#0f2d6b] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Bouton connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0f2d6b] hover:bg-[#0a2255] text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : <LogIn size={16} />}
              <span>{loading ? 'Connexion...' : 'Se connecter'}</span>
            </button>

            {/* Séparateur */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">ou</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Créer un compte */}
            <Link
              to="/create-account"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-slate-50 text-[#0f2d6b] rounded-xl text-sm font-semibold border border-slate-200 transition-all duration-200"
            >
              <UserPlus size={16} />
              <span>Créer un compte</span>
            </Link>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400">
            © 2025 AB Campus Finance — Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
