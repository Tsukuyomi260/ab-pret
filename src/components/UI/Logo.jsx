import React from 'react';
import BlurText from './BlurText';

const Logo = ({ className = '', size = 'md', showText = true }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const handleAnimationComplete = () => {
    console.log('CAMPUS FINANCE animation completed!');
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo CAMPUS FINANCE avec image PNG */}
      <div className={`${sizes[size]} flex-shrink-0`}>
        <img 
          src="/logo-campus-finance.png" 
          alt="CAMPUS FINANCE Logo"
          className="w-full h-full object-contain"
        />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <BlurText
            text="CAMPUS FINANCE"
            delay={150}
            className={`font-semibold text-secondary-900 font-montserrat ${textSizes[size]}`}
            animateBy="letters"
            direction="top"
            onAnimationComplete={handleAnimationComplete}
          />
          <p className="text-xs text-neutral-600 font-montserrat">
            Votre succès, notre mission
          </p>
        </div>
      )}
    </div>
  );
};

export default Logo; 