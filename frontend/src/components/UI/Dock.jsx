import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const Dock = ({ 
  items, 
  panelHeight = 68, 
  baseItemSize = 50, 
  magnification = 70,
  className = ''
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Gestion du scroll pour cacher/montrer le dock
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Si on scroll vers le bas, cacher le dock
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } 
      // Si on scroll vers le haut, montrer le dock
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleItemClick = (item) => {
    if (item.path && item.path !== location.pathname) {
      navigate(item.path);
    }
  };

  return (
    <motion.div 
      className={`fixed bottom-4 left-4 right-4 z-50 ${className}`}
      initial={{ y: 100, opacity: 0 }}
      animate={{ 
        y: isVisible ? 0 : 100, 
        opacity: isVisible ? 1 : 0 
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        duration: 0.3
      }}
    >
      {/* Fond blanc */}
      <div className="absolute inset-0 bg-white border border-accent-200 rounded-3xl shadow-2xl" />
      
      {/* Container du dock */}
      <div 
        className="relative flex items-center justify-center px-6 py-3"
        style={{ height: panelHeight }}
      >
        <div className="flex items-center space-x-3">
          {items.map((item, index) => {
            const isHovered = hoveredIndex === index;
            const isActive = location.pathname === item.path;
            const size = isHovered ? baseItemSize + magnification : baseItemSize;
            
            return (
              <motion.div
                key={index}
                className="relative"
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                onClick={() => handleItemClick(item)}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {/* Item principal */}
                <motion.div
                  className={`
                    flex flex-col items-center justify-center rounded-2xl cursor-pointer
                    ${isActive 
                      ? 'bg-primary-100 shadow-lg' 
                      : isHovered 
                        ? 'bg-accent-100 shadow-lg' 
                        : 'bg-transparent hover:bg-accent-50'
                    }
                    transition-all duration-300 ease-out
                  `}
                  style={{
                    width: size,
                    height: size,
                    minWidth: size,
                    minHeight: size
                  }}
                  animate={{
                    scale: isHovered ? 1.15 : 1,
                    y: isHovered ? -12 : 0
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 17 
                  }}
                >
                  {/* Icône */}
                  <motion.div 
                    className={`
                      transition-colors duration-200
                      ${isActive 
                        ? 'text-primary-600' 
                        : isHovered 
                          ? 'text-primary-600' 
                          : 'text-secondary-600'
                      }
                    `}
                    animate={{
                      scale: isHovered ? 1.1 : 1
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.icon}
                  </motion.div>
                  
                  {/* Label */}
                  <motion.span
                    className={`text-xs font-medium mt-1 transition-colors duration-200 ${
                      isActive 
                        ? 'text-primary-600' 
                        : isHovered 
                          ? 'text-primary-600' 
                          : 'text-secondary-600'
                    }`}
                    style={{ fontSize: '10px' }}
                    animate={{
                      scale: isHovered ? 1.05 : 1
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.span>
                </motion.div>
                
                {/* Effet de glow pour l'item hovered */}
                {isHovered && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-primary-200/40 blur-2xl -z-10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1.3 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Indicateur de sécurité pour iOS */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary-200/50 to-transparent rounded-full" />
    </motion.div>
  );
};

export default Dock; 