import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import NotificationBell from '../UI/NotificationBell';
import { ArrowLeft, CreditCard, Wallet, CheckCircle, AlertCircle, Activity, BarChart3, Percent, Award, Gift, Rocket, Shield, TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const Repayment = () => {
  const { notifications, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentLoan, setCurrentLoan] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Animations CSS personnalisées
  const gradientAnimation = `
    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes pulse-glow {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(1.05); }
    }
    @keyframes slide-in-right {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes bounce-in {
      0% { transform: scale(0.3); opacity: 0; }
      50% { transform: scale(1.05); }
      70% { transform: scale(0.9); }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    @keyframes shine {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .animate-gradient {
      background-size: 200% 200%;
      animation: gradient 8s ease infinite;
    }
    .animate-pulse-glow {
      animation: pulse-glow 2s ease-in-out infinite;
    }
    .animate-slide-in-right {
      animation: slide-in-right 0.6s ease-out;
    }
    .animate-bounce-in {
      animation: bounce-in 0.8s ease-out;
    }
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }
    .animate-shine {
      animation: shine 2s ease-in-out infinite;
    }
  `;

  useEffect(() => {
    // Simulation des données (à remplacer par des appels API)
    setTimeout(() => {
      const loan = {
        id: 1,
        amount: 75000,
        monthlyPayment: 82500,
        totalAmount: 82500,
        paidAmount: 0,
        remainingAmount: 82500,
        dueDate: '2025-08-01',
        nextPaymentDate: '2025-08-01'
      };
      setCurrentLoan(loan);
      setPaymentAmount(loan.monthlyPayment.toString());
    }, 1000);
  }, []);

  const validatePayment = () => {
    const newErrors = {};

    if (!currentLoan) {
      newErrors.loan = 'Aucun prêt actif trouvé';
    }

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      newErrors.amount = 'Veuillez entrer un montant valide';
    } else if (parseFloat(paymentAmount) > currentLoan?.remainingAmount) {
      newErrors.amount = 'Le montant ne peut pas dépasser le reste à payer';
    }

    if (!paymentMethod) {
      newErrors.method = 'Veuillez sélectionner un mode de paiement';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePayment()) return;

    setLoading(true);
    
    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirection vers le dashboard avec un message de succès
      navigate('/dashboard', { 
        state: { message: 'Paiement effectué avec succès' }
      });
    } catch (error) {
      setErrors({ general: 'Erreur lors du paiement' });
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'mobile_money': return '📱';
      default: return '💳';
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'mobile_money': return 'Mobile Money';
      default: return 'Carte bancaire';
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50">
      <style>{gradientAnimation}</style>
      
      {/* Section Hero - En-tête principal */}
      <div className="relative overflow-hidden">
        {/* Background avec gradient animé - Thème remboursement (vert/orange) */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-600 to-orange-500 opacity-15 animate-gradient"></div>
        
        {/* Couche de profondeur supplémentaire */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent"></div>
        
        {/* Pattern décoratif amélioré */}
        <div className="absolute inset-0 opacity-8">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute top-0 left-0 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-xl"
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
              opacity: [0.6, 0.3, 0.6]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute top-0 right-0 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [180, 360, 180],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{ 
              duration: 12, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 4
            }}
            className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl"
          />
          
          {/* Particules flottantes */}
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute top-1/4 left-1/4 w-4 h-4 bg-green-300 rounded-full"
          />
          <motion.div
            animate={{ 
              y: [0, 15, 0],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute top-3/4 right-1/3 w-3 h-3 bg-emerald-300 rounded-full"
          />
          <motion.div
            animate={{ 
              x: [0, 10, 0],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-orange-300 rounded-full"
          />
          
          {/* Particules supplémentaires */}
          <motion.div
            animate={{ 
              x: [0, -15, 0],
              y: [0, -10, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ 
              duration: 7, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute top-1/3 right-1/4 w-2 h-2 bg-yellow-300 rounded-full"
          />
          <motion.div
            animate={{ 
              x: [0, 12, 0],
              y: [0, -8, 0],
              opacity: [0.2, 0.7, 0.2]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 1.5
            }}
            className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-lime-300 rounded-full"
          />
          <motion.div
            animate={{ 
              x: [0, -8, 0],
              y: [0, 12, 0],
              opacity: [0.4, 0.9, 0.4]
            }}
            transition={{ 
              duration: 9, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 2.5
            }}
            className="absolute top-2/3 left-1/3 w-1 h-1 bg-amber-300 rounded-full"
          />
        </div>

        {/* Contenu Header */}
        <div className="relative px-4 lg:px-8 py-8 lg:py-12 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-between mb-8"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm border-white/30"
                >
                  <ArrowLeft size={20} />
                  <span>Retour</span>
                </Button>
              </motion.div>
            </motion.div>

            {/* Section Hero - En-tête principal */}
            <div className="text-center mb-8 lg:mb-12">


              {/* Titre principal */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl lg:text-6xl font-bold text-secondary-900 font-montserrat mb-4"
              >
                Remboursement{' '}
                <motion.span 
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="bg-gradient-to-r from-green-600 via-emerald-600 to-orange-600 bg-[length:200%_100%] bg-clip-text text-transparent"
                >
                  de Prêt
                </motion.span>{' '}
                <motion.span
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="inline-block"
                >
                  💳
                </motion.span>
              </motion.h1>


            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal centré */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Informations du prêt actif */}
          {currentLoan ? (
            <Card title="Votre prêt actif" className="bg-white/90 backdrop-blur-sm border-white/20">
              <div className="border rounded-2xl p-6 bg-gradient-to-r from-primary-50/80 to-accent-50/80 border-primary-200/50 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900 text-xl font-montserrat">Prêt #{currentLoan.id}</h3>
                  <span className="text-sm text-primary-600 font-medium bg-primary-100/80 px-4 py-2 rounded-full">
                    {formatCurrency(currentLoan.remainingAmount)} restant
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 bg-white/60 rounded-xl border border-white/50">
                    <span className="text-gray-600 text-xs uppercase tracking-wide">Mensualité</span>
                    <p className="font-semibold text-xl text-gray-900">{formatCurrency(currentLoan.monthlyPayment)}</p>
                  </div>
                  <div className="p-4 bg-white/60 rounded-xl border border-white/50">
                    <span className="text-gray-600 text-xs uppercase tracking-wide">Prochain paiement</span>
                    <p className="font-semibold text-xl text-gray-900">{new Date(currentLoan.nextPaymentDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="p-4 bg-white/60 rounded-xl border border-white/50">
                    <span className="text-gray-600 text-xs uppercase tracking-wide">Montant total</span>
                    <p className="font-semibold text-xl text-gray-900">{formatCurrency(currentLoan.totalAmount)}</p>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card title="Aucun prêt actif" className="bg-white/90 backdrop-blur-sm border-white/20">
              <div className="text-center py-12">
                <Wallet size={64} className="mx-auto mb-6 text-gray-300" />
                <p className="text-gray-500 mb-6 text-lg">Aucun prêt actif à rembourser</p>
                <Button 
                  onClick={() => navigate('/loan-request')}
                  className="px-8 py-4 text-lg rounded-2xl bg-primary-500 hover:bg-primary-600"
                >
                  Demander un prêt
                </Button>
              </div>
            </Card>
          )}

          {/* Formulaire de paiement */}
          {currentLoan && (
            <Card title="Paiement" className="bg-white/90 backdrop-blur-sm border-white/20">
              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.general && (
                  <div className="bg-red-50/80 border border-red-200/50 text-red-700 px-4 py-3 rounded-2xl flex items-center space-x-2">
                    <AlertCircle size={20} />
                    <span>{errors.general}</span>
                  </div>
                )}

                {/* Informations du prêt actif */}
                <div className="bg-blue-50/80 border border-blue-200/50 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <CreditCard size={24} className="text-blue-600" />
                    <h3 className="font-semibold text-blue-900 text-lg font-montserrat">Prêt #{currentLoan.id}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div className="p-3 bg-blue-100/50 rounded-xl">
                      <span className="text-blue-700 text-xs uppercase tracking-wide">Reste à payer</span>
                      <p className="font-bold text-blue-900 text-xl">{formatCurrency(currentLoan.remainingAmount)}</p>
                    </div>
                    <div className="p-3 bg-blue-100/50 rounded-xl">
                      <span className="text-blue-700 text-xs uppercase tracking-wide">Mensualité</span>
                      <p className="font-bold text-blue-900 text-xl">{formatCurrency(currentLoan.monthlyPayment)}</p>
                    </div>
                  </div>
                </div>

                {/* Montant du paiement */}
                <div>
                  <Input
                    label="Montant du paiement (FCFA)"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder={currentLoan.monthlyPayment.toString()}
                    error={errors.amount}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Montant suggéré: <span className="font-semibold text-primary-600">{formatCurrency(currentLoan.monthlyPayment)}</span>
                  </p>
                </div>

                  {/* Mode de paiement */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Mode de paiement
                    </label>
                    <div className="space-y-3">
                      {[
                        { value: 'mobile_money', label: 'Mobile Money', description: 'Moov Benin, MTN Benin, Celtiis Cash' }
                      ].map((method) => (
                        <label
                          key={method.value}
                          className={`flex items-center p-4 border rounded-2xl cursor-pointer transition-all duration-300 ${
                            paymentMethod === method.value
                              ? 'border-primary-500 bg-primary-50/80 shadow-lg'
                              : 'border-gray-200/50 hover:border-primary-300 hover:shadow-md bg-white/60 backdrop-blur-sm'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.value}
                            checked={paymentMethod === method.value}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="sr-only"
                          />
                          <div className="flex items-center space-x-4">
                            <span className="text-3xl">{getPaymentMethodIcon(method.value)}</span>
                            <div>
                              <p className="font-semibold text-gray-900 text-lg">{method.label}</p>
                              <p className="text-sm text-gray-500">{method.description}</p>
                            </div>
                          </div>
                          {paymentMethod === method.value && (
                            <CheckCircle size={24} className="text-primary-600 ml-auto" />
                          )}
                        </label>
                      ))}
                    </div>
                    {errors.method && (
                      <p className="mt-2 text-sm text-red-500">{errors.method}</p>
                    )}
                  </div>

                  {/* Résumé du paiement */}
                  <div className="bg-gray-50/80 border border-gray-200/50 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 text-lg">Résumé du paiement</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                        <span className="text-gray-600">Montant du paiement:</span>
                        <span className="font-semibold text-lg">{formatCurrency(parseFloat(paymentAmount) || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                        <span className="text-gray-600">Mode de paiement:</span>
                        <span className="font-semibold">{getPaymentMethodText(paymentMethod)}</span>
                      </div>
                      <div className="border-t border-gray-200/50 pt-3">
                        <div className="flex justify-between items-center p-3 bg-primary-50/50 rounded-xl">
                          <span className="text-gray-900 font-semibold text-lg">Total:</span>
                          <span className="text-gray-900 font-bold text-xl">{formatCurrency(parseFloat(paymentAmount) || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    loading={loading}
                    className="w-full px-8 py-4 text-lg rounded-2xl bg-primary-500 hover:bg-primary-600 font-semibold"
                  >
                    {loading ? 'Traitement...' : 'Effectuer le paiement'}
                  </Button>
                </form>
              </Card>
            )}

        </div>
      </div>
    </div>
  );
};

export default Repayment;

