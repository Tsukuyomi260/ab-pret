import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { forceRoleRefresh, checkRoleConsistency } from '../../utils/forceRoleRefresh';
import { clearAllCache } from '../../utils/clearAllCache';
import { clearAllServiceWorkers } from '../../utils/clearServiceWorkers';
import { RefreshCw, User, AlertTriangle, CheckCircle, Zap, Trash2, Wifi } from 'lucide-react';

const RoleDebugger = () => {
  const { user, forceRefreshRole } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isForceRefreshing, setIsForceRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [roleConsistency, setRoleConsistency] = useState(null);

  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    try {
      const result = await forceRefreshRole();
      setLastRefresh(new Date().toLocaleTimeString());
      if (result.success) {
        console.log('[ROLE_DEBUGGER] ✅ Rôle mis à jour:', result.role);
      } else {
        console.error('[ROLE_DEBUGGER] ❌ Erreur:', result.error);
      }
    } catch (error) {
      console.error('[ROLE_DEBUGGER] ❌ Erreur:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleForceRoleRefresh = async () => {
    setIsForceRefreshing(true);
    try {
      const result = await forceRoleRefresh(user.id);
      if (result.success) {
        console.log('[ROLE_DEBUGGER] ✅ Rôle forcé mis à jour:', result.role);
        // La page va se recharger automatiquement
      } else {
        console.error('[ROLE_DEBUGGER] ❌ Erreur force refresh:', result.error);
        alert(`Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error('[ROLE_DEBUGGER] ❌ Erreur force refresh:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsForceRefreshing(false);
    }
  };

  const handleCheckConsistency = async () => {
    try {
      const result = await checkRoleConsistency();
      setRoleConsistency(result);
      console.log('[ROLE_DEBUGGER] Cohérence des rôles:', result);
    } catch (error) {
      console.error('[ROLE_DEBUGGER] ❌ Erreur vérification:', error);
    }
  };

  const handleClearAllCache = () => {
    if (window.confirm('⚠️ ATTENTION: Cette action va nettoyer TOUS les caches et recharger la page. Continuer ?')) {
      console.log('[ROLE_DEBUGGER] 🧹 Nettoyage complet du cache...');
      clearAllCache();
    }
  };

  const handleClearServiceWorkers = async () => {
    if (window.confirm('⚠️ ATTENTION: Cette action va nettoyer TOUS les Service Workers. Continuer ?')) {
      console.log('[ROLE_DEBUGGER] 🧹 Nettoyage des Service Workers...');
      const success = await clearAllServiceWorkers();
      if (success) {
        alert('✅ Service Workers nettoyés avec succès !');
      } else {
        alert('❌ Erreur lors du nettoyage des Service Workers');
      }
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <User size={20} className="text-blue-600" />
        <h3 className="font-semibold text-gray-900">Debug Rôle</h3>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Rôle actuel:</span>
          <span className={`font-semibold ${
            user.role === 'admin' ? 'text-green-600' : 'text-orange-600'
          }`}>
            {user.role || 'Non défini'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Email:</span>
          <span className="text-gray-900">{user.email}</span>
        </div>
        
        {lastRefresh && (
          <div className="flex justify-between">
            <span className="text-gray-600">Dernier refresh:</span>
            <span className="text-gray-900">{lastRefresh}</span>
          </div>
        )}
        
        {roleConsistency && (
          <div className="flex justify-between">
            <span className="text-gray-600">Cohérence:</span>
            <span className={`font-semibold ${
              roleConsistency.consistent ? 'text-green-600' : 'text-red-600'
            }`}>
              {roleConsistency.consistent ? 'OK' : 'INCOHÉRENT'}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <button
          onClick={handleForceRefresh}
          disabled={isRefreshing}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Actualisation...' : 'Forcer Refresh Rôle'}
        </button>
        
        <button
          onClick={handleForceRoleRefresh}
          disabled={isForceRefreshing}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors text-sm"
        >
          <Zap size={16} className={isForceRefreshing ? 'animate-pulse' : ''} />
          {isForceRefreshing ? 'Force Refresh...' : 'Force Refresh + Reload'}
        </button>
        
        <button
          onClick={handleCheckConsistency}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
        >
          <CheckCircle size={16} />
          Vérifier Cohérence
        </button>
        
        <button
          onClick={handleClearAllCache}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-800 hover:bg-red-900 text-white rounded-lg transition-colors text-sm"
        >
          <Trash2 size={16} />
          Nettoyer Tout + Reload
        </button>
        
        <button
          onClick={handleClearServiceWorkers}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
        >
          <Wifi size={16} />
          Nettoyer Service Workers
        </button>
        
        {user.role !== 'admin' && (
          <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertTriangle size={16} className="text-orange-600" />
            <span className="text-orange-800 text-xs">
              Rôle incorrect détecté. Cliquez sur "Forcer Refresh Rôle".
            </span>
          </div>
        )}
        
        {user.role === 'admin' && (
          <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-green-800 text-xs">
              Rôle admin correctement chargé.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleDebugger;
