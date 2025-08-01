import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import NotificationBell from '../UI/NotificationBell';
import { 
  Search, 
  Filter, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  BarChart3,
  DollarSign,
  Eye,
  FileText,
  BookOpen,
  Activity,
  Percent,
  Award,
  Gift,
  Rocket,
  Shield
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';

const LoanHistory = () => {
  const { notifications, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    totalLoans: 0,
    totalBorrowed: 0,
    totalRepaid: 0,
    activeLoans: 0,
    completedLoans: 0,
    pendingLoans: 0,
    rejectedLoans: 0
  });

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
      const mockLoans = [
        {
          id: 1,
          amount: 75000,
          status: 'active',
          requestDate: '2025-07-01',
          dueDate: '2025-08-01',
          totalAmount: 82500,
          paidAmount: 0,
          purpose: 'Achat d\'ordinateur portable',
          category: 'education'
        },
        {
          id: 2,
          amount: 50000,
          status: 'completed',
          requestDate: '2025-06-01',
          dueDate: '2025-06-30',
          totalAmount: 55000,
          paidAmount: 55000,
          purpose: 'Frais de scolarité',
          category: 'education'
        },
        {
          id: 3,
          amount: 100000,
          status: 'pending',
          requestDate: '2025-08-15',
          dueDate: null,
          totalAmount: null,
          paidAmount: 0,
          purpose: 'Démarrage d\'activité commerciale',
          category: 'business'
        },
        {
          id: 4,
          amount: 150000,
          status: 'rejected',
          requestDate: '2025-07-20',
          dueDate: null,
          totalAmount: null,
          paidAmount: 0,
          purpose: 'Achat de véhicule',
          category: 'transport'
        },
        {
          id: 5,
          amount: 80000,
          status: 'completed',
          requestDate: '2025-05-01',
          dueDate: '2025-06-30',
          totalAmount: 88000,
          paidAmount: 88000,
          purpose: 'Soins médicaux',
          category: 'health'
        }
      ];
      
      setLoans(mockLoans);
      
      // Calculer les statistiques
      const totalBorrowed = mockLoans.reduce((sum, loan) => sum + loan.amount, 0);
      const totalRepaid = mockLoans.reduce((sum, loan) => sum + (loan.paidAmount || 0), 0);
      const activeLoans = mockLoans.filter(loan => loan.status === 'active').length;
      const completedLoans = mockLoans.filter(loan => loan.status === 'completed').length;
      const pendingLoans = mockLoans.filter(loan => loan.status === 'pending').length;
      const rejectedLoans = mockLoans.filter(loan => loan.status === 'rejected').length;
      
      setStats({
        totalLoans: mockLoans.length,
        totalBorrowed,
        totalRepaid,
        activeLoans,
        completedLoans,
        pendingLoans,
        rejectedLoans
      });
      
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'completed': return 'Remboursé';
      case 'pending': return 'En attente';
      case 'rejected': return 'Rejeté';
      default: return 'Inconnu';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'education': return <BookOpen size={16} />;
      case 'business': return <TrendingUp size={16} />;
      case 'health': return <AlertCircle size={16} />;
      case 'transport': return <TrendingDown size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'education': return 'text-blue-600 bg-blue-100';
      case 'business': return 'text-green-600 bg-green-100';
      case 'health': return 'text-pink-600 bg-pink-100';
      case 'transport': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryText = (category) => {
    switch (category) {
      case 'education': return 'Éducation';
      case 'business': return 'Entreprise';
      case 'health': return 'Santé';
      case 'transport': return 'Transport';
      default: return 'Autre';
    }
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.id.toString().includes(searchTerm) || 
                         formatCurrency(loan.amount).includes(searchTerm) ||
                         (loan.purpose && loan.purpose.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportHistory = () => {
    // Simulation d'export
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Montant,Statut,Date de demande,Échéance,Montant total,Statut remboursement\n" +
      filteredLoans.map(loan => 
        `${loan.id},${loan.amount},${getStatusText(loan.status)},${formatDate(loan.requestDate)},${loan.dueDate ? formatDate(loan.dueDate) : 'N/A'},${loan.totalAmount || 'N/A'},${loan.paidAmount >= (loan.totalAmount || 0) ? 'Remboursé' : 'En cours'}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "historique_prets.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50">
      <style>{gradientAnimation}</style>
      
      {/* Section Hero - En-tête principal */}
      <div className="relative overflow-hidden">
        {/* Background avec gradient animé */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 opacity-15 animate-gradient"></div>
        
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
            className="absolute top-0 left-0 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl"
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
            className="absolute top-0 right-0 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl"
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
            className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl"
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
            className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-300 rounded-full"
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
            className="absolute top-3/4 right-1/3 w-3 h-3 bg-purple-300 rounded-full"
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
            className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-indigo-300 rounded-full"
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
            className="absolute top-1/3 right-1/4 w-2 h-2 bg-green-300 rounded-full"
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
            className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-pink-300 rounded-full"
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
            className="absolute top-2/3 left-1/3 w-1 h-1 bg-yellow-300 rounded-full"
          />
        </div>

        {/* Contenu Header */}
        <div className="relative px-4 lg:px-8 py-8 lg:py-12 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            {/* Section Hero - En-tête principal */}
            <div className="text-center mb-8 lg:mb-12">
              {/* Badge animé */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-6 shadow-lg relative overflow-hidden"
              >
                {/* Effet de brillance sur le badge */}
                <motion.div
                  animate={{ 
                    x: ['-100%', '100%']
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: 1
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="w-2 h-2 bg-purple-400 rounded-full"
                />
                <motion.span 
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="text-sm font-medium text-purple-700 font-montserrat bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-[length:200%_100%] bg-clip-text text-transparent"
                >
                  📊 Historique des Prêts
                </motion.span>
              </motion.div>

              {/* Titre principal */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl lg:text-6xl font-bold text-secondary-900 font-montserrat mb-4"
              >
                Historique des{' '}
                <motion.span 
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-[length:200%_100%] bg-clip-text text-transparent"
                >
                  Prêts
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
                  📈
                </motion.span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg lg:text-xl text-neutral-600 font-montserrat max-w-3xl mx-auto leading-relaxed"
              >
                Consultez l'historique complet de vos prêts et paiements
              </motion.p>

              {/* Sous-titre avec icônes animées */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex items-center justify-center space-x-6 mt-6"
              >
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="flex items-center space-x-2 text-sm text-neutral-500"
                >
                  <FileText size={16} className="text-green-500" />
                  <span>Suivi complet</span>
                </motion.div>
                
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, -5, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="flex items-center space-x-2 text-sm text-neutral-500"
                >
                  <Shield size={16} className="text-blue-500" />
                  <span>Données sécurisées</span>
                </motion.div>
                
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 2
                  }}
                  className="flex items-center space-x-2 text-sm text-neutral-500"
                >
                  <Activity size={16} className="text-purple-500" />
                  <span>Analyses détaillées</span>
                </motion.div>
              </motion.div>
            </div>

            {/* Statistiques améliorées */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              {/* Carte Total prêts */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-soft relative overflow-hidden"
              >
                {/* Effet de brillance */}
                <motion.div
                  animate={{ 
                    x: ['-100%', '100%']
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: 0.5
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/20 to-transparent"
                />
                <div className="text-center">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="flex items-center justify-center mb-2"
                  >
                    <BarChart3 size={20} className="text-primary-600" />
                  </motion.div>
                  <motion.p 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-lg sm:text-xl font-bold text-secondary-900"
                  >
                    {stats.totalLoans}
                  </motion.p>
                  <p className="text-xs sm:text-sm text-secondary-600">Total prêts</p>
                </div>
              </motion.div>

              {/* Carte Total emprunté */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-soft relative overflow-hidden"
              >
                {/* Effet de brillance */}
                <motion.div
                  animate={{ 
                    x: ['-100%', '100%']
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: 1
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-green-200/20 to-transparent"
                />
                <div className="text-center">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, -5, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                    className="flex items-center justify-center mb-2"
                  >
                    <TrendingUp size={20} className="text-green-600" />
                  </motion.div>
                  <motion.p 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-lg sm:text-xl font-bold text-secondary-900 break-words leading-tight"
                  >
                    {formatCurrency(stats.totalBorrowed)}
                  </motion.p>
                  <p className="text-xs sm:text-sm text-secondary-600">Total emprunté</p>
                </div>
              </motion.div>

              {/* Carte Total remboursé */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-soft relative overflow-hidden"
              >
                {/* Effet de brillance */}
                <motion.div
                  animate={{ 
                    x: ['-100%', '100%']
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: 1.5
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/20 to-transparent"
                />
                <div className="text-center">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 1
                    }}
                    className="flex items-center justify-center mb-2"
                  >
                    <CheckCircle size={20} className="text-blue-600" />
                  </motion.div>
                  <motion.p 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-lg sm:text-xl font-bold text-secondary-900 break-words leading-tight"
                  >
                    {formatCurrency(stats.totalRepaid)}
                  </motion.p>
                  <p className="text-xs sm:text-sm text-secondary-600">Total remboursé</p>
                </div>
              </motion.div>

              {/* Carte Prêts actifs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-soft relative overflow-hidden"
              >
                {/* Effet de brillance */}
                <motion.div
                  animate={{ 
                    x: ['-100%', '100%']
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: 2
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-200/20 to-transparent"
                />
                <div className="text-center">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, -5, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 1.5
                    }}
                    className="flex items-center justify-center mb-2"
                  >
                    <Clock size={20} className="text-orange-600" />
                  </motion.div>
                  <motion.p 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.9 }}
                    className="text-lg sm:text-xl font-bold text-secondary-900"
                  >
                    {stats.activeLoans}
                  </motion.p>
                  <p className="text-xs sm:text-sm text-secondary-600">Prêts actifs</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Contenu principal centré */}
      <div className="max-w-6xl mx-auto px-4 pb-8">

        {/* Filtres modernes */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-white/90 backdrop-blur-sm border-white/20">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par ID, montant ou objet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter size={20} className="text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="completed">Remboursés</option>
                  <option value="pending">En attente</option>
                  <option value="rejected">Rejetés</option>
                </select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Liste des prêts modernisée */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm border-white/20">
            {filteredLoans.length > 0 ? (
              <div className="space-y-6">
                <AnimatePresence>
                  {filteredLoans.map((loan, index) => (
                    <motion.div 
                      key={loan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 bg-white/60 backdrop-blur-sm"
                    >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="flex-1">
                                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 font-montserrat">
                          Prêt #{loan.id}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                          {getStatusText(loan.status)}
                        </span>
                        {loan.category && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getCategoryColor(loan.category)}`}>
                            {getCategoryIcon(loan.category)}
                            <span className="hidden sm:inline">{getCategoryText(loan.category)}</span>
                          </span>
                        )}
                      </div>

                      {loan.purpose && (
                        <div className="mb-4 p-3 bg-gray-50/80 rounded-xl">
                          <span className="text-gray-600 text-xs uppercase tracking-wide">Objet du prêt</span>
                          <p className="font-medium text-gray-900">{loan.purpose}</p>
                        </div>
                      )}
                      
                                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 text-sm">
                          <div className="p-3 bg-accent-50/50 rounded-xl">
                            <span className="text-gray-600 text-xs uppercase tracking-wide">Montant demandé</span>
                            <p className="font-semibold text-base sm:text-lg text-gray-900 break-words leading-tight">{formatCurrency(loan.amount)}</p>
                          </div>
                          <div className="p-3 bg-accent-50/50 rounded-xl">
                            <span className="text-gray-600 text-xs uppercase tracking-wide">Date de demande</span>
                            <p className="font-semibold text-base sm:text-lg text-gray-900">{formatDate(loan.requestDate)}</p>
                          </div>
                          {loan.dueDate && (
                            <div className="p-3 bg-accent-50/50 rounded-xl">
                              <span className="text-gray-600 text-xs uppercase tracking-wide">Échéance</span>
                              <p className="font-semibold text-base sm:text-lg text-gray-900">{formatDate(loan.dueDate)}</p>
                            </div>
                          )}
                        </div>

                      {loan.status === 'active' && (
                        <div className="mt-6 p-6 bg-blue-50/80 rounded-2xl border border-blue-200/50">
                          <h4 className="font-semibold text-blue-900 mb-4 flex items-center space-x-2">
                            <DollarSign size={18} className="sm:w-5 sm:h-5" />
                            <span className="text-sm sm:text-base">Détails du prêt</span>
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 text-sm">
                            <div>
                              <span className="text-blue-700 text-xs uppercase tracking-wide">Montant total</span>
                              <p className="font-semibold text-base sm:text-lg text-blue-900 break-words leading-tight">{formatCurrency(loan.totalAmount)}</p>
                            </div>
                            <div>
                              <span className="text-blue-700 text-xs uppercase tracking-wide">Montant remboursé</span>
                              <p className="font-semibold text-base sm:text-lg text-blue-900 break-words leading-tight">{formatCurrency(loan.paidAmount)}</p>
                            </div>
                            <div>
                              <span className="text-blue-700 text-xs uppercase tracking-wide">Statut</span>
                              <p className="font-semibold text-base sm:text-lg text-blue-900 break-words leading-tight">
                                {loan.paidAmount >= loan.totalAmount ? 'Remboursé' : 'En cours'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {loan.status === 'completed' && (
                        <div className="mt-6 p-6 bg-green-50/80 rounded-2xl border border-green-200/50">
                                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="text-green-800 font-semibold text-base sm:text-lg flex items-center space-x-2">
                            <CheckCircle size={18} className="sm:w-5 sm:h-5" />
                            <span>Prêt entièrement remboursé</span>
                          </span>
                          <span className="text-green-600 font-bold text-base sm:text-lg break-words leading-tight">{formatCurrency(loan.paidAmount)}</span>
                        </div>
                        </div>
                      )}

                      {loan.status === 'pending' && (
                        <div className="mt-6 p-6 bg-yellow-50/80 rounded-2xl border border-yellow-200/50">
                                                  <div className="flex items-center">
                          <span className="text-yellow-800 font-semibold text-base sm:text-lg flex items-center space-x-2">
                            <Clock size={18} className="sm:w-5 sm:h-5" />
                            <span>En attente d'approbation</span>
                          </span>
                        </div>
                        </div>
                      )}

                      {loan.status === 'rejected' && (
                        <div className="mt-6 p-6 bg-red-50/80 rounded-2xl border border-red-200/50">
                                                  <div className="flex items-center">
                          <span className="text-red-800 font-semibold text-base sm:text-lg flex items-center space-x-2">
                            <XCircle size={18} className="sm:w-5 sm:h-5" />
                            <span>Demande rejetée</span>
                          </span>
                        </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/loan-details/${loan.id}`)}
                        className="px-6 py-3 rounded-2xl font-medium flex items-center space-x-2"
                      >
                        <Eye size={16} />
                        <span>Voir détails</span>
                      </Button>
                      
                      {loan.status === 'active' && (
                        <Button
                          size="sm"
                          onClick={() => navigate('/repayment', { state: { loanId: loan.id } })}
                          className="px-6 py-3 rounded-2xl font-medium bg-primary-500 hover:bg-primary-600 flex items-center space-x-2"
                        >
                          <DollarSign size={16} />
                          <span>Rembourser</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
                </AnimatePresence>
              </div>
                      ) : (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-6">
                  <Search size={80} className="mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 font-montserrat">Aucun prêt trouvé</h3>
                <p className="text-gray-500 mb-6 text-lg">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Aucun prêt ne correspond à vos critères de recherche'
                    : 'Vous n\'avez pas encore de prêts'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Button 
                    onClick={() => navigate('/loan-request')}
                    className="px-8 py-4 text-lg rounded-2xl bg-primary-500 hover:bg-primary-600"
                  >
                    Faire une demande
                  </Button>
                )}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Bouton d'export flottant */}
        <div className="fixed bottom-24 right-6 z-10">
          <Button
            variant="outline"
            onClick={exportHistory}
            className="flex items-center space-x-2 px-4 py-3 rounded-full bg-white/90 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl"
          >
            <Download size={20} />
            <span className="hidden sm:inline">Exporter</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoanHistory;

