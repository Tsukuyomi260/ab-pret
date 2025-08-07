import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
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
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
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
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // États pour les formulaires
  const [profileData, setProfileData] = useState({
    firstName: 'Abel',
    lastName: 'Admin',
    email: 'admin@campusfinance.bj',
    phone: '+229 90123456',
    role: 'Administrateur'
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationData, setNotificationData] = useState({
    emailNotifications: true,
    loanAlerts: true
  });

  const [systemData, setSystemData] = useState({
    maintenanceMode: false
  });

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      // Simulation de mise à jour
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('Profil mis à jour avec succès');
    } catch (error) {
      console.error('[ADMIN] Erreur lors de la mise à jour du profil:', error.message);
      showError('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityUpdate = async () => {
    try {
      setLoading(true);
      // Simulation de mise à jour
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('Paramètres de sécurité mis à jour');
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('[ADMIN] Erreur lors de la mise à jour de sécurité:', error.message);
      showError('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      setLoading(true);
      // Simulation de mise à jour
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('Paramètres de notification mis à jour');
    } catch (error) {
      console.error('[ADMIN] Erreur lors de la mise à jour des notifications:', error.message);
      showError('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleSystemUpdate = async () => {
    try {
      setLoading(true);
      // Simulation de mise à jour
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('Paramètres système mis à jour');
    } catch (error) {
      console.error('[ADMIN] Erreur lors de la mise à jour système:', error.message);
      showError('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'Système', icon: Cog }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-accent-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-montserrat">
                  Paramètres
                </h1>
                <p className="text-sm text-gray-600">Configuration de l'application</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation des onglets */}
          <div className="lg:col-span-1">
            <Card className="bg-white/90 backdrop-blur-sm">
              <div className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-primary-100 text-primary-700 border border-primary-200'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </Card>
          </div>

          {/* Contenu des onglets */}
          <div className="lg:col-span-3">
            <Card className="bg-white/90 backdrop-blur-sm">
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'profile' && (
                    <motion.div
                      key="profile"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Informations du profil</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Prénom"
                            value={profileData.firstName}
                            onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                          />
                          <Input
                            label="Nom"
                            value={profileData.lastName}
                            onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                          />
                          <Input
                            label="Email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          />
                          <Input
                            label="Téléphone"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          />
                        </div>
                        <div className="mt-6">
                          <Button
                            onClick={handleProfileUpdate}
                            disabled={loading}
                            className="flex items-center space-x-2"
                          >
                            <Save size={16} />
                            <span>{loading ? 'Mise à jour...' : 'Mettre à jour'}</span>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'security' && (
                    <motion.div
                      key="security"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Sécurité</h2>
                        <div className="space-y-4">
                          <Input
                            label="Mot de passe actuel"
                            type={showPassword ? 'text' : 'password'}
                            value={securityData.currentPassword}
                            onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                            icon={showPassword ? EyeOff : Eye}
                            onIconClick={() => setShowPassword(!showPassword)}
                          />
                          <Input
                            label="Nouveau mot de passe"
                            type={showPassword ? 'text' : 'password'}
                            value={securityData.newPassword}
                            onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                            icon={showPassword ? EyeOff : Eye}
                            onIconClick={() => setShowPassword(!showPassword)}
                          />
                          <Input
                            label="Confirmer le nouveau mot de passe"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={securityData.confirmPassword}
                            onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                            icon={showConfirmPassword ? EyeOff : Eye}
                            onIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          />
                        </div>
                        <div className="mt-6">
                          <Button
                            onClick={handleSecurityUpdate}
                            disabled={loading}
                            className="flex items-center space-x-2"
                          >
                            <Shield size={16} />
                            <span>{loading ? 'Mise à jour...' : 'Mettre à jour'}</span>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'notifications' && (
                    <motion.div
                      key="notifications"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Notifications</h2>
                        <div className="space-y-4">
                          {Object.entries(notificationData).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900 capitalize">
                                  {key === 'emailNotifications' ? 'Notifications par email' :
                                   key === 'loanAlerts' ? 'Alertes de prêts' : key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {key === 'emailNotifications' ? 'Recevoir les notifications par email' :
                                   key === 'loanAlerts' ? 'Alertes pour les nouvelles demandes de prêt' : ''}
                                </p>
                              </div>
                              <button
                                onClick={() => setNotificationData({...notificationData, [key]: !value})}
                                className={`w-12 h-6 rounded-full transition-colors ${
                                  value ? 'bg-primary-500' : 'bg-gray-300'
                                }`}
                              >
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                  value ? 'transform translate-x-6' : 'transform translate-x-1'
                                }`} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-6">
                          <Button
                            onClick={handleNotificationUpdate}
                            disabled={loading}
                            className="flex items-center space-x-2"
                          >
                            <Bell size={16} />
                            <span>{loading ? 'Mise à jour...' : 'Mettre à jour'}</span>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'system' && (
                    <motion.div
                      key="system"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Paramètres système</h2>
                        <div className="space-y-4">
                          {Object.entries(systemData).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900 capitalize">
                                  {key === 'maintenanceMode' ? 'Mode maintenance' : key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {key === 'maintenanceMode' ? 'Activer le mode maintenance pour les utilisateurs' : ''}
                                </p>
                              </div>
                              {typeof value === 'boolean' ? (
                                <button
                                  onClick={() => setSystemData({...systemData, [key]: !value})}
                                  className={`w-12 h-6 rounded-full transition-colors ${
                                    value ? 'bg-primary-500' : 'bg-gray-300'
                                  }`}
                                >
                                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                    value ? 'transform translate-x-6' : 'transform translate-x-1'
                                  }`} />
                                </button>
                              ) : (
                                <select
                                  value={value}
                                  onChange={(e) => setSystemData({...systemData, [key]: e.target.value})}
                                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                  <option value="1 year">1 an</option>
                                  <option value="2 years">2 ans</option>
                                  <option value="5 years">5 ans</option>
                                </select>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="mt-6">
                          <Button
                            onClick={handleSystemUpdate}
                            disabled={loading}
                            className="flex items-center space-x-2"
                          >
                            <Cog size={16} />
                            <span>{loading ? 'Mise à jour...' : 'Mettre à jour'}</span>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 