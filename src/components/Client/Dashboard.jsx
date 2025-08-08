import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../UI/Card';
import Button from '../UI/Button';
import NotificationBell from '../UI/NotificationBell';
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  Plus,
  History,
  Wallet,
  Star,
  Target,
  Award,
  ArrowUpRight,
  Shield,
  Bell,
  BookOpen,
  Eye,
  TrendingUp,
  DollarSign,
  Info,
  X,
  Phone,
  Zap,
  CheckCircle2,
  Heart
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { notifications } = useNotifications();
  const [stats, setStats] = useState({
    totalLoaned: 0,
    totalRepaid: 0,
    amountToRepay: 0,
    activeLoans: 0,
    creditScore: 750,
    nextPayment: 0,
    daysUntilNextPayment: 0
  });
  const [loading, setLoading] = useState(true);

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

  // Données simulées pour le développement
  const recentLoans = [
    {
      id: 1,
      purpose: 'Frais de scolarité',
      amount: 150000,
      status: 'active',
      requestDate: '2025-01-15',
      category: 'education',
      monthlyPayment: 25000,
      totalAmount: 150000,
      paidAmount: 50000,
      progress: 33,
      nextPaymentDate: '2025-02-15'
    },
    {
      id: 2,
      purpose: 'Achat de matériel informatique',
      amount: 75000,
      status: 'active',
      requestDate: '2025-01-10',
      category: 'equipment',
      monthlyPayment: 15000,
      totalAmount: 75000,
      paidAmount: 30000,
      progress: 40,
      nextPaymentDate: '2025-02-10'
    },
    {
      id: 3,
      purpose: 'Frais de logement',
      amount: 120000,
      status: 'repaid',
      requestDate: '2024-12-01',
      category: 'housing',
      monthlyPayment: 20000,
      totalAmount: 120000,
      paidAmount: 120000,
      progress: 100,
      nextPaymentDate: null
    }
  ];

  useEffect(() => {
    // Simulation de chargement des données
    const loadStats = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStats({
        totalLoaned: 345000,
        totalRepaid: 200000,
        amountToRepay: 145000,
        activeLoans: 2,
        creditScore: 750,
        nextPayment: 25000,
        daysUntilNextPayment: 5
      });
      setLoading(false);
    };

    loadStats();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'repaid':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'pending':
        return 'En attente';
      case 'repaid':
        return 'Remboursé';
      default:
        return 'Inconnu';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'education':
        return <BookOpen className="w-6 h-6 text-blue-600" />;
      case 'equipment':
        return <CreditCard className="w-6 h-6 text-green-600" />;
      case 'housing':
        return <Target className="w-6 h-6 text-purple-600" />;
      default:
        return <DollarSign className="w-6 h-6 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50 flex items-center justify-center">
        <motion.div 
          className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50">
      <style>{gradientAnimation}</style>
      
      {/* Header mobile optimisé */}
      <div className="relative bg-white/80 backdrop-blur-sm border-b border-accent-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xl font-bold text-secondary-900 font-montserrat"
          >
            Bonjour,{' '}
            <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
              Elise
            </span>
            {' '}👋
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <NotificationBell />
              </motion.div>
            </div>
      </div>

      {/* Contenu principal optimisé mobile */}
      <div className="px-4 py-6 space-y-4">

        {/* Bouton d'action principal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center"
              >
                <Button 
                  onClick={() => navigate('/loan-request')}
            className="w-full max-w-sm bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl transform transition-all duration-200 py-4 px-6 rounded-2xl font-semibold"
                >
            <Plus size={20} className="mr-3" />
            Demander un nouveau prêt
                </Button>
            </motion.div>

        {/* Cartes métriques - Design Moderne */}
              <motion.div 
          className="grid grid-cols-2 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Score de crédit */}
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group cursor-pointer"
            onClick={() => navigate('/loyalty-score')}
          >
            <div className="relative overflow-hidden bg-gradient-to-r from-gray-800 via-gray-900 to-black rounded-3xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 h-40">
              {/* Effet de brillance */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              
              <div className="relative text-center h-full flex flex-col justify-center">
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Award size={20} className="text-yellow-400" />
                  </div>
                </div>
                <p className="text-gray-300 font-montserrat text-xs mb-1">Score de fidélité</p>
                <span className="text-xl font-bold text-white">{Math.min(5, Math.floor(stats.creditScore / 170))}</span>
                <p className="text-gray-400 text-xs">/ 5 points</p>
                
                {/* Étoiles */}
                <div className="flex justify-center mt-2 mb-3">
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                        className={`w-3 h-3 ${i < Math.min(5, Math.floor(stats.creditScore / 170)) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                            />
                          ))}
                        </div>
                      </div>

                {/* Barre de progression */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">Progression</span>
                    <span className="text-yellow-400 text-xs">+1</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div 
                      className="bg-gradient-to-r from-green-400 via-yellow-400 to-orange-400 h-1 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (stats.creditScore / 850) * 100)}%` }}
                      />
                    </div>
                  </div>
                    </div>
                  </div>
              </motion.div>

              {/* Prochain paiement */}
              <motion.div 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group cursor-pointer"
          >
            <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-red-600 rounded-3xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 h-40">
              {/* Effet de brillance */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              
              <div className="relative text-center h-full flex flex-col justify-center">
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Bell size={20} className="text-white" />
                  </div>
                </div>
                <p className="text-orange-100 font-montserrat text-xs mb-1">Prochain paiement</p>
                <p className="text-xl font-bold text-white mb-1">{formatCurrency(stats.nextPayment)}</p>
                
                {/* Espace pour équilibrer avec la carte score */}
                <div className="h-8 mb-2"></div>
                
                <div className="flex items-center justify-center space-x-1">
                  <Clock size={14} className="text-orange-200" />
                  <span className="text-xs text-orange-200">
                    {stats.daysUntilNextPayment} jour{stats.daysUntilNextPayment > 1 ? 's' : ''}
                        </span>
                      </div>
                
                {/* Barre de progression pour équilibrer */}
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-orange-200 text-xs">Échéance</span>
                    <span className="text-white text-xs">⚠️</span>
                    </div>
                  <div className="w-full bg-orange-300/30 rounded-full h-1">
                    <div 
                      className="bg-white h-1 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(0, 100 - (stats.daysUntilNextPayment * 3))}%` }}
                    />
                      </div>
                    </div>
                  </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Actions rapides - Design Moderne */}
            <motion.div 
          className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold text-secondary-900 font-montserrat mb-2">
              Actions rapides
            </h3>
            <p className="text-sm text-neutral-600 font-montserrat">
              Accédez rapidement à vos fonctionnalités
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {/* Nouveau prêt */}
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="group cursor-pointer"
              onClick={() => navigate('/loan-request')}
            >
              <div className="relative overflow-hidden bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 h-24">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                
                <div className="relative text-center h-full flex flex-col justify-center">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Plus size={18} className="text-white" />
            </div>
                  <span className="text-sm font-semibold text-white font-montserrat">Nouveau prêt</span>
            </div>
          </div>
            </motion.div>

            {/* Rembourser */}
            <motion.div 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="group cursor-pointer"
              onClick={() => navigate('/repayment')}
            >
              <div className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 h-24">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                
                <div className="relative text-center h-full flex flex-col justify-center">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Wallet size={18} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white font-montserrat">Rembourser</span>
                </div>
              </div>
            </motion.div>

            {/* Historique */}
            <motion.div 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="group cursor-pointer"
              onClick={() => navigate('/loan-history')}
            >
              <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 h-24">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                
                <div className="relative text-center h-full flex flex-col justify-center">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-2">
                    <History size={18} className="text-white" />
                </div>
                  <span className="text-sm font-semibold text-white font-montserrat">Historique</span>
                </div>
                </div>
            </motion.div>
          </div>
        </motion.div>

                {/* Section Nos Services - Design Moderne */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="text-center">
            <h3 className="text-xl font-bold text-secondary-900 font-montserrat mb-2">
              Nos services
            </h3>
            <p className="text-sm text-neutral-600 font-montserrat">
              Découvrez nos solutions spécialisées
            </p>
      </div>

          <div className="space-y-4">
            {/* AB Épargne */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group cursor-pointer"
              onClick={() => navigate('/ab-epargne')}
            >
              <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                {/* Effet de brillance */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <BookOpen size={28} className="text-white" />
                  </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">★</span>
              </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white font-montserrat">AB Épargne</h4>
                      <p className="text-blue-100 text-sm font-montserrat">Épargnez intelligemment</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">💎</div>
                    <div className="text-xs text-blue-200">Premium</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* AB Logement */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group cursor-pointer"
              onClick={() => navigate('/ab-logement')}
            >
              <div className="relative overflow-hidden bg-gradient-to-r from-purple-500 via-purple-600 to-violet-600 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                {/* Effet de brillance */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <Target size={28} className="text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">🏠</span>
                      </div>
                      </div>
                      <div>
                      <h4 className="text-lg font-bold text-white font-montserrat">AB Logement</h4>
                      <p className="text-purple-100 text-sm font-montserrat">Votre maison de rêve</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">🏡</div>
                    <div className="text-xs text-purple-200">Nouveau</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* AB Nutrition */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group cursor-pointer"
              onClick={() => navigate('/ab-nutrition')}
            >
              <div className="relative overflow-hidden bg-gradient-to-r from-pink-500 via-rose-600 to-red-600 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                {/* Effet de brillance */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                          <Heart size={28} className="text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">❤️</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white font-montserrat">AB Nutrition</h4>
                        <p className="text-pink-100 text-sm font-montserrat">Santé & bien-être</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">🥗</div>
                      <div className="text-xs text-pink-200">Bientôt</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>


          </motion.div>
      </div>
    </div>
  );
};

export default ClientDashboard;