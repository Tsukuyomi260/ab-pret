import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  ArrowLeft, 
  Clock, 
  Bell, 
  Sparkles,
  Building2,
  MapPin,
  Users
} from 'lucide-react';

const ABLogement = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <Building2 size={24} />,
      title: "Financement Immobilier",
      description: "Prêts personnalisés pour l'achat de votre résidence principale"
    },
    {
      icon: <MapPin size={24} />,
      title: "Gestion Locative",
      description: "Services complets de gestion de biens immobiliers"
    },
    {
      icon: <Users size={24} />,
      title: "Conseil Personnalisé",
      description: "Accompagnement expert pour vos projets immobiliers"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header avec navigation */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 opacity-10"></div>
        
        <div className="relative px-4 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
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
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg mb-8"
              >
                <Clock size={20} className="text-white" />
                <span className="text-white font-semibold">Bientôt Disponible</span>
              </motion.div>

              {/* Titre principal */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6"
              >
                AB{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Logement
                </span>
              </motion.h1>

              {/* Sous-titre */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl lg:text-2xl text-gray-600 mb-8 font-light"
              >
                Solutions immobilières innovantes
              </motion.p>

              {/* Horloge animée */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mb-12"
              >
                <div className="inline-flex items-center space-x-4 px-8 py-6 bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl">
                  <div className="text-center">
                    <div className="text-3xl lg:text-4xl font-bold text-blue-600">
                      {currentTime.toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        second: '2-digit' 
                      })}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {currentTime.toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Message principal */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-12"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl p-8 lg:p-12">
                  <div className="flex items-center justify-center mb-6">
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full">
                      <Sparkles size={32} className="text-white" />
                    </div>
                  </div>
                  
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                    Une révolution immobilière arrive
                  </h2>
                  
                  <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                    Nous travaillons actuellement sur des solutions immobilières innovantes 
                    qui transformeront votre expérience d'achat et de gestion de biens. 
                    Restez connecté pour être parmi les premiers à en profiter !
                  </p>
                </div>
              </motion.div>

              {/* Fonctionnalités à venir */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mb-12"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-8">
                  Fonctionnalités à venir
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl mb-4 mx-auto">
                        <div className="text-white">
                          {feature.icon}
                        </div>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 text-center text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Bouton notification */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="mb-8"
              >
                <button className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <Bell size={20} />
                  <span>Être notifié à la sortie</span>
                </button>
              </motion.div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-sm text-gray-500"
              >
                <p>© 2024 Campus Finance - AB Logement</p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ABLogement; 