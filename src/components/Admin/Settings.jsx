import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { useSupabaseNotifications } from '../../utils/useSupabaseNotifications';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { 
  ArrowLeft, 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Database,
  Palette,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Lock,
  Mail,
  Phone,
  Building,
  MapPin,
  FileText,
  Download,
  Upload,
  Trash2,
  Edit,
  Plus,
  Minus,
  Zap,
  Star,
  Crown,
  Trophy,
  Medal,
  Gem,
  Sparkles,
  Cog,
  Key,
  Smartphone,
  Globe as GlobeIcon,
  Moon,
  Sun,
  Activity,
  BarChart3,
  DollarSign,
  Percent,
  Image,
  ArrowRight,
  MoreHorizontal,
  Share2,
  Clock
} from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();

  const { showSuccess, showError } = useNotifications();
  const { isConnected } = useSupabaseNotifications();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [hoveredTab, setHoveredTab] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  // Styles CSS pour les animations
  const gradientAnimation = `
    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .animate-gradient {
      background-size: 200% 200%;
      animation: gradient 15s ease infinite;
    }
    
    /* Styles pour le thème sombre */
    .dark-mode {
      background-color: #1a1a1a !important;
      color: #ffffff !important;
    }
    
    .dark-mode .bg-white {
      background-color: #2d2d2d !important;
    }
    
    .dark-mode .text-secondary-900 {
      color: #ffffff !important;
    }
    
    .dark-mode .text-neutral-600 {
      color: #a0a0a0 !important;
    }
    
    .dark-mode .border-white\/50 {
      border-color: rgba(255, 255, 255, 0.1) !important;
    }
    
    /* Animations pour les interactions */
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
      50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
    }
    
    .pulse-glow {
      animation: pulse-glow 2s ease-in-out infinite;
    }
    
    @keyframes slide-in-right {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    .slide-in-right {
      animation: slide-in-right 0.3s ease-out;
    }
    
    @keyframes bounce-in {
      0% { transform: scale(0.3); opacity: 0; }
      50% { transform: scale(1.05); }
      70% { transform: scale(0.9); }
      100% { transform: scale(1); opacity: 1; }
    }
    
    .bounce-in {
      animation: bounce-in 0.6s ease-out;
    }
  `;

  // États pour les différents paramètres
  const [profileSettings, setProfileSettings] = useState({
    firstName: 'Abel',
    lastName: 'Viakinnou',
    email: 'admin@abpret.com',
    phone: '+228 90 00 00 00',
    position: 'Administrateur Principal',
    department: 'Direction Générale'
  });

  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorAuth: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    newUserAlerts: true,
    loanRequestAlerts: true,
    repaymentAlerts: true,
    systemAlerts: true
  });

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    debugMode: false,
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: 365,
    maxFileSize: 10,
    darkMode: false,
    autoSave: true,
    keyboardShortcuts: true
  });

  const [companySettings, setCompanySettings] = useState({
    companyName: 'AB PRET',
    companyEmail: 'contact@abpret.com',
    companyPhone: '+228 90 00 00 00',
    companyAddress: 'Lomé, Togo',
    website: 'https://abpret.com',
    description: 'Institution de microfinance dédiée aux étudiants',
    logo: null
  });

  // Statistiques du tableau de bord
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 1247,
    activeLoans: 89,
    totalAmount: 12500000,
    pendingRequests: 23,
    monthlyGrowth: 12.5,
    systemHealth: 98.7,
    lastBackup: '2025-01-15 14:30',
    uptime: '99.9%'
  });

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      // Simuler la mise à jour avec progression
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        // Ici on pourrait mettre à jour une barre de progression
      }
      setLastSaved(new Date());
      setUnsavedChanges(false);
      showSuccess('Profil mis à jour avec succès !');
    } catch (error) {
      showError('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityUpdate = async () => {
    try {
      setLoading(true);
      
      if (securitySettings.newPassword !== securitySettings.confirmPassword) {
        showError('Les mots de passe ne correspondent pas');
        return;
      }

      if (securitySettings.newPassword.length < 6) {
        showError('Le nouveau mot de passe doit contenir au moins 6 caractères');
        return;
      }

      // Simuler la mise à jour
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Réinitialiser les champs de mot de passe
      setSecuritySettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      showSuccess('Paramètres de sécurité mis à jour avec succès !');
    } catch (error) {
      showError('Erreur lors de la mise à jour des paramètres de sécurité');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      setLoading(true);
      // Simuler la mise à jour
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('Paramètres de notification mis à jour avec succès !');
    } catch (error) {
      showError('Erreur lors de la mise à jour des notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleSystemUpdate = async () => {
    try {
      setLoading(true);
      // Simuler la mise à jour
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('Paramètres système mis à jour avec succès !');
    } catch (error) {
      showError('Erreur lors de la mise à jour des paramètres système');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyUpdate = async () => {
    try {
      setLoading(true);
      // Simuler la mise à jour
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('Informations de l\'entreprise mises à jour avec succès !');
    } catch (error) {
      showError('Erreur lors de la mise à jour des informations');
    } finally {
      setLoading(false);
    }
  };

  const handleExportSettings = () => {
    try {
      const settings = {
        profile: profileSettings,
        security: securitySettings,
        notifications: notificationSettings,
        system: systemSettings,
        company: companySettings
      };

      const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ab_pret_settings_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      showSuccess('Paramètres exportés avec succès !');
    } catch (error) {
      showError('Erreur lors de l\'export des paramètres');
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ? Cette action ne peut pas être annulée.')) {
      // Réinitialiser tous les paramètres
      setProfileSettings({
        firstName: 'Abel',
        lastName: 'Viakinnou',
        email: 'admin@abpret.com',
        phone: '+228 90 00 00 00',
        position: 'Administrateur Principal',
        department: 'Direction Générale'
      });
      
      setSecuritySettings({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorAuth: false,
        sessionTimeout: 30,
        maxLoginAttempts: 5
      });
      
      setNotificationSettings({
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        newUserAlerts: true,
        loanRequestAlerts: true,
        repaymentAlerts: true,
        systemAlerts: true
      });
      
      setSystemSettings({
        maintenanceMode: false,
        debugMode: false,
        autoBackup: true,
        backupFrequency: 'daily',
        dataRetention: 365,
        maxFileSize: 10,
        darkMode: false,
        autoSave: true,
        keyboardShortcuts: true
      });
      
      setCompanySettings({
        companyName: 'AB PRET',
        companyEmail: 'contact@abpret.com',
        companyPhone: '+228 90 00 00 00',
        companyAddress: 'Lomé, Togo',
        website: 'https://abpret.com',
        description: 'Institution de microfinance dédiée aux étudiants',
        logo: null
      });
      
      showSuccess('Paramètres réinitialisés avec succès !');
    }
  };

  // Gestion du thème sombre
  const toggleDarkMode = () => {
    const newDarkMode = !systemSettings.darkMode;
    setSystemSettings(prev => ({ ...prev, darkMode: newDarkMode }));
    
    if (newDarkMode) {
      document.body.classList.add('dark-mode');
      showSuccess('Thème sombre activé !');
    } else {
      document.body.classList.remove('dark-mode');
      showSuccess('Thème clair activé !');
    }
  };

  // Gestion des raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!systemSettings.keyboardShortcuts) return;

      // Ctrl/Cmd + S pour sauvegarder
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (activeTab === 'profile') handleProfileUpdate();
        else if (activeTab === 'security') handleSecurityUpdate();
        else if (activeTab === 'notifications') handleNotificationUpdate();
        else if (activeTab === 'system') handleSystemUpdate();
        else if (activeTab === 'company') handleCompanyUpdate();
        else if (activeTab === 'theme') handleSystemUpdate();
        else if (activeTab === 'shortcuts') handleSystemUpdate();
      }

      // Ctrl/Cmd + D pour basculer le thème sombre
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        toggleDarkMode();
      }

      // Ctrl/Cmd + E pour exporter
      if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        handleExportSettings();
      }

      // Échap pour fermer les modales
      if (event.key === 'Escape') {
        setShowShortcutsModal(false);
      }

      // Numéros pour changer d'onglet
      if (event.key >= '1' && event.key <= '7') {
        const tabIndex = parseInt(event.key) - 1;
        const tabIds = ['profile', 'security', 'notifications', 'system', 'company', 'theme', 'shortcuts'];
        if (tabIds[tabIndex]) {
          setActiveTab(tabIds[tabIndex]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [systemSettings.keyboardShortcuts, activeTab, handleProfileUpdate, handleSecurityUpdate, handleNotificationUpdate, handleSystemUpdate, handleCompanyUpdate, handleExportSettings, toggleDarkMode]);

  // Détecter les changements non sauvegardés
  useEffect(() => {
    // Vérifier si des changements ont été faits
    const hasChanges = () => {
      // Pour l'exemple, on considère qu'il y a toujours des changements
      // En production, on comparerait avec les valeurs initiales
      return true;
    };
    
    if (hasChanges()) {
      setUnsavedChanges(true);
    }
  }, [profileSettings, securitySettings, notificationSettings, systemSettings, companySettings]);

  // Appliquer le thème sombre au chargement
  useEffect(() => {
    if (systemSettings.darkMode) {
      document.body.classList.add('dark-mode');
    }
  }, [systemSettings.darkMode]);

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'Système', icon: SettingsIcon },
    { id: 'company', label: 'Entreprise', icon: Building },
    { id: 'theme', label: 'Thème', icon: Palette },
    { id: 'shortcuts', label: 'Raccourcis', icon: Zap }
  ];

  return (
    <div className="bg-accent-50">
      <style>{gradientAnimation}</style>
      {/* Header avec design moderne */}
      <div className="relative overflow-hidden">
        {/* Background avec gradient animé */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 opacity-10 animate-gradient"></div>
        
        {/* Pattern décoratif amélioré */}
        <div className="absolute inset-0 opacity-5">
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
        </div>

        {/* Contenu Header */}
        <div className="relative px-4 lg:px-8 py-8 lg:py-12">
          <div className="max-w-7xl mx-auto">
            {/* En-tête avec salutation */}
            <div className="text-center mb-8 lg:mb-12">


              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl lg:text-6xl font-bold text-secondary-900 font-montserrat mb-4"
              >
                Paramètres{' '}
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
                  Intelligents
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
                >
                  ⚙️
                </motion.span>
              </motion.h1>


            </div>

            {/* Indicateur de connexion temps réel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex justify-center mb-8"
            >
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${
                isConnected 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                <motion.div 
                  animate={{ 
                    scale: isConnected ? [1, 1.2, 1] : 1,
                    opacity: isConnected ? [0.5, 1, 0.5] : 0.5
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: isConnected ? Infinity : 0 
                  }}
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span>
                  {isConnected ? 'Temps réel actif' : 'Hors ligne'}
                </span>
              </div>
            </motion.div>

            {/* Indicateur de statut de sauvegarde */}
            {lastSaved && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-center mb-4"
              >
                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs border border-blue-200">
                  <CheckCircle size={12} />
                  <span>Dernière sauvegarde: {lastSaved.toLocaleTimeString()}</span>
                </div>
              </motion.div>
            )}

            {/* Indicateur de changements non sauvegardés */}
            {unsavedChanges && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-center mb-4"
              >
                <div className="flex items-center space-x-2 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs border border-orange-200 pulse-glow">
                  <AlertTriangle size={12} />
                  <span>Changements non sauvegardés</span>
                </div>
              </motion.div>
            )}

            {/* Tableau de bord des statistiques */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Utilisateurs totaux */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -5,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
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
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-blue-100 text-sm font-medium"
                      >
                        👥 Utilisateurs Totaux
                      </motion.p>
                      <motion.p 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                        className="text-3xl font-bold"
                      >
                        {dashboardStats.totalUsers.toLocaleString()}
                      </motion.p>
                      <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="text-blue-200 text-xs mt-1"
                      >
                        +{dashboardStats.monthlyGrowth}% ce mois
                      </motion.p>
                    </div>
                    <motion.div 
                      initial={{ opacity: 0, rotate: -180 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      className="p-3 bg-white/20 rounded-xl"
                    >
                      <User size={24} />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Prêts actifs */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -5,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
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
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-green-100 text-sm font-medium"
                      >
                        💰 Prêts Actifs
                      </motion.p>
                      <motion.p 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                        className="text-3xl font-bold"
                      >
                        {dashboardStats.activeLoans}
                      </motion.p>
                      <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="text-green-200 text-xs mt-1"
                      >
                        {(dashboardStats.totalAmount / 1000000).toFixed(1)}M FCFA
                      </motion.p>
                    </div>
                    <motion.div 
                      initial={{ opacity: 0, rotate: -180 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      transition={{ delay: 0.9, type: "spring", stiffness: 100 }}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      className="p-3 bg-white/20 rounded-xl"
                    >
                      <DollarSign size={24} />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Demandes en attente */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -5,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
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
                      delay: 3
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-orange-100 text-sm font-medium"
                      >
                        ⏳ Demandes en Attente
                      </motion.p>
                      <motion.p 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                        className="text-3xl font-bold"
                      >
                        {dashboardStats.pendingRequests}
                      </motion.p>
                      <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        className="text-orange-200 text-xs mt-1"
                      >
                        Nécessitent attention
                      </motion.p>
                    </div>
                    <motion.div 
                      initial={{ opacity: 0, rotate: -180 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      transition={{ delay: 1.0, type: "spring", stiffness: 100 }}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      className="p-3 bg-white/20 rounded-xl"
                    >
                      <Clock size={24} />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Santé du système */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -5,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
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
                      delay: 4
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="text-purple-100 text-sm font-medium"
                      >
                        🏥 Santé du Système
                      </motion.p>
                      <motion.p 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                        className="text-3xl font-bold"
                      >
                        {dashboardStats.systemHealth}%
                      </motion.p>
                      <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0 }}
                        className="text-purple-200 text-xs mt-1"
                      >
                        Uptime: {dashboardStats.uptime}
                      </motion.p>
                    </div>
                    <motion.div 
                      initial={{ opacity: 0, rotate: -180 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      transition={{ delay: 1.1, type: "spring", stiffness: 100 }}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      className="p-3 bg-white/20 rounded-xl"
                    >
                      <Activity size={24} />
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* Informations système supplémentaires */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-soft">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Database size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary-900">Dernière sauvegarde</p>
                      <p className="text-xs text-neutral-600">{dashboardStats.lastBackup}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-soft">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary-900">Statut système</p>
                      <p className="text-xs text-neutral-600">Tous les services opérationnels</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-soft">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <BarChart3 size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary-900">Performance</p>
                      <p className="text-xs text-neutral-600">Optimale - 2.3s de temps de réponse</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Navigation des onglets avec design moderne */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-soft overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Cog size={20} className="text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-secondary-900 font-montserrat">
                      Sections
                    </h3>
                  </div>
                  <nav className="space-y-3">
                    {tabs.map((tab, index) => {
                      const Icon = tab.icon;
                      return (
                        <motion.button
                          key={tab.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          whileHover={{ 
                            scale: 1.02,
                            x: 5
                          }}
                          whileTap={{ scale: 0.98 }}
                          onMouseEnter={() => setHoveredTab(tab.id)}
                          onMouseLeave={() => setHoveredTab(null)}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl transition-all duration-300 font-montserrat relative overflow-hidden ${
                            activeTab === tab.id
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                              : 'text-neutral-600 hover:text-secondary-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md'
                          }`}
                        >
                          {/* Effet de brillance pour l'onglet actif */}
                          {activeTab === tab.id && (
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
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            />
                          )}
                          
                          <motion.div
                            animate={{ 
                              rotate: activeTab === tab.id ? [0, 360] : (hoveredTab === tab.id ? [0, 10, -10, 0] : 0),
                              scale: hoveredTab === tab.id ? 1.1 : 1
                            }}
                            transition={{ 
                              duration: 0.6, 
                              ease: "easeInOut"
                            }}
                          >
                            <Icon size={20} />
                          </motion.div>
                          <span className="font-medium relative z-10">{tab.label}</span>
                          
                          {/* Indicateur de raccourci clavier */}
                          {systemSettings.keyboardShortcuts && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ 
                                opacity: hoveredTab === tab.id ? 1 : 0,
                                scale: hoveredTab === tab.id ? 1 : 0
                              }}
                              className="ml-auto text-xs bg-white/20 px-2 py-1 rounded"
                            >
                              {index + 1}
                            </motion.span>
                          )}
                          {activeTab === tab.id && (
                            <motion.div
                              layoutId="activeTab"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="w-2 h-2 bg-white rounded-full ml-auto relative z-10"
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </nav>
                </div>
              </motion.div>
            </div>

          {/* Contenu des onglets */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-soft overflow-hidden"
            >
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {/* Onglet Profil */}
                  {activeTab === 'profile' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                            <User size={24} className="text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-secondary-900 font-montserrat">
                              👤 Informations du Profil
                            </h2>
                            <p className="text-sm text-neutral-600 font-montserrat">
                              Gérez vos informations personnelles
                            </p>
                          </div>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={handleProfileUpdate}
                            disabled={loading}
                            className={`flex items-center space-x-2 relative overflow-hidden ${
                              unsavedChanges 
                                ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700' 
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                            } text-white`}
                          >
                            {loading && (
                              <motion.div
                                animate={{ 
                                  x: ['-100%', '100%']
                                }}
                                transition={{ 
                                  duration: 1.5, 
                                  repeat: Infinity, 
                                  ease: "linear"
                                }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                              />
                            )}
                            <motion.div
                              animate={{ 
                                rotate: loading ? 360 : 0
                              }}
                              transition={{ 
                                duration: 1, 
                                repeat: loading ? Infinity : 0, 
                                ease: "linear"
                              }}
                            >
                              <Save size={16} />
                            </motion.div>
                            <span className="relative z-10">
                              {loading ? 'Sauvegarde...' : (unsavedChanges ? 'Sauvegarder*' : 'Sauvegarder')}
                            </span>
                          </Button>
                        </motion.div>
                      </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div 
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100 hover:shadow-lg transition-all duration-300"
                      >
                        <Input
                          label="Prénom"
                          value={profileSettings.firstName}
                          onChange={(e) => {
                            setProfileSettings(prev => ({ ...prev, firstName: e.target.value }));
                            setUnsavedChanges(true);
                          }}
                          placeholder="Votre prénom"
                        />
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100 hover:shadow-lg transition-all duration-300"
                      >
                        <Input
                          label="Nom"
                          value={profileSettings.lastName}
                          onChange={(e) => {
                            setProfileSettings(prev => ({ ...prev, lastName: e.target.value }));
                            setUnsavedChanges(true);
                          }}
                          placeholder="Votre nom"
                        />
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-100 hover:shadow-lg transition-all duration-300"
                      >
                        <Input
                          label="Email"
                          type="email"
                          value={profileSettings.email}
                          onChange={(e) => {
                            setProfileSettings(prev => ({ ...prev, email: e.target.value }));
                            setUnsavedChanges(true);
                          }}
                          placeholder="votre@email.com"
                        />
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-100 hover:shadow-lg transition-all duration-300"
                      >
                        <Input
                          label="Téléphone"
                          value={profileSettings.phone}
                          onChange={(e) => {
                            setProfileSettings(prev => ({ ...prev, phone: e.target.value }));
                            setUnsavedChanges(true);
                          }}
                          placeholder="+228 90 00 00 00"
                        />
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 hover:shadow-lg transition-all duration-300"
                      >
                        <Input
                          label="Poste"
                          value={profileSettings.position}
                          onChange={(e) => {
                            setProfileSettings(prev => ({ ...prev, position: e.target.value }));
                            setUnsavedChanges(true);
                          }}
                          placeholder="Votre poste"
                        />
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-100 hover:shadow-lg transition-all duration-300"
                      >
                        <Input
                          label="Département"
                          value={profileSettings.department}
                          onChange={(e) => {
                            setProfileSettings(prev => ({ ...prev, department: e.target.value }));
                            setUnsavedChanges(true);
                          }}
                          placeholder="Votre département"
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* Onglet Sécurité */}
                {activeTab === 'security' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl">
                          <Shield size={24} className="text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-secondary-900 font-montserrat">
                            🔒 Paramètres de Sécurité
                          </h2>
                          <p className="text-sm text-neutral-600 font-montserrat">
                            Sécurisez votre compte et vos données
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={handleSecurityUpdate}
                        disabled={loading}
                        className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white flex items-center space-x-2"
                      >
                        <Save size={16} />
                        <span>Sauvegarder</span>
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl border border-red-100 relative">
                        <Input
                          label="Mot de passe actuel"
                          type={showPassword ? "text" : "password"}
                          value={securitySettings.currentPassword}
                          onChange={(e) => setSecuritySettings(prev => ({ ...prev, currentPassword: e.target.value }))}
                          placeholder="Votre mot de passe actuel"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-9 top-14 text-neutral-400 hover:text-neutral-600"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      
                      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-xl border border-orange-100 relative">
                        <Input
                          label="Nouveau mot de passe"
                          type={showConfirmPassword ? "text" : "password"}
                          value={securitySettings.newPassword}
                          onChange={(e) => setSecuritySettings(prev => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="Nouveau mot de passe"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-9 top-14 text-neutral-400 hover:text-neutral-600"
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      
                      <div className="bg-gradient-to-r from-yellow-50 to-red-50 p-6 rounded-xl border border-yellow-100">
                        <Input
                          label="Confirmer le nouveau mot de passe"
                          type="password"
                          value={securitySettings.confirmPassword}
                          onChange={(e) => setSecuritySettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirmer le nouveau mot de passe"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-full">
                            <Key size={20} className="text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-secondary-900 font-montserrat">🔐 Authentification à deux facteurs</h3>
                            <p className="text-sm text-neutral-600 font-montserrat">Sécurisez votre compte avec 2FA</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={securitySettings.twoFactorAuth}
                            onChange={(e) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-12 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-red-500 peer-checked:to-orange-600"></div>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                          <label className="block text-sm font-bold text-secondary-900 font-montserrat mb-3">
                            ⏱️ Timeout de session (minutes)
                          </label>
                          <select
                            value={securitySettings.sessionTimeout}
                            onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                            className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                          >
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={60}>1 heure</option>
                            <option value={120}>2 heures</option>
                          </select>
                        </div>
                        
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
                          <label className="block text-sm font-bold text-secondary-900 font-montserrat mb-3">
                            🚫 Tentatives de connexion max
                          </label>
                          <select
                            value={securitySettings.maxLoginAttempts}
                            onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                            className="w-full px-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                          >
                            <option value={3}>3 tentatives</option>
                            <option value={5}>5 tentatives</option>
                            <option value={10}>10 tentatives</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                  {/* Onglet Notifications */}
                  {activeTab === 'notifications' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-secondary-900 font-montserrat">
                        Paramètres de notification
                      </h2>
                      <Button
                        onClick={handleNotificationUpdate}
                        disabled={loading}
                        className="flex items-center space-x-2"
                      >
                        <Save size={16} />
                        <span>Sauvegarder</span>
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {Object.entries(notificationSettings).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-accent-50 rounded-xl">
                          <div>
                            <h3 className="font-medium text-secondary-900 font-montserrat">
                              {key === 'emailNotifications' && 'Notifications par email'}
                              {key === 'smsNotifications' && 'Notifications par SMS'}
                              {key === 'pushNotifications' && 'Notifications push'}
                              {key === 'newUserAlerts' && 'Alertes nouveaux utilisateurs'}
                              {key === 'loanRequestAlerts' && 'Alertes demandes de prêt'}
                              {key === 'repaymentAlerts' && 'Alertes remboursements'}
                              {key === 'systemAlerts' && 'Alertes système'}
                            </h3>
                            <p className="text-sm text-neutral-600 font-montserrat">
                              {key === 'emailNotifications' && 'Recevoir les notifications par email'}
                              {key === 'smsNotifications' && 'Recevoir les notifications par SMS'}
                              {key === 'pushNotifications' && 'Recevoir les notifications push'}
                              {key === 'newUserAlerts' && 'Être notifié des nouvelles inscriptions'}
                              {key === 'loanRequestAlerts' && 'Être notifié des nouvelles demandes de prêt'}
                              {key === 'repaymentAlerts' && 'Être notifié des remboursements'}
                              {key === 'systemAlerts' && 'Recevoir les alertes système importantes'}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                  {/* Onglet Système */}
                  {activeTab === 'system' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                          <SettingsIcon size={24} className="text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-secondary-900 font-montserrat">
                            ⚙️ Paramètres Système
                          </h2>
                          <p className="text-sm text-neutral-600 font-montserrat">
                            Configurez les paramètres système avancés
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={handleSystemUpdate}
                        disabled={loading}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white flex items-center space-x-2"
                      >
                        <Save size={16} />
                        <span>Sauvegarder</span>
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-accent-50 rounded-xl">
                        <div>
                          <h3 className="font-medium text-secondary-900 font-montserrat">Mode maintenance</h3>
                          <p className="text-sm text-neutral-600 font-montserrat">Restreindre l'accès pendant la maintenance</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={systemSettings.maintenanceMode}
                            onChange={(e) => setSystemSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-accent-50 rounded-xl">
                        <div>
                          <h3 className="font-medium text-secondary-900 font-montserrat">Mode debug</h3>
                          <p className="text-sm text-neutral-600 font-montserrat">Activer les logs de débogage</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={systemSettings.debugMode}
                            onChange={(e) => setSystemSettings(prev => ({ ...prev, debugMode: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-secondary-900 font-montserrat mb-2">
                            Fréquence de sauvegarde
                          </label>
                          <select
                            value={systemSettings.backupFrequency}
                            onChange={(e) => setSystemSettings(prev => ({ ...prev, backupFrequency: e.target.value }))}
                            className="w-full px-4 py-2 border border-accent-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value="daily">Quotidienne</option>
                            <option value="weekly">Hebdomadaire</option>
                            <option value="monthly">Mensuelle</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-secondary-900 font-montserrat mb-2">
                            Rétention des données (jours)
                          </label>
                          <select
                            value={systemSettings.dataRetention}
                            onChange={(e) => setSystemSettings(prev => ({ ...prev, dataRetention: parseInt(e.target.value) }))}
                            className="w-full px-4 py-2 border border-accent-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value={30}>30 jours</option>
                            <option value={90}>90 jours</option>
                            <option value={365}>1 an</option>
                            <option value={730}>2 ans</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-secondary-900 font-montserrat mb-2">
                            Taille max fichier (MB)
                          </label>
                          <select
                            value={systemSettings.maxFileSize}
                            onChange={(e) => setSystemSettings(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
                            className="w-full px-4 py-2 border border-accent-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value={5}>5 MB</option>
                            <option value={10}>10 MB</option>
                            <option value={25}>25 MB</option>
                            <option value={50}>50 MB</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                  {/* Onglet Entreprise */}
                  {activeTab === 'company' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                          <Building size={24} className="text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-secondary-900 font-montserrat">
                            🏢 Informations de l'Entreprise
                          </h2>
                          <p className="text-sm text-neutral-600 font-montserrat">
                            Gérez les informations de votre entreprise
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={handleCompanyUpdate}
                        disabled={loading}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white flex items-center space-x-2"
                      >
                        <Save size={16} />
                        <span>Sauvegarder</span>
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Nom de l'entreprise"
                        value={companySettings.companyName}
                        onChange={(e) => setCompanySettings(prev => ({ ...prev, companyName: e.target.value }))}
                        placeholder="AB PRET"
                      />
                      <Input
                        label="Email de contact"
                        type="email"
                        value={companySettings.companyEmail}
                        onChange={(e) => setCompanySettings(prev => ({ ...prev, companyEmail: e.target.value }))}
                        placeholder="contact@abpret.com"
                      />
                      <Input
                        label="Téléphone"
                        value={companySettings.companyPhone}
                        onChange={(e) => setCompanySettings(prev => ({ ...prev, companyPhone: e.target.value }))}
                        placeholder="+228 90 00 00 00"
                      />
                      <Input
                        label="Site web"
                        value={companySettings.website}
                        onChange={(e) => setCompanySettings(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://abpret.com"
                      />
                      <Input
                        label="Adresse"
                        value={companySettings.companyAddress}
                        onChange={(e) => setCompanySettings(prev => ({ ...prev, companyAddress: e.target.value }))}
                        placeholder="Lomé, Togo"
                        className="md:col-span-2"
                      />
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-secondary-900 font-montserrat mb-2">
                          Description
                        </label>
                        <textarea
                          value={companySettings.description}
                          onChange={(e) => setCompanySettings(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Description de l'entreprise..."
                          rows={4}
                          className="w-full px-4 py-2 border border-accent-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Onglet Thème */}
                {activeTab === 'theme' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                          <Palette size={24} className="text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-secondary-900 font-montserrat">
                            🎨 Personnalisation du Thème
                          </h2>
                          <p className="text-sm text-neutral-600 font-montserrat">
                            Personnalisez l'apparence de l'interface
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Thème sombre */}
                      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full">
                            <Moon size={20} className="text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-secondary-900 font-montserrat">🌙 Mode Sombre</h3>
                            <p className="text-sm text-neutral-600 font-montserrat">Activer le thème sombre pour réduire la fatigue oculaire</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={systemSettings.darkMode}
                            onChange={toggleDarkMode}
                            className="sr-only peer"
                          />
                          <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-600"></div>
                        </label>
                      </div>

                      {/* Auto-sauvegarde */}
                      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full">
                            <Save size={20} className="text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-secondary-900 font-montserrat">💾 Auto-sauvegarde</h3>
                            <p className="text-sm text-neutral-600 font-montserrat">Sauvegarder automatiquement les modifications</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={systemSettings.autoSave}
                            onChange={(e) => setSystemSettings(prev => ({ ...prev, autoSave: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-600"></div>
                        </label>
                      </div>

                      {/* Prévisualisation du thème */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="p-6 bg-white rounded-xl border border-gray-200 shadow-lg"
                        >
                          <h4 className="font-bold text-secondary-900 mb-4">☀️ Mode Clair</h4>
                          <div className="space-y-3">
                            <div className="h-3 bg-gray-200 rounded"></div>
                            <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </motion.div>
                        
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="p-6 bg-gray-800 rounded-xl border border-gray-700 shadow-lg"
                        >
                          <h4 className="font-bold text-white mb-4">🌙 Mode Sombre</h4>
                          <div className="space-y-3">
                            <div className="h-3 bg-gray-600 rounded"></div>
                            <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Onglet Raccourcis */}
                {activeTab === 'shortcuts' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl">
                          <Zap size={24} className="text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-secondary-900 font-montserrat">
                            ⌨️ Raccourcis Clavier
                          </h2>
                          <p className="text-sm text-neutral-600 font-montserrat">
                            Maîtrisez les raccourcis pour une navigation rapide
                          </p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowShortcutsModal(true)}
                        className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                      >
                        <Info size={16} />
                        <span>Aide</span>
                      </motion.button>
                    </div>

                    <div className="space-y-6">
                      {/* Activation des raccourcis */}
                      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full">
                            <Zap size={20} className="text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-secondary-900 font-montserrat">⚡ Raccourcis Clavier</h3>
                            <p className="text-sm text-neutral-600 font-montserrat">Activer les raccourcis clavier pour une navigation rapide</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={systemSettings.keyboardShortcuts}
                            onChange={(e) => setSystemSettings(prev => ({ ...prev, keyboardShortcuts: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-yellow-500 peer-checked:to-orange-600"></div>
                        </label>
                      </div>

                      {/* Liste des raccourcis */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-xl border border-gray-200">
                          <h4 className="font-bold text-secondary-900 mb-3">💾 Actions</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-neutral-600">Sauvegarder</span>
                              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+S</kbd>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-600">Exporter</span>
                              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+E</kbd>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-600">Thème sombre</span>
                              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+D</kbd>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-white rounded-xl border border-gray-200">
                          <h4 className="font-bold text-secondary-900 mb-3">📑 Navigation</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-neutral-600">Profil</span>
                              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">1</kbd>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-600">Sécurité</span>
                              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">2</kbd>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-600">Système</span>
                              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">4</kbd>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

        {/* Actions globales avec design moderne */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 space-y-4"
        >
          {/* Indicateur de statut */}
          <div className="flex items-center justify-center space-x-4 text-sm">
            {lastSaved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2 text-green-600"
              >
                <CheckCircle size={14} />
                <span>Dernière sauvegarde: {lastSaved.toLocaleTimeString()}</span>
              </motion.div>
            )}
            {unsavedChanges && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2 text-orange-600"
              >
                <AlertTriangle size={14} />
                <span>Changements en attente</span>
              </motion.div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleExportSettings}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden"
              >
              <motion.div
                animate={{ 
                  rotate: [0, 360]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "linear"
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              />
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Download size={16} />
              </motion.div>
                <span className="relative z-10">📥 Exporter les paramètres</span>
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleResetSettings}
                className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, -360]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "linear"
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                />
                <motion.div
                  whileHover={{ rotate: -360 }}
                  transition={{ duration: 0.6 }}
                >
                  <RefreshCw size={16} />
                </motion.div>
                <span className="relative z-10">🔄 Réinitialiser tous les paramètres</span>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Modale d'aide pour les raccourcis clavier */}
      <AnimatePresence>
        {showShortcutsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowShortcutsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-secondary-900 font-montserrat">
                  ⌨️ Guide des Raccourcis Clavier
                </h3>
                <button
                  onClick={() => setShowShortcutsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XCircle size={24} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-bold text-lg text-secondary-900">💾 Actions Principales</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-neutral-700">Sauvegarder les modifications</span>
                        <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono">Ctrl+S</kbd>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-neutral-700">Exporter les paramètres</span>
                        <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono">Ctrl+E</kbd>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-neutral-700">Basculer le thème sombre</span>
                        <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono">Ctrl+D</kbd>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-lg text-secondary-900">📑 Navigation par Onglets</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-neutral-700">Profil</span>
                        <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono">1</kbd>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-neutral-700">Sécurité</span>
                        <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono">2</kbd>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-neutral-700">Notifications</span>
                        <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono">3</kbd>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-neutral-700">Système</span>
                        <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono">4</kbd>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-neutral-700">Entreprise</span>
                        <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono">5</kbd>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info size={20} className="text-blue-600 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-blue-900 mb-2">💡 Conseils d'utilisation</h5>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Les raccourcis fonctionnent uniquement quand l'option est activée</li>
                        <li>• Utilisez Ctrl sur Windows/Linux et Cmd sur Mac</li>
                        <li>• Appuyez sur Échap pour fermer cette fenêtre</li>
                        <li>• Les raccourcis de sauvegarde fonctionnent selon l'onglet actif</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings; 