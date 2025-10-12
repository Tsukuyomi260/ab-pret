import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
  Smartphone,
  Activity
} from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // États pour les formulaires
  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone_number || ''
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    loanAlerts: true,
    savingsAlerts: true,
    systemAlerts: false
  });

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      // TODO: Implémenter la mise à jour du profil
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('Profil mis à jour avec succès');
    } catch (error) {
      console.error('[SETTINGS] Erreur:', error);
      showError('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      if (securityData.newPassword !== securityData.confirmPassword) {
        showError('Les mots de passe ne correspondent pas');
        return;
      }

      if (securityData.newPassword.length < 6) {
        showError('Le mot de passe doit contenir au moins 6 caractères');
        return;
      }

      setLoading(true);
      // TODO: Implémenter le changement de mot de passe
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('Mot de passe mis à jour avec succès');
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('[SETTINGS] Erreur:', error);
      showError('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      setLoading(true);
      // TODO: Implémenter la mise à jour des notifications
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('Préférences de notification mises à jour');
    } catch (error) {
      console.error('[SETTINGS] Erreur:', error);
      showError('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-24">
      {/* Header Moderne */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                <SettingsIcon size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-montserrat">Paramètres</h1>
                <p className="text-sm sm:text-base text-gray-600 font-montserrat">Configuration de votre compte</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Profil */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold font-montserrat">Informations du profil</h2>
                <p className="text-sm text-blue-100">Gérez vos informations personnelles</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <button
              onClick={handleProfileUpdate}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              <span className="font-medium">{loading ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
            </button>
          </div>
        </div>

        {/* Section Sécurité */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className="p-4 sm:p-6 bg-gradient-to-r from-red-500 to-orange-600 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Shield size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold font-montserrat">Sécurité</h2>
                <p className="text-sm text-red-100">Changez votre mot de passe</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={securityData.currentPassword}
                    onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <button
              onClick={handlePasswordUpdate}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Shield size={18} />
              <span className="font-medium">{loading ? 'Mise à jour...' : 'Changer le mot de passe'}</span>
            </button>
          </div>
        </div>

        {/* Section Notifications */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Bell size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold font-montserrat">Notifications</h2>
                <p className="text-sm text-green-100">Gérez vos préférences de notification</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            <div className="space-y-4 mb-6">
              {/* Email notifications */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Mail size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Notifications par email</p>
                    <p className="text-sm text-gray-600">Recevoir les notifications importantes par email</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotificationSettings({...notificationSettings, emailNotifications: !notificationSettings.emailNotifications})}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notificationSettings.emailNotifications ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notificationSettings.emailNotifications ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Loan alerts */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Activity size={18} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Alertes de prêts</p>
                    <p className="text-sm text-gray-600">Notifications pour les nouvelles demandes de prêt</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotificationSettings({...notificationSettings, loanAlerts: !notificationSettings.loanAlerts})}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notificationSettings.loanAlerts ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notificationSettings.loanAlerts ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Savings alerts */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Alertes d'épargne</p>
                    <p className="text-sm text-gray-600">Notifications pour les nouveaux plans d'épargne</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotificationSettings({...notificationSettings, savingsAlerts: !notificationSettings.savingsAlerts})}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notificationSettings.savingsAlerts ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notificationSettings.savingsAlerts ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* System alerts */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertCircle size={18} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Alertes système</p>
                    <p className="text-sm text-gray-600">Notifications pour les mises à jour système</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotificationSettings({...notificationSettings, systemAlerts: !notificationSettings.systemAlerts})}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notificationSettings.systemAlerts ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notificationSettings.systemAlerts ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
            
            <button
              onClick={handleNotificationUpdate}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Bell size={18} />
              <span className="font-medium">{loading ? 'Enregistrement...' : 'Enregistrer les préférences'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
