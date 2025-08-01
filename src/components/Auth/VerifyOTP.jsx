import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import Button from '../UI/Button';
import Logo from '../UI/Logo';
import StarBorder from '../UI/StarBorder';
import { Mail, Lock, ArrowLeft, CheckCircle, Clock } from 'lucide-react';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useNotifications();

  const { user, email } = location.state || {};

  useEffect(() => {
    if (!user || !email) {
      navigate('/register');
      return;
    }

    // Démarrer le compte à rebours pour le renvoi d'OTP
    setCountdown(60);
  }, [user, email, navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Empêcher plus d'un caractère
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus sur le champ suivant
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Auto-focus sur le champ précédent si on efface
    if (!value && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
    }
  };

  const validateOTP = () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setErrors({ otp: 'Veuillez saisir le code OTP complet' });
      return false;
    }
    if (!/^\d{6}$/.test(otpString)) {
      setErrors({ otp: 'Le code OTP doit contenir uniquement des chiffres' });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!validateOTP()) return;

    setLoading(true);
    
    try {
      // Ici, vous devrez implémenter la vérification OTP avec votre backend
      // Pour l'instant, on simule une vérification réussie
      const otpString = otp.join('');
      
      // Simulation de vérification (remplacez par votre logique réelle)
      if (otpString === '123456') { // Code de test
        showSuccess('Compte vérifié avec succès !');
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Votre compte a été créé et vérifié avec succès. Vous pouvez maintenant vous connecter.' }
          });
        }, 2000);
      } else {
        throw new Error('Code OTP incorrect');
      }

    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      setErrors({ otp: 'Code OTP incorrect. Veuillez réessayer.' });
      showError('Vérification échouée', 'Le code OTP saisi est incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    
    try {
      // Ici, vous devrez implémenter le renvoi d'OTP avec votre backend
      // Pour l'instant, on simule un renvoi réussi
      
      setCountdown(60);
      showSuccess('Code OTP renvoyé avec succès !');
      
    } catch (error) {
      console.error('Erreur lors du renvoi:', error);
      showError('Erreur de renvoi', 'Impossible de renvoyer le code OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  if (!user || !email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-400/20 to-secondary-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-accent-400/20 to-primary-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="flex justify-center mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft">
              <Logo size="xl" showText={true} />
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-secondary-900 font-montserrat mb-3">
              Vérification de votre compte
            </h1>
            <p className="text-neutral-600 font-montserrat">
              Nous avons envoyé un code de vérification à
            </p>
            <p className="text-primary-600 font-semibold font-montserrat">
              {email}
            </p>
          </div>
        </div>

        {/* Main Container */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl font-montserrat">
                {errors.general}
              </div>
            )}

            {/* OTP Input */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-secondary-900 font-montserrat">
                Code de vérification
              </label>
              
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 text-center text-lg font-semibold border-2 border-accent-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 font-montserrat"
                    maxLength={1}
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                ))}
              </div>
              
              {errors.otp && (
                <p className="text-red-500 text-sm text-center font-montserrat">{errors.otp}</p>
              )}
            </div>

            {/* Info */}
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <div>
                  <p className="font-medium text-blue-900 font-montserrat text-sm">Code de test :</p>
                  <p className="text-blue-700 text-sm font-montserrat">
                    Pour les tests, utilisez le code <strong>123456</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <StarBorder
              color="#FF6B35"
              speed="2s"
              thickness={3}
              className="w-full"
            >
              <Button
                type="submit"
                loading={loading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-montserrat text-lg py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                {loading ? 'Vérification...' : 'Vérifier le code'}
              </Button>
            </StarBorder>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-neutral-600 font-montserrat text-sm mb-3">
              Vous n'avez pas reçu le code ?
            </p>
            
            {countdown > 0 ? (
              <div className="flex items-center justify-center space-x-2 text-neutral-500 font-montserrat">
                <Clock size={16} />
                <span>Renvoyer dans {countdown}s</span>
              </div>
            ) : (
              <button
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="text-primary-600 hover:text-primary-700 font-semibold font-montserrat transition-colors duration-300 disabled:opacity-50"
              >
                {resendLoading ? 'Envoi...' : 'Renvoyer le code'}
              </button>
            )}
          </div>

          {/* Back to Register */}
          <div className="mt-6 text-center pt-4 border-t border-accent-200">
            <button
              onClick={() => navigate('/register')}
              className="flex items-center justify-center space-x-2 text-neutral-600 hover:text-neutral-800 font-montserrat transition-colors duration-300 mx-auto"
            >
              <ArrowLeft size={16} />
              <span>Retour à l'inscription</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP; 