import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Gift, MessageCircle, Sparkles } from 'lucide-react';

const LoyaltyAchievementModal = ({ isOpen, onClose, userName, onViewBenefits, onContactAdmin }) => {
  if (!isOpen) return null;

  const handleContactAdmin = () => {
    // Numéro WhatsApp de l'admin (à mettre dans une variable d'environnement)
    const adminWhatsApp = process.env.REACT_APP_ADMIN_WHATSAPP || '22953463606';
    const message = encodeURIComponent(
      `Bonjour, je viens d'atteindre le score de fidélité maximum (5/5) et je souhaite recevoir ma récompense. Merci !`
    );
    window.open(`https://wa.me/${adminWhatsApp}?text=${message}`, '_blank');
    if (onContactAdmin) onContactAdmin();
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
              <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 p-6 pb-8">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                  aria-label="Fermer"
                >
                  <X size={20} className="text-white" />
                </button>
                
                {/* Icône de trophée animée */}
                <div className="flex justify-center mb-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="relative"
                  >
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full">
                      <Trophy size={64} className="text-white" />
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="absolute -top-2 -right-2"
                    >
                      <Sparkles size={32} className="text-yellow-300" />
                    </motion.div>
                  </motion.div>
                </div>

                {/* Titre */}
                <h2 className="text-3xl font-bold text-white text-center mb-2 font-montserrat">
                  Félicitations !
                </h2>
                <p className="text-white/90 text-center text-lg font-montserrat">
                  {userName || 'Cher client'}
                </p>
              </div>

              {/* Contenu */}
              <div className="p-6 space-y-4">
                {/* Message de félicitations */}
                <div className="text-center space-y-3">
                  <p className="text-gray-800 text-lg font-semibold font-montserrat">
                    Vous avez accompli un exploit remarquable ! 🎉
                  </p>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
                    <p className="text-gray-700 text-sm leading-relaxed font-montserrat">
                      Félicitations <span className="font-bold text-purple-700">{userName || 'cher client'}</span> ! 
                      Vous avez atteint le <span className="font-bold text-purple-700">score de fidélité maximum (5/5)</span> grâce à vos 
                      <span className="font-bold text-purple-700"> 5 remboursements ponctuels</span>. 
                      Votre sérieux, votre ponctualité et votre fidélité sont remarquables !
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-purple-600 mt-4">
                    <Gift size={20} />
                    <p className="font-semibold font-montserrat">
                      Votre récompense vous attend !
                    </p>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="space-y-3 pt-4">
                  <button
                    onClick={() => {
                      onViewBenefits?.();
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-montserrat"
                  >
                    <Gift size={20} />
                    Voir mes avantages
                  </button>
                  
                  <button
                    onClick={handleContactAdmin}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-montserrat"
                  >
                    <MessageCircle size={20} />
                    Contacter les admins
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

export default LoyaltyAchievementModal;
