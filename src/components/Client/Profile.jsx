import React, { useState, useEffect } from 'react';
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
  Percent
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { notifications, markAsRead } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
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
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50">
      {/* Header avec gradient et animations */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8 px-4"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-full text-center">
                <h1 className="text-4xl lg:text-5xl font-bold text-secondary-900 font-montserrat mb-4">
                  Mon Profil
                </h1>
                <p className="text-xl lg:text-2xl text-secondary-600 font-montserrat leading-relaxed">
                  Gérez vos informations personnelles et consultez vos statistiques détaillées
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-primary-100 rounded-full">
                      <User size={24} className="text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 font-montserrat">Informations Personnelles</h2>
                  </div>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      onClick={handleEdit}
                      className="flex items-center justify-center space-x-2 px-4 py-2 rounded-2xl hover:bg-primary-50 w-full sm:w-auto"
                    >
                      <Edit size={16} />
                      <span>Modifier</span>
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center sm:justify-end space-x-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="px-4 py-2 rounded-2xl hover:bg-red-50"
                      >
                        <X size={16} />
                      </Button>
                      <Button
                        onClick={handleSave}
                        loading={loading}
                        className="px-4 py-2 rounded-2xl bg-primary-500 hover:bg-primary-600"
                      >
                        <Save size={16} />
                      </Button>
                    </div>
                  )}
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Prénom"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  disabled={!isEditing}
                  className="bg-white/60 backdrop-blur-sm"
                />
                <Input
                  label="Nom"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  disabled={!isEditing}
                  className="bg-white/60 backdrop-blur-sm"
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={!isEditing}
                  className="bg-white/60 backdrop-blur-sm"
                />
                <Input
                  label="Téléphone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  disabled={!isEditing}
                  className="bg-white/60 backdrop-blur-sm"
                />
                <Input
                  label="Adresse"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  disabled={!isEditing}
                  className="bg-white/60 backdrop-blur-sm"
                />
                <Input
                  label="Profession"
                  value={formData.occupation}
                  onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                  disabled={!isEditing}
                  className="bg-white/60 backdrop-blur-sm"
                />
              </div>
            </Card>
            </motion.div>

            {/* Statistiques détaillées */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <Card className="bg-white/90 backdrop-blur-sm border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <BarChart3 size={20} className="text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 font-montserrat">Statistiques de Prêts</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <FileText className="text-primary-600" size={20} />
                      <span className="text-gray-700 font-medium">Total des prêts</span>
                    </div>
                    <span className="font-bold text-xl text-primary-600">{userStats.totalLoans}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="text-blue-600" size={20} />
                      <span className="text-gray-700 font-medium">Prêts actifs</span>
                    </div>
                    <span className="font-bold text-xl text-blue-600">{userStats.activeLoans}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="text-green-600" size={20} />
                      <span className="text-gray-700 font-medium">Prêts remboursés</span>
                    </div>
                    <span className="font-bold text-xl text-green-600">{userStats.completedLoans}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <Percent className="text-purple-600" size={20} />
                      <span className="text-gray-700 font-medium">Taux de réussite</span>
                    </div>
                    <span className="font-bold text-xl text-purple-600">{userStats.loanSuccessRate}%</span>
                  </div>
                </div>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign size={20} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 font-montserrat">Montants</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-accent-50 to-accent-100/50 rounded-xl hover:shadow-md transition-all duration-200">
                    <span className="text-gray-600 text-xs uppercase tracking-wide font-medium">Total emprunté</span>
                    <p className="font-bold text-2xl text-gray-900 mt-1">{formatCurrency(userStats.totalBorrowed)}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl hover:shadow-md transition-all duration-200">
                    <span className="text-gray-600 text-xs uppercase tracking-wide font-medium">Total remboursé</span>
                    <p className="font-bold text-2xl text-green-600 mt-1">{formatCurrency(userStats.totalRepaid)}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl hover:shadow-md transition-all duration-200">
                    <span className="text-gray-600 text-xs uppercase tracking-wide font-medium">Montant moyen</span>
                    <p className="font-bold text-2xl text-blue-600 mt-1">{formatCurrency(userStats.averageLoanAmount)}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Section latérale */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            {/* Avatar et infos de base */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="text-center">
                  <div className="relative mx-auto mb-6">
                    <motion.div 
                      className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mx-auto flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span className="text-white text-3xl font-bold">
                        {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                      </span>
                    </motion.div>
                    {isEditing && (
                      <motion.button 
                        className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Camera size={16} className="text-gray-600" />
                      </motion.button>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 font-montserrat mb-2">
                    {formData.firstName} {formData.lastName}
                  </h3>
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Award className="text-yellow-500" size={16} />
                    <p className="text-yellow-600 font-medium">Client Premium</p>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Calendar size={16} />
                    <span>Membre depuis {formatDate(userStats.memberSince)}</span>
                  </div>
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