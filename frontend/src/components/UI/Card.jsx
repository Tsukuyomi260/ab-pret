import React from 'react';

const Card = ({ children, className = '', title, ...props }) => {
  return (
    <div className={`bg-white rounded-xl shadow-soft border border-accent-200 ${className}`} {...props}>
      {title && (
        <div className="px-6 py-4 border-b border-accent-200">
          <h3 className="text-lg font-semibold text-secondary-900 font-montserrat">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;