import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, User, ArrowRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminLoyaltyAlertModal = ({ isOpen, onClose, userName, userId, onContactUser }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleContactUser = () => {
    if (onContactUser) {
      onContactUser(userId);
    }
    // Rediriger vers le profil utilisateur avec les stats des 5 derniers prêts
    navigate(`/admin/user-management?userId=${userId}&showStats=true`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal style iPhone */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header avec bouton X */}
              <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-6 pb-8">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                  aria-label="Fermer"
                >
                  <X size={20} className="text-white" />
                </button>
                
                {/* Icône de trophée */}
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full">
                    <Trophy size={64} className="text-white" />
                  </div>
                </div>

                {/* Titre */}
                <h2 className="text-2xl font-bold text-white text-center mb-2 font-montserrat">
                  Score de fidélité atteint !
                </h2>
              </div>

              {/* Contenu */}
              <div className="p-6 space-y-4">
                {/* Message */}
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <User size={24} className="text-purple-600" />
                    <p className="text-gray-800 text-lg font-semibold font-montserrat">
                      {userName || 'Un utilisateur'}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-100">
                    <p className="text-gray-700 text-sm leading-relaxed font-montserrat">
                      L'utilisateur <span className="font-bold text-purple-700">{userName || 'ce client'}</span> a atteint le 
                      <span className="font-bold text-purple-700"> score de fidélité maximum (5/5)</span> grâce à ses 
                      <span className="font-bold text-purple-700"> 5 remboursements ponctuels</span>.
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-2 text-purple-600">
                      <TrendingUp size={16} />
                      <p className="text-xs font-medium font-montserrat">
                        Il attend sa récompense !
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bouton d'action */}
                <div className="pt-4">
                  <button
                    onClick={handleContactUser}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-montserrat"
                  >
                    <User size={20} />
                    Contacter l'utilisateur
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AdminLoyaltyAlertModal;
