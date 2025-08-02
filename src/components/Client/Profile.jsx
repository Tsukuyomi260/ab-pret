import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import NotificationBell from '../UI/NotificationBell';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Save, 
  X, 
  Shield, 
  Bell, 
  CreditCard, 
  FileText, 
  Download,
  Camera,
  Trash2,
  LogOut,
  Settings,
  HelpCircle,
  Star,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
  Award,
  Target,
  Zap,
  Eye,
  Lock,
  Unlock,
  ChevronRight,
  Activity,
  BarChart3,
  DollarSign,
  Percent,
  Upload,
  Image
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { notifications, markAsRead } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [userStats, setUserStats] = useState({
    totalLoans: 15,
    activeLoans: 3,
    completedLoans: 12,
    totalBorrowed: 2500000,
    totalRepaid: 2200000,
    creditScore: 850,
    memberSince: '2023-01-15',
    monthlyIncome: 500000,
    nextPayment: 82500,
    daysUntilNextPayment: 12,
    loanSuccessRate: 95,
    averageLoanAmount: 166667,
    lastLoanDate: '2025-01-15'
  });

  const [formData, setFormData] = useState({
    firstName: user?.first_name || 'John',
    lastName: user?.last_name || 'Doe',
    email: user?.email || 'john.doe@example.com',
    phone: '+225 0701234567',
    address: 'Abidjan, Côte d\'Ivoire',
    occupation: 'Entrepreneur',
    monthlyIncome: 500000
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Si une nouvelle image a été sélectionnée, simuler l'upload
      if (profileImage) {
        console.log('Upload de l\'image de profil en cours');
        // Ici, vous pouvez ajouter la logique pour uploader l'image vers votre serveur
        // Par exemple : await uploadProfileImage(profileImage);
      }
      
      setIsEditing(false);
      // Réinitialiser l'état de l'image après sauvegarde
      setProfileImage(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Réinitialiser l'image de prévisualisation
    setPreviewImage(null);
    // Réinitialiser les données du formulaire
    setFormData({
      firstName: user?.first_name || 'John',
      lastName: user?.last_name || 'Doe',
      email: user?.email || 'john.doe@example.com',
      phone: '+225 0701234567',
      address: 'Abidjan, Côte d\'Ivoire',
      occupation: 'Entrepreneur',
      monthlyIncome: 500000
    });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image valide');
        return;
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image doit faire moins de 5MB');
        return;
      }
      
      setImageLoading(true);
      
      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
        setProfileImage(file);
        setImageLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getCreditScoreColor = (score) => {
    if (score >= 800) return 'text-green-600';
    if (score >= 700) return 'text-blue-600';
    if (score >= 600) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCreditScoreLabel = (score) => {
    if (score >= 800) return 'Excellent';
    if (score >= 700) return 'Bon';
    if (score >= 600) return 'Moyen';
    return 'Faible';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* CSS Animations */}
      <style>
        {`
          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }
          @keyframes slide-in-right {
            0% { transform: translateX(100px); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
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
            background-size: 400% 400%;
            animation: gradient 15s ease infinite;
          }
          .animate-pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          .animate-shine {
            animation: shine 2s ease-in-out infinite;
          }
        `}
      </style>

      {/* Section Hero avec gradient et animations */}
      <div className="relative">
        {/* Arrière-plan animé */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 opacity-10 animate-gradient"></div>
        
        {/* Patterns décoratifs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl opacity-20 animate-pulse-glow"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
          className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-indigo-400 to-pink-500 rounded-full blur-2xl opacity-30 animate-pulse-glow"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
          className="absolute bottom-20 left-1/4 w-20 h-20 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full blur-2xl opacity-25 animate-pulse-glow"
        />

        {/* Particules flottantes */}
        <motion.div
          animate={{ y: [-10, 10, -10], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-32 left-1/3 w-2 h-2 bg-blue-400 rounded-full opacity-60"
        />
        <motion.div
          animate={{ y: [10, -10, 10], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-48 right-1/4 w-1.5 h-1.5 bg-indigo-400 rounded-full opacity-70"
        />
        <motion.div
          animate={{ y: [-5, 15, -5], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-64 left-1/2 w-1 h-1 bg-purple-400 rounded-full opacity-80"
        />

        {/* Contenu Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative text-center py-16 px-4"
        >
          <div className="max-w-5xl mx-auto">
            {/* Badge animé */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full mb-8 relative overflow-hidden"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-2 h-2 bg-white rounded-full"
              />
              <span className="font-semibold text-sm">👤 Mon Profil Personnel</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: [-100, 100] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>

            {/* Titre principal */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl lg:text-7xl font-bold mb-6 relative"
            >
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Mon Profil
              </span>
              <motion.span
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="inline-block ml-4 text-4xl lg:text-6xl"
              >
                👤
              </motion.span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl lg:text-2xl text-gray-600 font-montserrat leading-relaxed mb-8 max-w-3xl mx-auto"
            >
              Gérez vos informations personnelles et consultez vos statistiques détaillées
            </motion.p>

            {/* Sous-titre avec icônes animées */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex items-center justify-center space-x-6 text-gray-500"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="flex items-center space-x-2"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <User size={20} className="text-blue-500" />
                </motion.div>
                <span className="text-sm font-medium">Informations</span>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                className="flex items-center space-x-2"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  <Shield size={20} className="text-indigo-500" />
                </motion.div>
                <span className="text-sm font-medium">Sécurité</span>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="flex items-center space-x-2"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <Activity size={20} className="text-purple-500" />
                </motion.div>
                <span className="text-sm font-medium">Statistiques</span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Contenu principal centré */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          
          {/* Section Informations Personnelles */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Carte principale du profil */}
            {/* Formulaire Interactif avec animations sophistiquées */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="relative"
            >
              <Card className="bg-gradient-to-br from-white/95 to-blue-50/80 backdrop-blur-sm border-white/30 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                {/* Effet de brillance sur la carte */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: [-100, 100] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
                
                {/* En-tête du formulaire avec animations */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 relative z-10">
                  <motion.div 
                    className="flex items-center space-x-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    <motion.div 
                      className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      animate={{ 
                        boxShadow: [
                          "0 0 0 0 rgba(59, 130, 246, 0.4)",
                          "0 0 0 12px rgba(59, 130, 246, 0)",
                          "0 0 0 0 rgba(59, 130, 246, 0)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    >
                      <User size={28} className="text-white" />
                    </motion.div>
                    <motion.h2 
                      className="text-3xl font-bold font-montserrat bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                    >
                      Informations Personnelles
                    </motion.h2>
                  </motion.div>
                  
                  {/* Boutons d'action avec animations avancées */}
                  {!isEditing ? (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7, duration: 0.6 }}
                    >
                      <motion.button
                        onClick={handleEdit}
                        className="flex items-center justify-center space-x-3 px-6 py-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden w-full sm:w-auto"
                        whileHover={{ 
                          scale: 1.05, 
                          y: -2,
                          boxShadow: "0 20px 40px -12px rgba(59, 130, 246, 0.4)"
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {/* Effet de brillance */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{ x: [-100, 100] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                        
                        <motion.div
                          animate={{ 
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Edit size={20} className="relative z-10" />
                        </motion.div>
                        <span className="relative z-10">Modifier le profil</span>
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="flex items-center justify-center sm:justify-end space-x-3 w-full sm:w-auto"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7, duration: 0.6 }}
                    >
                      {/* Bouton Annuler */}
                      <motion.button
                        onClick={handleCancel}
                        className="px-4 py-3 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
                        whileHover={{ 
                          scale: 1.1, 
                          rotate: -5,
                          boxShadow: "0 15px 30px -10px rgba(239, 68, 68, 0.4)"
                        }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {/* Effet de brillance */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{ x: [-100, 100] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                        
                        <motion.div
                          animate={{ 
                            rotate: [0, -10, 10, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <X size={20} className="relative z-10" />
                        </motion.div>
                      </motion.button>
                      
                      {/* Bouton Sauvegarder */}
                      <motion.button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
                        whileHover={{ 
                          scale: 1.05, 
                          y: -2,
                          boxShadow: "0 20px 40px -12px rgba(34, 197, 94, 0.4)"
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {/* Effet de brillance */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{ x: [-100, 100] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        />
                        
                        <motion.div
                          animate={{ 
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Save size={20} className="relative z-10" />
                        </motion.div>
                        <span className="relative z-10 ml-2">
                          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                        </span>
                      </motion.button>
                    </motion.div>
                  )}
                </div>

                {/* Grille des champs avec animations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  {/* Prénom */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    whileHover={{ 
                      scale: 1.02, 
                      y: -2,
                      boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)"
                    }}
                    className="relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/20 to-transparent"
                      animate={{ x: [-100, 100] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    />
                    <Input
                      label="Prénom"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      disabled={!isEditing}
                      className="bg-white/80 backdrop-blur-sm border-blue-200/50 hover:border-blue-300 transition-all duration-300 relative z-10"
                    />
                  </motion.div>
                  
                  {/* Nom */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    whileHover={{ 
                      scale: 1.02, 
                      y: -2,
                      boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.1)"
                    }}
                    className="relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-100/20 to-transparent"
                      animate={{ x: [-100, 100] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                    />
                    <Input
                      label="Nom"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      disabled={!isEditing}
                      className="bg-white/80 backdrop-blur-sm border-indigo-200/50 hover:border-indigo-300 transition-all duration-300 relative z-10"
                    />
                  </motion.div>
                  
                  {/* Email */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.5 }}
                    whileHover={{ 
                      scale: 1.02, 
                      y: -2,
                      boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.1)"
                    }}
                    className="relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-green-100/20 to-transparent"
                      animate={{ x: [-100, 100] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={!isEditing}
                      className="bg-white/80 backdrop-blur-sm border-green-200/50 hover:border-green-300 transition-all duration-300 relative z-10"
                    />
                  </motion.div>
                  
                  {/* Téléphone */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 0.5 }}
                    whileHover={{ 
                      scale: 1.02, 
                      y: -2,
                      boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.1)"
                    }}
                    className="relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100/20 to-transparent"
                      animate={{ x: [-100, 100] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
                    />
                    <Input
                      label="Téléphone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      disabled={!isEditing}
                      className="bg-white/80 backdrop-blur-sm border-amber-200/50 hover:border-amber-300 transition-all duration-300 relative z-10"
                    />
                  </motion.div>
                  
                  {/* Adresse */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                    whileHover={{ 
                      scale: 1.02, 
                      y: -2,
                      boxShadow: "0 10px 25px -5px rgba(147, 51, 234, 0.1)"
                    }}
                    className="relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-100/20 to-transparent"
                      animate={{ x: [-100, 100] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                    />
                    <Input
                      label="Adresse"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      disabled={!isEditing}
                      className="bg-white/80 backdrop-blur-sm border-purple-200/50 hover:border-purple-300 transition-all duration-300 relative z-10"
                    />
                  </motion.div>
                  
                  {/* Profession */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3, duration: 0.5 }}
                    whileHover={{ 
                      scale: 1.02, 
                      y: -2,
                      boxShadow: "0 10px 25px -5px rgba(236, 72, 153, 0.1)"
                    }}
                    className="relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-100/20 to-transparent"
                      animate={{ x: [-100, 100] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 3.5 }}
                    />
                    <Input
                      label="Profession"
                      value={formData.occupation}
                      onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                      disabled={!isEditing}
                      className="bg-white/80 backdrop-blur-sm border-pink-200/50 hover:border-pink-300 transition-all duration-300 relative z-10"
                    />
                  </motion.div>
                </div>
                
                {/* Indicateur de statut en bas */}
                {isEditing && (
                  <motion.div 
                    className="mt-6 pt-4 border-t border-blue-200/50 relative z-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 0.6 }}
                  >
                    <motion.div 
                      className="flex items-center justify-center space-x-2 text-sm text-blue-600"
                      animate={{ 
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <motion.div
                        animate={{ 
                          rotate: [0, 360]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Edit size={16} />
                      </motion.div>
                      <span className="font-medium">Mode édition actif - Modifiez vos informations</span>
                    </motion.div>
                  </motion.div>
                )}
              </Card>
            </motion.div>

            {/* Statistiques détaillées avec effets de brillance */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Carte Statistiques de Prêts */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                whileHover={{ 
                  scale: 1.02, 
                  y: -5,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}
                className="relative overflow-hidden"
              >
                <Card className="bg-gradient-to-br from-white/95 to-blue-50/80 backdrop-blur-sm border-white/30 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                  {/* Effet de brillance */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: [-100, 100] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                  
                  <div className="flex items-center space-x-3 mb-6 relative z-10">
                    <motion.div 
                      className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      animate={{ 
                        boxShadow: [
                          "0 0 0 0 rgba(59, 130, 246, 0.4)",
                          "0 0 0 10px rgba(59, 130, 246, 0)",
                          "0 0 0 0 rgba(59, 130, 246, 0)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <BarChart3 size={24} className="text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 font-montserrat bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Statistiques de Prêts
                    </h3>
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                    {/* Total des prêts */}
                    <motion.div 
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-xl border border-blue-100/50 relative overflow-hidden"
                      whileHover={{ 
                        scale: 1.02, 
                        y: -2,
                        boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.2)"
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/20 to-transparent"
                        animate={{ x: [-100, 100] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      />
                      <div className="flex items-center space-x-3 relative z-10">
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg"
                        >
                          <FileText className="text-white" size={18} />
                        </motion.div>
                        <span className="text-gray-700 font-semibold">Total des prêts</span>
                      </div>
                      <motion.span 
                        className="font-bold text-2xl text-blue-600 relative z-10"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                      >
                        {userStats.totalLoans}
                      </motion.span>
                    </motion.div>

                    {/* Prêts actifs */}
                    <motion.div 
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-xl border border-indigo-100/50 relative overflow-hidden"
                      whileHover={{ 
                        scale: 1.02, 
                        y: -2,
                        boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.2)"
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-200/20 to-transparent"
                        animate={{ x: [-100, 100] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      />
                      <div className="flex items-center space-x-3 relative z-10">
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: -10 }}
                          className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg"
                        >
                          <CreditCard className="text-white" size={18} />
                        </motion.div>
                        <span className="text-gray-700 font-semibold">Prêts actifs</span>
                      </div>
                      <motion.span 
                        className="font-bold text-2xl text-indigo-600 relative z-10"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
                      >
                        {userStats.activeLoans}
                      </motion.span>
                    </motion.div>

                    {/* Prêts remboursés */}
                    <motion.div 
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50/80 to-emerald-50/80 rounded-xl border border-green-100/50 relative overflow-hidden"
                      whileHover={{ 
                        scale: 1.02, 
                        y: -2,
                        boxShadow: "0 10px 25px -5px rgba(34, 197, 94, 0.2)"
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-green-200/20 to-transparent"
                        animate={{ x: [-100, 100] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                      />
                      <div className="flex items-center space-x-3 relative z-10">
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg"
                        >
                          <CheckCircle className="text-white" size={18} />
                        </motion.div>
                        <span className="text-gray-700 font-semibold">Prêts remboursés</span>
                      </div>
                      <motion.span 
                        className="font-bold text-2xl text-green-600 relative z-10"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.0, type: "spring", stiffness: 200 }}
                      >
                        {userStats.completedLoans}
                      </motion.span>
                    </motion.div>

                    {/* Taux de réussite */}
                    <motion.div 
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50/80 to-pink-50/80 rounded-xl border border-purple-100/50 relative overflow-hidden"
                      whileHover={{ 
                        scale: 1.02, 
                        y: -2,
                        boxShadow: "0 10px 25px -5px rgba(147, 51, 234, 0.2)"
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-200/20 to-transparent"
                        animate={{ x: [-100, 100] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                      />
                      <div className="flex items-center space-x-3 relative z-10">
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: -10 }}
                          className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg"
                        >
                          <Percent className="text-white" size={18} />
                        </motion.div>
                        <span className="text-gray-700 font-semibold">Taux de réussite</span>
                      </div>
                      <motion.span 
                        className="font-bold text-2xl text-purple-600 relative z-10"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
                      >
                        {userStats.loanSuccessRate}%
                      </motion.span>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>

              {/* Carte Montants */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                whileHover={{ 
                  scale: 1.02, 
                  y: -5,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}
                className="relative overflow-hidden"
              >
                <Card className="bg-gradient-to-br from-white/95 to-emerald-50/80 backdrop-blur-sm border-white/30 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                  {/* Effet de brillance */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: [-100, 100] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  />
                  
                  <div className="flex items-center space-x-3 mb-6 relative z-10">
                    <motion.div 
                      className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg"
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      animate={{ 
                        boxShadow: [
                          "0 0 0 0 rgba(16, 185, 129, 0.4)",
                          "0 0 0 10px rgba(16, 185, 129, 0)",
                          "0 0 0 0 rgba(16, 185, 129, 0)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    >
                      <DollarSign size={24} className="text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 font-montserrat bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                      Montants Financiers
                    </h3>
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                    {/* Total emprunté */}
                    <motion.div 
                      className="p-4 bg-gradient-to-r from-amber-50/80 to-orange-50/80 rounded-xl border border-amber-100/50 relative overflow-hidden"
                      whileHover={{ 
                        scale: 1.02, 
                        y: -2,
                        boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.2)"
                      }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/20 to-transparent"
                        animate={{ x: [-100, 100] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      />
                      <div className="relative z-10">
                        <span className="text-gray-600 text-xs uppercase tracking-wide font-semibold">Total emprunté</span>
                        <motion.p 
                          className="font-bold text-2xl text-amber-600 mt-1"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
                        >
                          {formatCurrency(userStats.totalBorrowed)}
                        </motion.p>
                      </div>
                    </motion.div>

                    {/* Total remboursé */}
                    <motion.div 
                      className="p-4 bg-gradient-to-r from-green-50/80 to-emerald-50/80 rounded-xl border border-green-100/50 relative overflow-hidden"
                      whileHover={{ 
                        scale: 1.02, 
                        y: -2,
                        boxShadow: "0 10px 25px -5px rgba(34, 197, 94, 0.2)"
                      }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-green-200/20 to-transparent"
                        animate={{ x: [-100, 100] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      />
                      <div className="relative z-10">
                        <span className="text-gray-600 text-xs uppercase tracking-wide font-semibold">Total remboursé</span>
                        <motion.p 
                          className="font-bold text-2xl text-green-600 mt-1"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 1.0, type: "spring", stiffness: 200 }}
                        >
                          {formatCurrency(userStats.totalRepaid)}
                        </motion.p>
                      </div>
                    </motion.div>

                    {/* Montant moyen */}
                    <motion.div 
                      className="p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-xl border border-blue-100/50 relative overflow-hidden"
                      whileHover={{ 
                        scale: 1.02, 
                        y: -2,
                        boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.2)"
                      }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/20 to-transparent"
                        animate={{ x: [-100, 100] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                      />
                      <div className="relative z-10">
                        <span className="text-gray-600 text-xs uppercase tracking-wide font-semibold">Montant moyen</span>
                        <motion.p 
                          className="font-bold text-2xl text-blue-600 mt-1"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
                        >
                          {formatCurrency(userStats.averageLoanAmount)}
                        </motion.p>
                      </div>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Section latérale */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            {/* Avatar et infos de base avec animations sophistiquées */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="bg-gradient-to-br from-white/95 to-blue-50/80 backdrop-blur-sm border-white/30 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                {/* Effet de brillance */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: [-100, 100] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
                
                <div className="text-center relative z-10">
                  <div className="relative mx-auto mb-6">
                    {/* Input file caché */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    {/* Avatar avec animations sophistiquées */}
                    <motion.div 
                      className="relative mx-auto w-28 h-28"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.6, type: "spring", stiffness: 200 }}
                    >
                      {/* Bordure animée */}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-1"
                        animate={{ 
                          rotate: 360,
                          boxShadow: [
                            "0 0 0 0 rgba(59, 130, 246, 0.4)",
                            "0 0 0 8px rgba(59, 130, 246, 0)",
                            "0 0 0 0 rgba(59, 130, 246, 0)"
                          ]
                        }}
                        transition={{ 
                          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                          boxShadow: { duration: 2, repeat: Infinity }
                        }}
                      />
                      
                      {/* Avatar principal */}
                      <motion.div 
                        className="w-full h-full bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl overflow-hidden relative"
                        whileHover={{ 
                          scale: 1.1, 
                          rotate: 5,
                          boxShadow: "0 20px 40px -12px rgba(59, 130, 246, 0.4)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        {/* Effet de brillance interne */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{ x: [-100, 100] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        />
                        
                        {previewImage ? (
                          <motion.img 
                            src={previewImage} 
                            alt="Photo de profil" 
                            className="w-full h-full object-cover relative z-10"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.9, duration: 0.5 }}
                          />
                        ) : (
                          <motion.span 
                            className="text-white text-4xl font-bold relative z-10"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.9, duration: 0.5 }}
                          >
                            {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                          </motion.span>
                        )}
                        
                        {/* Overlay de chargement */}
                        {imageLoading && (
                          <motion.div 
                            className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full z-20"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <motion.div 
                              className="animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                          </motion.div>
                        )}
                      </motion.div>
                      
                      {/* Particules décoratives autour de l'avatar */}
                      <motion.div
                        className="absolute -top-2 -left-2 w-3 h-3 bg-blue-400 rounded-full opacity-60"
                        animate={{ 
                          scale: [1, 1.5, 1],
                          opacity: [0.6, 0.2, 0.6]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <motion.div
                        className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-400 rounded-full opacity-70"
                        animate={{ 
                          scale: [1, 1.3, 1],
                          opacity: [0.7, 0.3, 0.7]
                        }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      />
                      <motion.div
                        className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-purple-400 rounded-full opacity-50"
                        animate={{ 
                          scale: [1, 1.4, 1],
                          opacity: [0.5, 0.1, 0.5]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      />
                    </motion.div>
                    
                    {/* Boutons d'action pour l'image avec animations avancées */}
                    {isEditing && (
                      <motion.div 
                        className="absolute -bottom-2 -right-2 flex space-x-2"
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 1.0, duration: 0.5 }}
                      >
                        {/* Bouton Upload/Camera */}
                        <motion.button 
                          onClick={triggerImageUpload}
                          className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-3 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
                          whileHover={{ 
                            scale: 1.15, 
                            rotate: 10,
                            boxShadow: "0 15px 30px -10px rgba(59, 130, 246, 0.4)"
                          }}
                          whileTap={{ scale: 0.9 }}
                          title="Changer la photo"
                        >
                          {/* Effet de brillance */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{ x: [-100, 100] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          />
                          
                          <motion.div
                            animate={{ 
                              rotate: [0, 360],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                            }}
                          >
                            {previewImage ? 
                              <Camera size={18} className="text-white relative z-10" /> : 
                              <Upload size={18} className="text-white relative z-10" />
                            }
                          </motion.div>
                        </motion.button>
                        
                        {/* Bouton Supprimer */}
                        {previewImage && (
                          <motion.button 
                            onClick={removeProfileImage}
                            className="bg-gradient-to-br from-red-500 to-pink-600 rounded-full p-3 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
                            whileHover={{ 
                              scale: 1.15, 
                              rotate: -10,
                              boxShadow: "0 15px 30px -10px rgba(239, 68, 68, 0.4)"
                            }}
                            whileTap={{ scale: 0.9 }}
                            title="Supprimer la photo"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.2, duration: 0.5 }}
                          >
                            {/* Effet de brillance */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                              animate={{ x: [-100, 100] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            />
                            
                            <motion.div
                              animate={{ 
                                rotate: [0, -360],
                                scale: [1, 1.1, 1]
                              }}
                              transition={{ 
                                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                                scale: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
                              }}
                            >
                              <Trash2 size={18} className="text-white relative z-10" />
                            </motion.div>
                          </motion.button>
                        )}
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Nom avec animation */}
                  <motion.h3 
                    className="text-2xl font-bold text-gray-900 font-montserrat mb-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 0.6 }}
                  >
                    {formData.firstName} {formData.lastName}
                  </motion.h3>
                  
                  {/* Badge photo en attente */}
                  {previewImage && isEditing && (
                    <motion.div 
                      className="flex items-center justify-center space-x-2 mb-4"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2, duration: 0.5 }}
                    >
                      <motion.div 
                        className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 text-xs px-3 py-2 rounded-full font-semibold border border-yellow-200 shadow-lg"
                        animate={{ 
                          boxShadow: [
                            "0 0 0 0 rgba(245, 158, 11, 0.4)",
                            "0 0 0 6px rgba(245, 158, 11, 0)",
                            "0 0 0 0 rgba(245, 158, 11, 0)"
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        📸 Photo en attente de sauvegarde
                      </motion.div>
                    </motion.div>
                  )}
                  
                  {/* Badge Client Premium */}
                  <motion.div 
                    className="flex items-center justify-center space-x-2 mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3, duration: 0.6 }}
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Award className="text-yellow-500" size={20} />
                    </motion.div>
                    <motion.p 
                      className="text-yellow-600 font-semibold bg-gradient-to-r from-yellow-50 to-orange-50 px-3 py-1 rounded-full border border-yellow-200"
                      whileHover={{ scale: 1.05 }}
                    >
                      Client Premium
                    </motion.p>
                  </motion.div>
                  
                  {/* Date d'inscription */}
                  <motion.div 
                    className="flex items-center justify-center space-x-2 text-sm text-gray-500"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 0.6 }}
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Calendar size={16} />
                    </motion.div>
                    <span className="font-medium">Membre depuis {formatDate(userStats.memberSince)}</span>
                  </motion.div>
                </div>
              </Card>
            </motion.div>

            {/* Score de crédit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Star size={20} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 font-montserrat">Score de Crédit</h3>
                </div>
                <div className="text-center">
                  <motion.div 
                    className={`text-5xl font-bold mb-2 ${getCreditScoreColor(userStats.creditScore)}`}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
                  >
                    {userStats.creditScore}
                  </motion.div>
                  <p className={`text-lg font-medium mb-4 ${getCreditScoreColor(userStats.creditScore)}`}>
                    {getCreditScoreLabel(userStats.creditScore)}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
                    <motion.div 
                      className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full" 
                      initial={{ width: 0 }}
                      animate={{ width: `${(userStats.creditScore / 1000) * 100}%` }}
                      transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">sur 1000 points</p>
                </div>
              </Card>
            </motion.div>

            {/* Actions rapides */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Zap size={20} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 font-montserrat">Actions Rapides</h3>
                </div>
                <div className="space-y-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="w-full justify-start px-4 py-3 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-primary-50 hover:border-primary-300 transition-all duration-200"
                      onClick={() => navigate('/loan-history')}
                    >
                      <FileText size={20} className="mr-3" />
                      Historique des prêts
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="w-full justify-start px-4 py-3 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                    >
                      <Download size={20} className="mr-3" />
                      Exporter mes données
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="w-full justify-start px-4 py-3 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                    >
                      <HelpCircle size={20} className="mr-3" />
                      Support client
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="w-full justify-start px-4 py-3 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                    >
                      <Settings size={20} className="mr-3" />
                      Paramètres
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>

            {/* Déconnexion */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-white/20 hover:shadow-xl transition-all duration-300">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full justify-start px-4 py-3 rounded-2xl bg-red-50/80 text-red-600 border-red-200/50 hover:bg-red-100/80 transition-all duration-200"
                  >
                    <LogOut size={20} className="mr-3" />
                    Se déconnecter
                  </Button>
                </motion.div>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile; 