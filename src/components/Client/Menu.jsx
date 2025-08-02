import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import { 
  Home,
  ArrowRight,
  PiggyBank,
  Heart,
  GraduationCap,
  Award
} from 'lucide-react';

const Menu = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: 'AVOCE Elodie',
    email: 'elodie.avoce@example.com',
    role: 'client',
    avatar: null
  });



  const bentoCards = [
    {
      icon: <Home size={24} />,
      title: 'AB Logement',
      subtitle: 'Solutions immobilières',
      description: 'Accédez à nos services de financement immobilier et de gestion locative',
      action: () => navigate('/ab-logement'),
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-100',
      iconBg: 'bg-gradient-to-r from-blue-500 to-indigo-600'
    },
    {
      icon: <PiggyBank size={24} />,
      title: 'AB Épargne',
      subtitle: 'Épargne et investissement',
      description: 'Découvrez nos solutions d\'épargne et d\'investissement personnalisées',
      action: () => navigate('/ab-epargne'),
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-100',
      iconBg: 'bg-gradient-to-r from-green-500 to-emerald-600'
    },
    {
      icon: <Heart size={24} />,
      title: 'AB Bien-Être',
      subtitle: 'Santé et bien-être',
      description: 'Prenez soin de votre santé avec nos solutions de financement médical',
      action: () => navigate('/ab-bien-etre'),
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-gradient-to-br from-pink-50 to-rose-100',
      iconBg: 'bg-gradient-to-r from-pink-500 to-rose-600'
    },
    {
      icon: <GraduationCap size={24} />,
      title: 'AB Campus-Finance',
      subtitle: 'Financement étudiant',
      description: 'Solutions de financement spécialement conçues pour les étudiants',
      action: () => navigate('/ab-campus-finance'),
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-violet-100',
      iconBg: 'bg-gradient-to-r from-purple-500 to-violet-600'
    },
    {
      icon: <Award size={24} />,
      title: 'Score de Fidélité',
      subtitle: 'Programme de récompenses',
      description: 'Découvrez vos avantages et récompenses pour votre fidélité',
      action: () => navigate('/loyalty-score'),
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-100',
      iconBg: 'bg-gradient-to-r from-yellow-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50 pt-0">
      {/* Section Hero - En-tête principal */}
      <div className="relative overflow-hidden">
        {/* Background avec gradient animé */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 opacity-15"></div>
        
        {/* Contenu Header */}
        <div className="relative px-4 lg:px-8 py-8 lg:py-12 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            {/* Section Hero - En-tête principal */}
            <div className="text-center mb-8 lg:mb-12">
              {/* Badge animé */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-6 shadow-lg"
              >
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-sm font-medium text-blue-700 font-montserrat">
                  📱 Menu Principal
                </span>
              </motion.div>

              {/* Titre principal */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl lg:text-6xl font-bold text-secondary-900 font-montserrat mb-4"
              >
                Menu{' '}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Principal
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg lg:text-xl text-neutral-600 font-montserrat max-w-3xl mx-auto leading-relaxed"
              >
                Accédez rapidement à toutes les fonctionnalités de Campus Finance
              </motion.p>
            </div>

            {/* Cartes Bento */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {bentoCards.map((card, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="group cursor-pointer"
                  onClick={card.action}
                >
                  <div className={`${card.bgColor} p-6 rounded-3xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden`}>
                    {/* Effet de brillance au survol */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    
                    {/* En-tête de la carte */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent mb-1`}>
                          {card.title}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">
                          {card.subtitle}
                        </p>
                      </div>
                      <div className={`p-3 rounded-2xl ${card.iconBg} text-white shadow-lg`}>
                        {card.icon}
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {card.description}
                    </p>
                    
                    {/* Indicateur d'action */}
                    <div className="flex items-center justify-between">
                      <div className={`w-8 h-8 rounded-full ${card.iconBg} flex items-center justify-center`}>
                        <ArrowRight size={16} className="text-white" />
                      </div>
                      <div className={`text-xs font-medium bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                        Découvrir
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default Menu; 