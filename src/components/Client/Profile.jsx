import React, { useState, useEffect, useRef } from 'react';
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
  Camera,
  Trash2,
  LogOut,
  Calendar,
  Upload
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
      
      // Si une nouvelle image a été sélectionnée, simuler l'upload
      if (profileImage) {
        console.log('[PROFILE] Upload d\'image en cours');
      }
      
      setIsEditing(false);
      setProfileImage(null);
      setPreviewImage(null);
    } catch (error) {
      console.error('[PROFILE] Erreur lors de la sauvegarde:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfileImage(null);
    setPreviewImage(null);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm border-b border-accent-200">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2"
          >
            <X size={20} />
            <span>Retour</span>
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations personnelles */}
            <Card className="bg-white/90 backdrop-blur-sm border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 font-montserrat">
                  Informations personnelles
                </h2>
                {!isEditing ? (
                  <Button
                    onClick={handleEdit}
                    className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700"
                  >
                    <Edit size={16} />
                    <span>Modifier</span>
                  </Button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                    >
                      <Save size={16} />
                      <span>{loading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <X size={16} />
                      <span>Annuler</span>
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom
                  </label>
                  <Input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <Input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <Input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profession
                  </label>
                  <Input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Section latérale */}
          <div className="space-y-4">
            {/* Avatar et infos de base */}
            <div>
              <Card className="bg-white/90 backdrop-blur-sm border-white/20">
                <div className="text-center">
                  <div className="relative mx-auto mb-6">
                    {/* Input file caché */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    {/* Avatar */}
                    <div className="relative mx-auto w-28 h-28">
                      {/* Bordure */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-1" />
                      
                      {/* Avatar principal */}
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl overflow-hidden relative">
                        {previewImage ? (
                          <img 
                            src={previewImage} 
                            alt="Photo de profil" 
                            className="w-full h-full object-cover relative z-10"
                          />
                        ) : (
                          <span className="text-white text-4xl font-bold relative z-10">
                            {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                          </span>
                        )}
                        
                        {/* Overlay de chargement */}
                        {imageLoading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full z-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent" />
                          </div>
                        )}
                        
                        {/* Bouton d'édition */}
                        <button
                          onClick={triggerImageUpload}
                          className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center z-30 hover:bg-gray-100 transition-colors duration-200"
                        >
                          <Camera size={16} className="text-gray-600" />
                        </button>
                        
                        {/* Bouton de suppression */}
                        {previewImage && (
                          <button
                            onClick={removeProfileImage}
                            className="absolute top-0 right-0 w-8 h-8 bg-red-500 rounded-full shadow-lg flex items-center justify-center z-30 hover:bg-red-600 transition-colors duration-200"
                          >
                            <Trash2 size={16} className="text-white" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Nom */}
                  <h3 className="text-2xl font-bold text-gray-900 font-montserrat mb-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {formData.firstName} {formData.lastName}
                  </h3>
                  
                  {/* Date d'inscription */}
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Calendar size={16} />
                    <span className="font-medium">Membre depuis {formatDate(userStats.memberSince)}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Déconnexion */}
            <Card className="bg-white/90 backdrop-blur-sm border-white/20">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full justify-start px-4 py-3 rounded-2xl bg-red-50/80 text-red-600 border-red-200/50 hover:bg-red-100/80 transition-all duration-200"
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