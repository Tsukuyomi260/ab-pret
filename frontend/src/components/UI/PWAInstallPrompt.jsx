import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Star, Zap, Shield } from 'lucide-react';
import usePWAInstall from '../../hooks/usePWAInstall';

const PWAInstallPrompt = () => {
  const { 
    showInstallPrompt, 
    canInstall, 
    installApp, 
    dismissInstallPrompt 
  } = usePWAInstall();

  if (!showInstallPrompt || !canInstall) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      // L'installation a réussi, le prompt se fermera automatiquement
      console.log('[PWA_INSTALL_PROMPT] Installation réussie');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header avec gradient */}
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Download size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Installer l'app</h3>
                  <p className="text-primary-100 text-sm">Accès rapide depuis votre écran d'accueil</p>
                </div>
              </div>
              <button
                onClick={dismissInstallPrompt}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-4">
            {/* Avantages */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Smartphone size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Accès instantané</p>
                  <p className="text-gray-500 text-xs">Ouvrez l'app directement depuis votre écran d'accueil</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Plus rapide</p>
                  <p className="text-gray-500 text-xs">Chargement plus rapide et navigation fluide</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield size={16} className="text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Sécurisé</p>
                  <p className="text-gray-500 text-xs">Vos données sont protégées et synchronisées</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={handleInstall}
                className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold py-3 px-4 rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Download size={18} />
                <span>Installer</span>
              </button>
              
              <button
                onClick={dismissInstallPrompt}
                className="px-4 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
              >
                Plus tard
              </button>
            </div>

            {/* Note */}
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <Star size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-blue-800 text-xs">
                  <strong>Conseil :</strong> Une fois installée, l'app apparaîtra sur votre écran d'accueil 
                  comme une application native. Vous pourrez y accéder même sans connexion internet !
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
