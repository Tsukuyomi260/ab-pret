import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { useSupabaseNotifications } from '../../utils/useSupabaseNotifications';
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
  Globe, 
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
  Minus
} from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();

  const { showSuccess, showError } = useNotification();
  const { isConnected } = useSupabaseNotifications();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    maxFileSize: 10
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

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      // Simuler la mise à jour
      await new Promise(resolve => setTimeout(resolve, 1000));
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
        maxFileSize: 10
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

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'Système', icon: SettingsIcon },
    { id: 'company', label: 'Entreprise', icon: Building }
  ];

  return (
    <div className="min-h-screen bg-accent-50">
      {/* Header */}
      <div className="bg-white shadow-soft border-b border-accent-200">
        <div className="px-4 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft size={16} />
                <span>Retour</span>
              </Button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-secondary-900 font-montserrat">
                  Paramètres
                </h1>
                <p className="text-neutral-600 font-montserrat">
                  Gérez les configurations et préférences
                </p>
              </div>
            </div>
            
            {/* Indicateur de connexion temps réel */}
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                isConnected 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="font-medium">
                  {isConnected ? 'Temps réel actif' : 'Hors ligne'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation des onglets */}
          <div className="lg:col-span-1">
            <Card className="bg-white">
              <div className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors duration-200 font-montserrat ${
                          activeTab === tab.id
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-neutral-600 hover:text-secondary-900 hover:bg-accent-100'
                        }`}
                      >
                        <Icon size={20} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </Card>
          </div>

          {/* Contenu des onglets */}
          <div className="lg:col-span-3">
            <Card className="bg-white">
              <div className="p-6">
                {/* Onglet Profil */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-secondary-900 font-montserrat">
                        Informations du profil
                      </h2>
                      <Button
                        onClick={handleProfileUpdate}
                        disabled={loading}
                        className="flex items-center space-x-2"
                      >
                        <Save size={16} />
                        <span>Sauvegarder</span>
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Prénom"
                        value={profileSettings.firstName}
                        onChange={(e) => setProfileSettings(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Votre prénom"
                      />
                      <Input
                        label="Nom"
                        value={profileSettings.lastName}
                        onChange={(e) => setProfileSettings(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Votre nom"
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={profileSettings.email}
                        onChange={(e) => setProfileSettings(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="votre@email.com"
                      />
                      <Input
                        label="Téléphone"
                        value={profileSettings.phone}
                        onChange={(e) => setProfileSettings(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+228 90 00 00 00"
                      />
                      <Input
                        label="Poste"
                        value={profileSettings.position}
                        onChange={(e) => setProfileSettings(prev => ({ ...prev, position: e.target.value }))}
                        placeholder="Votre poste"
                      />
                      <Input
                        label="Département"
                        value={profileSettings.department}
                        onChange={(e) => setProfileSettings(prev => ({ ...prev, department: e.target.value }))}
                        placeholder="Votre département"
                      />
                    </div>
                  </div>
                )}

                {/* Onglet Sécurité */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-secondary-900 font-montserrat">
                        Paramètres de sécurité
                      </h2>
                      <Button
                        onClick={handleSecurityUpdate}
                        disabled={loading}
                        className="flex items-center space-x-2"
                      >
                        <Save size={16} />
                        <span>Sauvegarder</span>
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
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
                          className="absolute right-3 top-8 text-neutral-400 hover:text-neutral-600"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      
                      <div className="relative">
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
                          className="absolute right-3 top-8 text-neutral-400 hover:text-neutral-600"
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      
                      <Input
                        label="Confirmer le nouveau mot de passe"
                        type="password"
                        value={securitySettings.confirmPassword}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirmer le nouveau mot de passe"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-accent-50 rounded-xl">
                        <div>
                          <h3 className="font-medium text-secondary-900 font-montserrat">Authentification à deux facteurs</h3>
                          <p className="text-sm text-neutral-600 font-montserrat">Sécurisez votre compte avec 2FA</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={securitySettings.twoFactorAuth}
                            onChange={(e) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-secondary-900 font-montserrat mb-2">
                            Timeout de session (minutes)
                          </label>
                          <select
                            value={securitySettings.sessionTimeout}
                            onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                            className="w-full px-4 py-2 border border-accent-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={60}>1 heure</option>
                            <option value={120}>2 heures</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-secondary-900 font-montserrat mb-2">
                            Tentatives de connexion max
                          </label>
                          <select
                            value={securitySettings.maxLoginAttempts}
                            onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                            className="w-full px-4 py-2 border border-accent-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value={3}>3 tentatives</option>
                            <option value={5}>5 tentatives</option>
                            <option value={10}>10 tentatives</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Onglet Notifications */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
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
                  </div>
                )}

                {/* Onglet Système */}
                {activeTab === 'system' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-secondary-900 font-montserrat">
                        Paramètres système
                      </h2>
                      <Button
                        onClick={handleSystemUpdate}
                        disabled={loading}
                        className="flex items-center space-x-2"
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
                  </div>
                )}

                {/* Onglet Entreprise */}
                {activeTab === 'company' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-secondary-900 font-montserrat">
                        Informations de l'entreprise
                      </h2>
                      <Button
                        onClick={handleCompanyUpdate}
                        disabled={loading}
                        className="flex items-center space-x-2"
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
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Actions globales */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            onClick={handleExportSettings}
            className="flex items-center space-x-2"
          >
            <Download size={16} />
            <span>Exporter les paramètres</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={handleResetSettings}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700"
          >
            <RefreshCw size={16} />
            <span>Réinitialiser tous les paramètres</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 