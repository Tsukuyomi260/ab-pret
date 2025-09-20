import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import NotificationBell from '../UI/NotificationBell';
import { 
  Edit, 
  Save, 
  X, 
  Camera,
  Trash2,
  LogOut
} from 'lucide-react';

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

  const [formData, setFormData] = useState({
    firstName: user?.first_name || user?.user_metadata?.first_name || '',
    lastName: user?.last_name || user?.user_metadata?.last_name || '',
    email: user?.email || '',
    phone: user?.phone_number || user?.user_metadata?.phone_number || ''
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      console.log('[PROFILE] Sauvegarde du profil en cours...');
      
      // Préparer les données du profil
      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone
      };
      
      // Mettre à jour le cache local
      try {
        const cachedUser = JSON.parse(localStorage.getItem('ab_user_cache') || '{}');
        const updatedCache = {
          ...cachedUser,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email
        };
        localStorage.setItem('ab_user_cache', JSON.stringify(updatedCache));
        console.log('[PROFILE] ✅ Cache local mis à jour');
      } catch (cacheError) {
        console.warn('[PROFILE] Erreur lors de la mise à jour du cache:', cacheError);
      }
      
      setIsEditing(false);
      console.log('[PROFILE] ✅ Profil mis à jour avec succès');
    } catch (error) {
      console.error('[PROFILE] ❌ Erreur exceptionnelle:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Restaurer les données originales
    setFormData({
      firstName: user?.first_name || user?.user_metadata?.first_name || '',
      lastName: user?.last_name || user?.user_metadata?.last_name || '',
      email: user?.email || '',
      phone: user?.phone_number || user?.user_metadata?.phone_number || ''
    });
    setIsEditing(false);
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
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

  const removeProfileImage = () => {
    setProfileImage(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50">
      {/* Header avec notifications */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/menu')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Retour au menu
              </button>
              <h1 className="text-2xl font-bold text-gray-900 font-montserrat">
                Mon Profil
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationBell 
                notifications={notifications}
                onMarkAsRead={markAsRead}
              />
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut size={16} />
                <span>Déconnexion</span>
              </Button>
            </div>
          </div>
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
                  
                  {/* Rôle utilisateur */}
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <span className="font-medium capitalize">{user.role}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 