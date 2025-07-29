import React, { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    totalLoans: 15,
    activeLoans: 3,
    completedLoans: 12,
    totalBorrowed: 2500000,
    totalRepaid: 2200000,
    creditScore: 850,
    memberSince: '2023-01-15'
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
    <div className="min-h-screen bg-gray-50">
      {/* Header centré style Apple */}
      <div className="text-center py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 font-montserrat mb-3">
            Mon Profil
          </h1>
          <p className="text-lg text-gray-600 font-montserrat leading-relaxed">
            Gérez vos informations personnelles et consultez vos statistiques
          </p>
        </div>
      </div>

      {/* Contenu principal centré */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Section Informations Personnelles */}
          <div className="lg:col-span-2 space-y-6">
            {/* Carte principale du profil */}
            <Card className="bg-white/90 backdrop-blur-sm border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 font-montserrat">Informations Personnelles</h2>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    onClick={handleEdit}
                    className="flex items-center space-x-2 px-4 py-2 rounded-2xl"
                  >
                    <Edit size={16} />
                    <span>Modifier</span>
                  </Button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="px-4 py-2 rounded-2xl"
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

            {/* Statistiques détaillées */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border-white/20">
                <h3 className="text-xl font-semibold text-gray-900 font-montserrat mb-4">Statistiques de Prêts</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-accent-50/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <FileText className="text-primary-600" size={20} />
                      <span className="text-gray-700">Total des prêts</span>
                    </div>
                    <span className="font-bold text-lg text-primary-600">{userStats.totalLoans}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="text-blue-600" size={20} />
                      <span className="text-gray-700">Prêts actifs</span>
                    </div>
                    <span className="font-bold text-lg text-blue-600">{userStats.activeLoans}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="text-green-600" size={20} />
                      <span className="text-gray-700">Prêts remboursés</span>
                    </div>
                    <span className="font-bold text-lg text-green-600">{userStats.completedLoans}</span>
                  </div>
                </div>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-white/20">
                <h3 className="text-xl font-semibold text-gray-900 font-montserrat mb-4">Montants</h3>
                <div className="space-y-4">
                  <div className="p-3 bg-accent-50/50 rounded-xl">
                    <span className="text-gray-600 text-xs uppercase tracking-wide">Total emprunté</span>
                    <p className="font-bold text-xl text-gray-900">{formatCurrency(userStats.totalBorrowed)}</p>
                  </div>
                  <div className="p-3 bg-green-50/50 rounded-xl">
                    <span className="text-gray-600 text-xs uppercase tracking-wide">Total remboursé</span>
                    <p className="font-bold text-xl text-green-600">{formatCurrency(userStats.totalRepaid)}</p>
                  </div>
                  <div className="p-3 bg-blue-50/50 rounded-xl">
                    <span className="text-gray-600 text-xs uppercase tracking-wide">Solde restant</span>
                    <p className="font-bold text-xl text-blue-600">{formatCurrency(userStats.totalBorrowed - userStats.totalRepaid)}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Section latérale */}
          <div className="space-y-6">
            {/* Avatar et infos de base */}
            <Card className="bg-white/90 backdrop-blur-sm border-white/20">
              <div className="text-center">
                <div className="relative mx-auto mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">
                      {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                    </span>
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg">
                      <Camera size={16} className="text-gray-600" />
                    </button>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 font-montserrat mb-2">
                  {formData.firstName} {formData.lastName}
                </h3>
                <p className="text-gray-600 mb-4">Client Premium</p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <Calendar size={16} />
                  <span>Membre depuis {formatDate(userStats.memberSince)}</span>
                </div>
              </div>
            </Card>

            {/* Score de crédit */}
            <Card className="bg-white/90 backdrop-blur-sm border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 font-montserrat mb-4">Score de Crédit</h3>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2" className={getCreditScoreColor(userStats.creditScore)}>
                  {userStats.creditScore}
                </div>
                <p className="text-sm font-medium mb-4" className={getCreditScoreColor(userStats.creditScore)}>
                  {getCreditScoreLabel(userStats.creditScore)}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500" 
                    style={{width: `${(userStats.creditScore / 1000) * 100}%`}}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">sur 1000 points</p>
              </div>
            </Card>

            {/* Actions rapides */}
            <Card className="bg-white/90 backdrop-blur-sm border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 font-montserrat mb-4">Actions Rapides</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start px-4 py-3 rounded-2xl bg-white/60 backdrop-blur-sm"
                  onClick={() => navigate('/loan-history')}
                >
                  <FileText size={20} className="mr-3" />
                  Historique des prêts
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start px-4 py-3 rounded-2xl bg-white/60 backdrop-blur-sm"
                >
                  <Download size={20} className="mr-3" />
                  Exporter mes données
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start px-4 py-3 rounded-2xl bg-white/60 backdrop-blur-sm"
                >
                  <HelpCircle size={20} className="mr-3" />
                  Support client
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start px-4 py-3 rounded-2xl bg-white/60 backdrop-blur-sm"
                >
                  <Settings size={20} className="mr-3" />
                  Paramètres
                </Button>
              </div>
            </Card>

            {/* Déconnexion */}
            <Card className="bg-white/90 backdrop-blur-sm border-white/20">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full justify-start px-4 py-3 rounded-2xl bg-red-50/80 text-red-600 border-red-200/50 hover:bg-red-100/80"
              >
                <LogOut size={20} className="mr-3" />
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