import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  ArrowLeft, 
  Clock, 
  Bell, 
  Sparkles,
  Activity,
  Shield,
  Users,
  Target,
  Lightbulb,
  BarChart3,
  Building2
} from 'lucide-react';

const ABNutrition = () => {
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
      icon: <Target size={24} />,
      title: "Stratégie Business",
      description: "Définissez votre vision et planifiez votre croissance entrepreneuriale"
    },
    {
      icon: <BarChart3 size={24} />,
      title: "Finance d'Entreprise",
      description: "Solutions de financement et gestion financière pour votre business"
    },
    {
      icon: <Lightbulb size={24} />,
      title: "Innovation & Développement",
      description: "Accompagnement dans vos projets d'innovation et d'expansion"
    },
    {
      icon: <Building2 size={24} />,
      title: "Structuring & Organisation",
      description: "Optimisez votre structure organisationnelle et vos processus"
    }
  ];

  const services = [
    {
      title: "Coaching Personnalisé",
      description: "Sessions individuelles avec nos experts en entrepreneuriat",
      icon: <Users size={24} />,
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Analyse Financière",
      description: "Diagnostic complet de votre situation financière",
      icon: <BarChart3 size={24} />,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Plan de Croissance",
      description: "Roadmap détaillé pour développer votre entreprise",
      icon: <TrendingUp size={24} />,
      color: "from-purple-500 to-violet-600"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50">
      {/* Header avec navigation */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-600 opacity-10"></div>
        
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
              <ArrowLeft size={16} className="text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Retour au menu</span>
            </motion.button>

            {/* Contenu principal */}
            <div className="text-center max-w-4xl mx-auto">

              {/* Titre principal */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6"
              >
                Coaching et{' '}
                <span className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Finance Entrepreneuriale
                </span>
              </motion.h1>

              {/* Sous-titre */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl lg:text-2xl text-gray-600 mb-8 font-light"
              >
                Développez votre entreprise avec notre expertise en finance et notre accompagnement personnalisé
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
                    <div className="text-3xl font-bold text-purple-600">
                      {currentTime.toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        second: '2-digit' 
                      })}
                    </div>
                    <div className="text-sm text-gray-500">
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

              {/* Section des fonctionnalités principales */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-12"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Nos Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl text-white">
                          {feature.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                          <p className="text-gray-600 text-sm">{feature.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Section des services premium */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-12"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Services Premium</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {services.map((service, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      <div className="text-center">
                        <div className={`inline-flex p-3 bg-gradient-to-r ${service.color} rounded-xl text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          {service.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">{service.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Call to action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-center"
              >
                <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 inline-block">
                  <div className="flex items-center space-x-3">
                    <Sparkles size={24} />
                    <span className="text-lg font-semibold">Commencer votre coaching</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ABNutrition; 