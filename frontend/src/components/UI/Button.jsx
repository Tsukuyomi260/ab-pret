import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false, 
  onClick, 
  type = 'button',
  className = '',
  ...props 
}) => {
  const baseClasses = 'font-medium rounded-xl transition-colors duration-200 flex items-center justify-center font-montserrat';
  
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 disabled:bg-primary-300',
    secondary: 'bg-secondary-900 text-white hover:bg-secondary-800 disabled:bg-secondary-300',
    outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 disabled:border-primary-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
    accent: 'bg-accent-400 text-secondary-900 hover:bg-accent-500 disabled:bg-accent-300',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={classes}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
