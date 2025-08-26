import React from 'react';
import { useRequireSavingsPlan } from '../../hooks/useSavingsPlanGuard';

const SavingsPlanGuard = ({ children }) => {
  const { isChecking } = useRequireSavingsPlan();

  // Afficher un loader pendant la vérification
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Toujours afficher le contenu (pas de protection forcée)
  return children;
};

export default SavingsPlanGuard;
