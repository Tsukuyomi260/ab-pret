import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error, 
  required = false,
  disabled = false,
  className = '',
  children,
  ...props 
}) => {
  const inputClasses = `
    w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 font-montserrat
    ${error ? 'border-red-500' : 'border-accent-300'}
    ${disabled ? 'bg-accent-100 cursor-not-allowed' : 'bg-white'}
    ${className}
  `;

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={inputClasses}
            {...props}
          >
            {children}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`${inputClasses} resize-vertical min-h-[100px]`}
            {...props}
          />
        );
      
      default:
        return (
          <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={inputClasses}
            {...props}
          />
        );
    }
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-secondary-900 mb-2 font-montserrat">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {renderInput()}
      {error && (
        <p className="mt-1 text-sm text-red-500 font-montserrat">{error}</p>
      )}
    </div>
  );
};

export default Input;