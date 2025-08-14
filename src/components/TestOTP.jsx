import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

const TestOTP = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkUser = async () => {
    if (!phoneNumber.trim()) {
      setError('Veuillez entrer un numéro de téléphone');
      return;
    }

    setLoading(true);
    setError('');
    setUserInfo(null);

    try {
      console.log('[DIAGNOSTIC] Vérification de l\'utilisateur:', phoneNumber);

      // 1. Vérifier dans la table users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('phone_number', phoneNumber)
        .single();

      if (userError) {
        console.error('[DIAGNOSTIC] Erreur table users:', userError);
        setError(`Utilisateur non trouvé dans la table users: ${userError.message}`);
        return;
      }

      console.log('[DIAGNOSTIC] Utilisateur trouvé dans users:', userData);

      // 2. Essayer de récupérer depuis auth.users (si possible)
      let authUser = null;
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userData.id);
        if (!authError && authData) {
          authUser = authData.user;
          console.log('[DIAGNOSTIC] Utilisateur trouvé dans auth.users:', authUser);
        }
      } catch (adminError) {
        console.log('[DIAGNOSTIC] Impossible d\'accéder à auth.users (pas de droits admin)');
      }

      // 3. Reconstruire l'email temporaire
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      const timestamp = new Date(userData.created_at).getTime();
      const tempEmail = `user.${cleanPhone}.${timestamp}@gmail.com`;

      setUserInfo({
        user: userData,
        authUser: authUser,
        tempEmail: tempEmail,
        cleanPhone: cleanPhone
      });

    } catch (error) {
      console.error('[DIAGNOSTIC] Erreur:', error);
      setError(`Erreur lors de la vérification: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🔍 Diagnostic des Utilisateurs
          </h1>

          <div className="space-y-6">
            {/* Input téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone à vérifier
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="22912345678"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={checkUser}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Vérification...' : 'Vérifier'}
                </button>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Informations utilisateur */}
            {userInfo && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">📋 Informations Utilisateur</h2>
                
                {/* Table users */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Table users</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>ID:</strong> {userInfo.user.id}</div>
                    <div><strong>Email:</strong> {userInfo.user.email || 'Non défini'}</div>
                    <div><strong>Téléphone:</strong> {userInfo.user.phone_number}</div>
                    <div><strong>Prénom:</strong> {userInfo.user.first_name}</div>
                    <div><strong>Nom:</strong> {userInfo.user.last_name}</div>
                    <div><strong>Rôle:</strong> {userInfo.user.role}</div>
                    <div><strong>Statut:</strong> {userInfo.user.status}</div>
                    <div><strong>Créé le:</strong> {new Date(userInfo.user.created_at).toLocaleString()}</div>
                  </div>
                </div>

                {/* Auth users */}
                {userInfo.authUser ? (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-3">✅ Table auth.users</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>ID:</strong> {userInfo.authUser.id}</div>
                      <div><strong>Email:</strong> {userInfo.authUser.email}</div>
                      <div><strong>Email vérifié:</strong> {userInfo.authUser.email_confirmed_at ? 'Oui' : 'Non'}</div>
                      <div><strong>Dernière connexion:</strong> {userInfo.authUser.last_sign_in_at ? new Date(userInfo.authUser.last_sign_in_at).toLocaleString() : 'Jamais'}</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 mb-3">⚠️ Table auth.users</h3>
                    <p className="text-yellow-700">Utilisateur non trouvé dans auth.users. Cela explique pourquoi la connexion échoue.</p>
                  </div>
                )}

                {/* Email temporaire */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-3">📧 Email temporaire reconstruit</h3>
                  <div className="space-y-2">
                    <div><strong>Email utilisé pour la connexion:</strong></div>
                    <code className="bg-blue-100 px-2 py-1 rounded text-sm">{userInfo.tempEmail}</code>
                    <div className="text-sm text-blue-600">
                      Cet email est reconstruit à partir du téléphone et de la date de création.
                    </div>
                  </div>
                </div>

                {/* Recommandations */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 mb-3">💡 Recommandations</h3>
                  <ul className="text-sm text-purple-700 space-y-1">
                    {!userInfo.authUser && (
                      <li>• L\'utilisateur n\'existe pas dans auth.users - il faut le recréer avec signUpWithPhone</li>
                    )}
                    {userInfo.user.status !== 'approved' && (
                      <li>• Le statut n\'est pas "approved" - mettre à jour le statut</li>
                    )}
                    <li>• Vérifier que le mot de passe correspond à l\'email temporaire</li>
                    <li>• Essayer de se connecter avec l\'email temporaire directement</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestOTP;

