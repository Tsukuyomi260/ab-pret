import React, { useEffect } from 'react';
// Animations supprimées pour améliorer les performances
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', duration = 5000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'warning':
        return <AlertCircle size={20} className="text-yellow-600" />;
      default:
        return <Info size={20} className="text-blue-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    
      <div
        className={`fixed top-4 right-4 z-50 max-w-sm w-full ${getBackgroundColor()} border rounded-2xl shadow-2xl backdrop-blur-xl`}
      >
        <div className="flex items-start p-4">
          <div className="flex-shrink-0 mr-3 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {message}
            </p>
          </div>
          <div className="flex-shrink-0 ml-3">
            <button
              onClick={onClose}
              className="inline-flex text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        
        {/* Barre de progression */}
        <div className="h-1 bg-gray-200 rounded-b-2xl overflow-hidden">
          <div
            className={`h-full ${
              type === 'success' ? 'bg-green-500' :
              type === 'error' ? 'bg-red-500' :
              type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
            }`}
          />
        </div>
      </div>
    
  );
};

export default Toast; 