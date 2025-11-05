import React, { useEffect, useState } from 'react';
import { X, RefreshCw, Sparkles, CheckCircle } from 'lucide-react';

const UpdatePrompt = ({ updateAvailable, newVersion, onUpdate, onIgnore, currentVersion }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (updateAvailable) {
      // Délai d'animation pour un effet plus doux
      setTimeout(() => {
        setIsVisible(true);
      }, 500);
    }
  }, [updateAvailable]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    // Petite animation avant le rechargement
    setTimeout(() => {
      onUpdate();
    }, 300);
  };

  const handleIgnore = () => {
    setIsVisible(false);
    setTimeout(() => {
      onIgnore();
    }, 300);
  };

  if (!updateAvailable || !isVisible) {
    return null;
  }

  const formatVersion = (version) => {
    if (!version) return 'nouvelle version';
    return `v${version.version || version}`;
  };

  return (
    <>
      {/* Overlay avec animation */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998] transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleIgnore}
      />

      {/* Prompt de mise à jour */}
      <div 
        className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-[9999] transition-all duration-300 ${
          isVisible 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-full opacity-0'
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header avec gradient */}
          <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Mise à jour disponible</h3>
                  <p className="text-white/90 text-xs">
                    {newVersion ? formatVersion(newVersion) : 'Nouvelle version'} prête à être installée
                  </p>
                </div>
              </div>
              <button
                onClick={handleIgnore}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-gray-700 text-sm font-medium">
                  Une nouvelle version de l'application est disponible
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {newVersion?.buildDate 
                    ? `Mise à jour du ${new Date(newVersion.buildDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}`
                    : 'Profitez des dernières améliorations et corrections'
                  }
                </p>
              </div>
            </div>

            {/* Liste des avantages */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Nouvelles fonctionnalités</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Corrections de bugs</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Amélioration des performances</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleIgnore}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Plus tard
              </button>
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Mettre à jour
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdatePrompt;

