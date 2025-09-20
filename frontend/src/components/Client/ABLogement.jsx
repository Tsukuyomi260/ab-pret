import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Clock } from 'lucide-react';

const ABLogement = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 min-h-screen">
      {/* Header avec navigation */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-600 opacity-10"></div>
        
        <div className="relative px-4 lg:px-8 py-6">
          <div className="max-w-4xl mx-auto">
            {/* Bouton retour */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => navigate('/menu')}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-white/50 shadow-lg hover:bg-white/90 transition-all duration-300 mb-8"
            >
              <ArrowLeft size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Retour au menu</span>
            </motion.button>

            {/* Contenu principal */}
            <div className="text-center">
              {/* Icône principale */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-8"
              >
                <div className="inline-flex p-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full text-white shadow-2xl">
                  <Home size={80} />
                </div>
              </motion.div>

              {/* Titre principal */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6"
              >
                AB{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Logement
                </span>
              </motion.h1>

              {/* Message "Bientôt disponible" */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-8"
              >
                <div className="inline-flex items-center space-x-3 px-6 py-3 bg-yellow-100 border border-yellow-300 rounded-full">
                  <Clock size={20} className="text-yellow-600" />
                  <span className="text-lg font-semibold text-yellow-800">Bientôt disponible</span>
                </div>
              </motion.div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-xl lg:text-2xl text-gray-600 mb-12 font-light max-w-2xl mx-auto"
              >
                Nos solutions immobilières et de financement logement sont en cours de développement.
                <br />
                <span className="text-blue-600 font-medium">Revenez bientôt !</span>
              </motion.p>

              {/* Bouton retour au menu */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                onClick={() => navigate('/menu')}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                Retour au menu principal
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ABLogement; 