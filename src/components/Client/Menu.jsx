import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SavingsPlanGuard from '../Common/SavingsPlanGuard';

import { 
  Home,
  ArrowRight,
  PiggyBank,
  Heart,
  GraduationCap,
  Award,
  TrendingUp,
  Users
} from 'lucide-react';

const Menu = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: 'Elise HASSI',
    email: 'elise.hassi@example.com',
    role: 'client',
    avatar: null
  });

  const bentoCards = [
    {
      icon: <PiggyBank size={24} />,
      title: 'AB Épargne',
      subtitle: 'Épargne et investissement',
      description: 'Découvrez nos solutions d\'épargne et d\'investissement personnalisées pour faire fructifier votre capital',
      action: () => navigate('/ab-epargne'),
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-100',
      iconBg: 'bg-gradient-to-r from-green-500 to-emerald-600'
    },
    {
      icon: <Home size={24} />,
      title: 'AB Logement',
      subtitle: 'Solutions immobilières',
      description: 'Accédez à nos services de financement immobilier et de gestion locative personnalisés',
      action: () => navigate('/ab-logement'),
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-100',
      iconBg: 'bg-gradient-to-r from-blue-500 to-indigo-600'
    },
    {
      icon: <TrendingUp size={24} />,
      title: 'Coaching et Finance Entrepreneuriale',
      subtitle: 'Accompagnement business',
      description: 'Développez votre entreprise avec notre expertise en finance et notre accompagnement personnalisé',
      action: () => navigate('/coaching-finance'), // Nouvelle route
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-violet-100',
      iconBg: 'bg-gradient-to-r from-purple-500 to-violet-600'
    },
    {
      icon: <Award size={24} />,
      title: 'Score de Fidélité',
      subtitle: 'Programme de récompenses',
      description: 'Découvrez vos avantages et récompenses pour votre fidélité à nos services',
      action: () => navigate('/loyalty-score'),
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-100',
      iconBg: 'bg-gradient-to-r from-yellow-500 to-orange-600'
    }
  ];

  return (
    <SavingsPlanGuard>
      <div className="bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50 pt-0">
      {/* Section Hero - En-tête principal */}
      <div className="relative overflow-hidden">
        {/* Background avec gradient animé */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 opacity-15"></div>
        
        {/* Contenu Header */}
        <div className="relative px-4 lg:px-8 py-8 lg:py-12 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            {/* Section Hero - En-tête principal */}
            <div className="text-center mb-8 lg:mb-12">

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
                  <div className={`${card.bgColor} p-4 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden`}>
                    {/* Effet de brillance au survol */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    
                    {/* En-tête de la carte */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className={`text-lg font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent mb-1`}>
                          {card.title}
                        </h3>
                        <p className="text-xs text-gray-600 font-medium">
                          {card.subtitle}
                        </p>
                      </div>
                      <div className={`p-2 rounded-xl ${card.iconBg} text-white shadow-lg`}>
                        {card.icon}
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">
                      {card.description}
                    </p>
                    
                    {/* Indicateur d'action */}
                    <div className="flex items-center justify-between">
                      <div className={`w-6 h-6 rounded-full ${card.iconBg} flex items-center justify-center`}>
                        <ArrowRight size={12} className="text-white" />
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
    </SavingsPlanGuard>
  );
};

export default Menu; 