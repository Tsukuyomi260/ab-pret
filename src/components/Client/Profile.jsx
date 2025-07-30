import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
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
  Eye,
  EyeOff,
  Lock,
  Key,
  Award,
  Target,
  Zap,
  Heart,
  Crown,
  Trophy,
  ChevronRight,
  Upload,
  File,
  Shield as ShieldIcon,
  Smartphone,
  Globe,
  Moon,
  Sun
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [userStats, setUserStats] = useState({
    totalLoans: 15,
    activeLoans: 3,
    completedLoans: 12,
    totalBorrowed: 2500000,
    totalRepaid: 2200000,
    creditScore: 850,
    memberSince: '2023-01-15',
    onTimePayments: 14,
    latePayments: 1,
    averageLoanAmount: 166667,
    nextPaymentDue: '2024-02-15',
    nextPaymentAmount: 150000
  });

  const [achievements] = useState([
    { id: 1, name: 'Premier Prêt', description: 'Premier prêt accordé', icon: Star, color: 'text-yellow-500', unlocked: true },
    { id: 2, name: 'Client Fidèle', description: '5 prêts remboursés', icon: Heart, color: 'text-red-500', unlocked: true },
    { id: 3, name: 'Paiement Parfait', description: '10 paiements à temps', icon: CheckCircle, color: 'text-green-500', unlocked: true },
    { id: 4, name: 'Grand Emprunteur', description: 'Prêt de plus de 1M FCFA', icon: Crown, color: 'text-purple-500', unlocked: true },
    { id: 5, name: 'Score Excellent', description: 'Score de crédit > 800', icon: Trophy, color: 'text-blue-500', unlocked: true },
    { id: 6, name: 'Membre VIP', description: '1 an de fidélité', icon: Crown, color: 'text-yellow-600', unlocked: false }
  ]);

  const [formData, setFormData] = useState({
    firstName: user?.first_name || 'John',
    lastName: user?.last_name || 'Doe',
    email: user?.email || 'john.doe@example.com',
    phone: '+225 0701234567',
    address: 'Abidjan, Côte d\'Ivoire',
    occupation: 'Entrepreneur',
    monthlyIncome: 500000,
    password: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    darkMode: false,
    language: 'fr'
  });

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

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
    setProfileImage(null);
    setPreviewImage(null);
    // Réinitialiser les données du formulaire
    setFormData({
      firstName: user?.first_name || 'John',
      lastName: user?.last_name || 'Doe',
      email: user?.email || 'john.doe@example.com',
      phone: '+225 0701234567',
      address: 'Abidjan, Côte d\'Ivoire',
      occupation: 'Entrepreneur',
      monthlyIncome: 500000,
      password: '',
      newPassword: '',
      confirmPassword: ''
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

  const getRepaymentProgress = () => {
    return (userStats.totalRepaid / userStats.totalBorrowed) * 100;
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Carte principale du profil avec avatar amélioré */}
      <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl border-white/30 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 font-montserrat">Informations Personnelles</h2>
          {!isEditing ? (
            <Button
              variant="outline"
              onClick={handleEdit}
              className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300"
            >
              <Edit size={18} />
              <span>Modifier</span>
            </Button>
          ) : (
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="px-4 py-3 rounded-2xl bg-red-50/80 text-red-600 border-red-200/50 hover:bg-red-100/80"
              >
                <X size={18} />
              </Button>
              <Button
                onClick={handleSave}
                loading={loading}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg"
              >
                <Save size={18} />
                <span>Sauvegarder</span>
              </Button>
            </div>
          )}
        </div>

        {/* Avatar section améliorée */}
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-8">
          <div className="relative">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 shadow-2xl">
              {previewImage ? (
                <img 
                  src={previewImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">
                    {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                  </span>
                </div>
              )}
              {isEditing && (
                <button 
                  onClick={triggerImageUpload}
                  className="absolute bottom-2 right-2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                >
                  <Camera size={20} className="text-primary-600" />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {isEditing && (
              <div className="mt-3 text-center">
                <p className="text-sm text-gray-600">Cliquez sur l'icône pour changer la photo</p>
              </div>
            )}
          </div>

          <div className="flex-1 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Prénom"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                disabled={!isEditing}
                className="bg-white/60 backdrop-blur-sm border-gray-200/50 focus:border-primary-500/50"
              />
              <Input
                label="Nom"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                disabled={!isEditing}
                className="bg-white/60 backdrop-blur-sm border-gray-200/50 focus:border-primary-500/50"
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={!isEditing}
                className="bg-white/60 backdrop-blur-sm border-gray-200/50 focus:border-primary-500/50"
              />
              <Input
                label="Téléphone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                disabled={!isEditing}
                className="bg-white/60 backdrop-blur-sm border-gray-200/50 focus:border-primary-500/50"
              />
              <Input
                label="Adresse"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                disabled={!isEditing}
                className="bg-white/60 backdrop-blur-sm border-gray-200/50 focus:border-primary-500/50 md:col-span-2"
              />
              <Input
                label="Profession"
                value={formData.occupation}
                onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                disabled={!isEditing}
                className="bg-white/60 backdrop-blur-sm border-gray-200/50 focus:border-primary-500/50"
              />
              <Input
                label="Revenu mensuel (FCFA)"
                type="number"
                value={formData.monthlyIncome}
                onChange={(e) => setFormData({...formData, monthlyIncome: parseInt(e.target.value)})}
                disabled={!isEditing}
                className="bg-white/60 backdrop-blur-sm border-gray-200/50 focus:border-primary-500/50"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Statistiques détaillées avec design amélioré */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl border-white/30 shadow-xl">
          <h3 className="text-xl font-semibold text-gray-900 font-montserrat mb-6 flex items-center">
            <TrendingUp className="mr-3 text-primary-600" size={24} />
            Statistiques de Prêts
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/80 to-blue-100/60 rounded-2xl border border-blue-200/30">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <FileText className="text-blue-600" size={20} />
                </div>
                <span className="text-gray-700 font-medium">Total des prêts</span>
              </div>
              <span className="font-bold text-2xl text-blue-600">{userStats.totalLoans}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50/80 to-green-100/60 rounded-2xl border border-green-200/30">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/20 rounded-xl">
                  <CreditCard className="text-green-600" size={20} />
                </div>
                <span className="text-gray-700 font-medium">Prêts actifs</span>
              </div>
              <span className="font-bold text-2xl text-green-600">{userStats.activeLoans}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50/80 to-purple-100/60 rounded-2xl border border-purple-200/30">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/20 rounded-xl">
                  <CheckCircle className="text-purple-600" size={20} />
                </div>
                <span className="text-gray-700 font-medium">Prêts remboursés</span>
              </div>
              <span className="font-bold text-2xl text-purple-600">{userStats.completedLoans}</span>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl border-white/30 shadow-xl">
          <h3 className="text-xl font-semibold text-gray-900 font-montserrat mb-6 flex items-center">
            <Target className="mr-3 text-primary-600" size={24} />
            Progression Financière
          </h3>
          <div className="space-y-6">
            <div className="p-4 bg-gradient-to-r from-accent-50/80 to-accent-100/60 rounded-2xl border border-accent-200/30">
              <span className="text-gray-600 text-sm uppercase tracking-wide font-medium">Total emprunté</span>
              <p className="font-bold text-2xl text-gray-900 mt-1">{formatCurrency(userStats.totalBorrowed)}</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-50/80 to-green-100/60 rounded-2xl border border-green-200/30">
              <span className="text-gray-600 text-sm uppercase tracking-wide font-medium">Total remboursé</span>
              <p className="font-bold text-2xl text-green-600 mt-1">{formatCurrency(userStats.totalRepaid)}</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-50/80 to-blue-100/60 rounded-2xl border border-blue-200/30">
              <span className="text-gray-600 text-sm uppercase tracking-wide font-medium">Solde restant</span>
              <p className="font-bold text-2xl text-blue-600 mt-1">{formatCurrency(userStats.totalBorrowed - userStats.totalRepaid)}</p>
            </div>
            
            {/* Barre de progression */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progression du remboursement</span>
                <span>{Math.round(getRepaymentProgress())}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm" 
                  style={{width: `${getRepaymentProgress()}%`}}
                ></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl border-white/30 shadow-xl">
        <h3 className="text-xl font-semibold text-gray-900 font-montserrat mb-6 flex items-center">
          <Shield className="mr-3 text-primary-600" size={24} />
          Sécurité du Compte
        </h3>
        
        <div className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-blue-50/80 to-blue-100/60 rounded-2xl border border-blue-200/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <Lock className="text-blue-600" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Mot de passe</h4>
                  <p className="text-sm text-gray-600">Dernière modification: il y a 30 jours</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm"
              >
                Modifier
              </Button>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-50/80 to-green-100/60 rounded-2xl border border-green-200/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/20 rounded-xl">
                  <Smartphone className="text-green-600" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Authentification à deux facteurs</h4>
                  <p className="text-sm text-gray-600">Sécurisez votre compte avec un code SMS</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm"
              >
                Activer
              </Button>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-purple-50/80 to-purple-100/60 rounded-2xl border border-purple-200/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/20 rounded-xl">
                  <Globe className="text-purple-600" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Sessions actives</h4>
                  <p className="text-sm text-gray-600">2 appareils connectés</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm"
              >
                Gérer
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl border-white/30 shadow-xl">
        <h3 className="text-xl font-semibold text-gray-900 font-montserrat mb-6 flex items-center">
          <Bell className="mr-3 text-primary-600" size={24} />
          Notifications
        </h3>
        
        <div className="space-y-4">
          {Object.entries(preferences).filter(([key]) => key.includes('Notification') || key.includes('marketing')).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/80 to-gray-100/60 rounded-2xl border border-gray-200/30">
              <div>
                <h4 className="font-semibold text-gray-900 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h4>
                <p className="text-sm text-gray-600">
                  {key.includes('email') ? 'Recevoir des notifications par email' :
                   key.includes('sms') ? 'Recevoir des notifications par SMS' :
                   key.includes('push') ? 'Recevoir des notifications push' :
                   'Recevoir des emails marketing'}
                </p>
              </div>
              <button
                onClick={() => setPreferences({...preferences, [key]: !value})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  value ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderAchievementsTab = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl border-white/30 shadow-xl">
        <h3 className="text-xl font-semibold text-gray-900 font-montserrat mb-6 flex items-center">
          <Award className="mr-3 text-primary-600" size={24} />
          Mes Réalisations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => {
            const IconComponent = achievement.icon;
            return (
              <div
                key={achievement.id}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-white/90 to-white/70 border-green-200/50 shadow-lg hover:shadow-xl'
                    : 'bg-gradient-to-br from-gray-50/90 to-gray-100/70 border-gray-200/50 opacity-60'
                }`}
              >
                <div className="text-center">
                  <div className={`inline-flex p-3 rounded-full mb-4 ${
                    achievement.unlocked ? 'bg-gradient-to-br from-green-100 to-green-200' : 'bg-gray-200'
                  }`}>
                    <IconComponent 
                      size={32} 
                      className={achievement.unlocked ? achievement.color : 'text-gray-400'} 
                    />
                  </div>
                  <h4 className={`font-semibold mb-2 ${
                    achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {achievement.name}
                  </h4>
                  <p className={`text-sm ${
                    achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {achievement.description}
                  </p>
                  {achievement.unlocked && (
                    <div className="mt-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle size={12} className="mr-1" />
                        Débloqué
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Header centré style Apple */}
      <div className="text-center py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 font-montserrat mb-4">
            Mon Profil
          </h1>
          <p className="text-xl text-gray-600 font-montserrat leading-relaxed max-w-2xl mx-auto">
            Gérez vos informations personnelles, consultez vos statistiques et suivez vos réalisations
          </p>
        </div>
      </div>

      {/* Navigation des onglets */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { id: 'profile', label: 'Profil', icon: User },
            { id: 'security', label: 'Sécurité', icon: Shield },
            { id: 'achievements', label: 'Réalisations', icon: Award }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white/90 border border-gray-200/50'
                }`}
              >
                <IconComponent size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu principal centré */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Contenu principal */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'security' && renderSecurityTab()}
            {activeTab === 'achievements' && renderAchievementsTab()}
          </div>

          {/* Section latérale */}
          <div className="space-y-6">
            {/* Avatar et infos de base */}
            <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl border-white/30 shadow-xl">
              <div className="text-center">
                <div className="relative mx-auto mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mx-auto flex items-center justify-center shadow-2xl">
                    {previewImage ? (
                      <img 
                        src={previewImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-white text-3xl font-bold">
                        {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 font-montserrat mb-2">
                  {formData.firstName} {formData.lastName}
                </h3>
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Crown className="text-yellow-500" size={16} />
                  <span className="text-sm font-medium text-gray-700">Client Premium</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-4">
                  <Calendar size={16} />
                  <span>Membre depuis {formatDate(userStats.memberSince)}</span>
                </div>
                
                {/* Prochain paiement */}
                <div className="p-4 bg-gradient-to-r from-orange-50/80 to-orange-100/60 rounded-2xl border border-orange-200/30">
                  <div className="text-sm text-gray-600 mb-1">Prochain paiement</div>
                  <div className="font-bold text-lg text-orange-600">{formatCurrency(userStats.nextPaymentAmount)}</div>
                  <div className="text-xs text-gray-500 mt-1">{formatDate(userStats.nextPaymentDue)}</div>
                </div>
              </div>
            </Card>

            {/* Score de crédit amélioré */}
            <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl border-white/30 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 font-montserrat mb-4 flex items-center">
                <Zap className="mr-2 text-primary-600" size={20} />
                Score de Crédit
              </h3>
              <div className="text-center">
                <div className={`text-5xl font-bold mb-3 ${getCreditScoreColor(userStats.creditScore)}`}>
                  {userStats.creditScore}
                </div>
                <p className={`text-lg font-medium mb-4 ${getCreditScoreColor(userStats.creditScore)}`}>
                  {getCreditScoreLabel(userStats.creditScore)}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-1000 ease-out shadow-sm" 
                    style={{width: `${(userStats.creditScore / 1000) * 100}%`}}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">sur 1000 points</p>
                
                {/* Statistiques rapides */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Paiements à temps</span>
                    <span className="font-semibold text-green-600">{userStats.onTimePayments}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Retards</span>
                    <span className="font-semibold text-red-600">{userStats.latePayments}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Actions rapides améliorées */}
            <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl border-white/30 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 font-montserrat mb-4 flex items-center">
                <Settings className="mr-2 text-primary-600" size={20} />
                Actions Rapides
              </h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start px-4 py-3 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 group"
                  onClick={() => navigate('/loan-history')}
                >
                  <FileText size={20} className="mr-3 text-primary-600 group-hover:scale-110 transition-transform duration-300" />
                  <span>Historique des prêts</span>
                  <ChevronRight size={16} className="ml-auto text-gray-400 group-hover:text-primary-600 transition-colors duration-300" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start px-4 py-3 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 group"
                >
                  <Download size={20} className="mr-3 text-primary-600 group-hover:scale-110 transition-transform duration-300" />
                  <span>Exporter mes données</span>
                  <ChevronRight size={16} className="ml-auto text-gray-400 group-hover:text-primary-600 transition-colors duration-300" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start px-4 py-3 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 group"
                >
                  <HelpCircle size={20} className="mr-3 text-primary-600 group-hover:scale-110 transition-transform duration-300" />
                  <span>Support client</span>
                  <ChevronRight size={16} className="ml-auto text-gray-400 group-hover:text-primary-600 transition-colors duration-300" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start px-4 py-3 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 group"
                >
                  <File size={20} className="mr-3 text-primary-600 group-hover:scale-110 transition-transform duration-300" />
                  <span>Mes documents</span>
                  <ChevronRight size={16} className="ml-auto text-gray-400 group-hover:text-primary-600 transition-colors duration-300" />
                </Button>
              </div>
            </Card>

            {/* Déconnexion */}
            <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl border-white/30 shadow-xl">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full justify-start px-4 py-3 rounded-2xl bg-red-50/80 text-red-600 border-red-200/50 hover:bg-red-100/80 transition-all duration-300 group"
              >
                <LogOut size={20} className="mr-3 group-hover:scale-110 transition-transform duration-300" />
                Se déconnecter
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 