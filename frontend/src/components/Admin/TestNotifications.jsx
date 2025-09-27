import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Send, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  CreditCard,
  Clock,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { getAllUsers } from '../../utils/supabaseAPI';

const TestNotifications = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [testType, setTestType] = useState('approval');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const result = await getAllUsers();
      
      if (result.success) {
        // Filtrer seulement les utilisateurs approuvés
        const approvedUsers = result.data.filter(user => user.status === 'approved');
        setUsers(approvedUsers);
        console.log('[TEST_NOTIFICATIONS] Utilisateurs chargés:', approvedUsers.length);
      } else {
        console.error('[TEST_NOTIFICATIONS] Erreur chargement utilisateurs:', result.error);
      }
    } catch (error) {
      console.error('[TEST_NOTIFICATIONS] Erreur:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const sendTestNotification = async () => {
    if (!selectedUser) {
      alert('Veuillez sélectionner un utilisateur');
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      // Configuration du backend selon l'environnement
      const getBackendUrl = () => {
        if (process.env.NODE_ENV === 'production') {
          return 'https://ab-pret-back.onrender.com';
        }
        return process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      };

      const BACKEND_URL = getBackendUrl();

      console.log('[TEST_NOTIFICATIONS] Envoi notification de test...', {
        userId: selectedUser,
        testType: testType,
        backendUrl: BACKEND_URL
      });

      const response = await fetch(`${BACKEND_URL}/api/test-loan-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser,
          testType: testType
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult({
          type: 'success',
          message: 'Notification envoyée avec succès !',
          details: data.details
        });
        console.log('[TEST_NOTIFICATIONS] ✅ Notification envoyée:', data.details);
      } else {
        setResult({
          type: 'error',
          message: data.error || 'Erreur lors de l\'envoi de la notification',
          details: null
        });
        console.error('[TEST_NOTIFICATIONS] ❌ Erreur:', data.error);
      }
    } catch (error) {
      console.error('[TEST_NOTIFICATIONS] Erreur réseau:', error);
      setResult({
        type: 'error',
        message: 'Erreur de connexion au serveur',
        details: null
      });
    } finally {
      setLoading(false);
    }
  };

  const getTestTypeInfo = (type) => {
    const types = {
      approval: {
        icon: <CheckCircle size={20} className="text-green-600" />,
        title: 'Prêt approuvé',
        description: 'Notification de validation de prêt',
        color: 'text-green-600 bg-green-100'
      },
      reminder: {
        icon: <Clock size={20} className="text-blue-600" />,
        title: 'Rappel de remboursement',
        description: 'Notification de rappel avant échéance',
        color: 'text-blue-600 bg-blue-100'
      },
      overdue: {
        icon: <AlertTriangle size={20} className="text-red-600" />,
        title: 'Prêt en retard',
        description: 'Notification de prêt en retard avec pénalités',
        color: 'text-red-600 bg-red-100'
      }
    };
    return types[type] || types.approval;
  };

  const selectedUserData = users.find(user => user.id === selectedUser);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Test des Notifications</h2>
          <p className="text-gray-600">Envoyer des notifications de test aux utilisateurs</p>
        </div>
        <Button
          onClick={loadUsers}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
          disabled={loadingUsers}
        >
          <RefreshCw size={16} className={loadingUsers ? 'animate-spin' : ''} />
          <span>Actualiser</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Bell size={20} className="text-primary-600" />
              <span>Configuration du test</span>
            </h3>

            <div className="space-y-4">
              {/* Sélection de l'utilisateur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Utilisateur cible
                </label>
                {loadingUsers ? (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Chargement des utilisateurs...</span>
                  </div>
                ) : (
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un utilisateur</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.email})
                      </option>
                    ))}
                  </select>
                )}
                {selectedUserData && (
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedUserData.first_name} {selectedUserData.last_name} - {selectedUserData.email}
                  </p>
                )}
              </div>

              {/* Type de notification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de notification
                </label>
                <div className="space-y-2">
                  {['approval', 'reminder', 'overdue'].map(type => {
                    const info = getTestTypeInfo(type);
                    return (
                      <label key={type} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="testType"
                          value={type}
                          checked={testType === type}
                          onChange={(e) => setTestType(e.target.value)}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <div className={`p-2 rounded-lg ${info.color}`}>
                          {info.icon}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{info.title}</p>
                          <p className="text-sm text-gray-500">{info.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Bouton d'envoi */}
              <Button
                onClick={sendTestNotification}
                disabled={!selectedUser || loading}
                className="w-full flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Envoyer la notification de test</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Résultat */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <CreditCard size={20} className="text-primary-600" />
              <span>Résultat du test</span>
            </h3>

            {!result ? (
              <div className="text-center py-8 text-gray-500">
                <Bell size={48} className="mx-auto mb-4 opacity-50" />
                <p>Aucun test effectué</p>
                <p className="text-sm">Sélectionnez un utilisateur et envoyez une notification de test</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg ${
                  result.type === 'success' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {result.type === 'success' ? (
                    <CheckCircle size={20} className="text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle size={20} className="text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${
                      result.type === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.message}
                    </p>
                    
                    {result.details && (
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="font-medium text-gray-700">Utilisateur:</span>
                            <p className="text-gray-600">{result.details.user}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Email:</span>
                            <p className="text-gray-600">{result.details.email}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Type:</span>
                            <p className="text-gray-600">{result.details.testType}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Abonnements:</span>
                            <p className="text-gray-600">{result.details.subscriptionsFound}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Envoyées:</span>
                            <p className="text-gray-600">{result.details.notificationsSent}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Erreurs:</span>
                            <p className="text-gray-600">{result.details.errors}</p>
                          </div>
                        </div>
                        
                        {result.details.notificationData && (
                          <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                            <p className="font-medium text-gray-700 mb-1">Contenu de la notification:</p>
                            <p className="text-sm text-gray-600">
                              <strong>Titre:</strong> {result.details.notificationData.title}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Message:</strong> {result.details.notificationData.body}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </div>

      {/* Informations sur l'environnement */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations sur l'environnement</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Environnement:</span>
              <p className="text-gray-600">{process.env.NODE_ENV || 'development'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Backend URL:</span>
              <p className="text-gray-600">
                {process.env.NODE_ENV === 'production' 
                  ? 'https://ab-pret-back.onrender.com' 
                  : process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'
                }
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Utilisateurs disponibles:</span>
              <p className="text-gray-600">{users.length} utilisateurs approuvés</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TestNotifications;
