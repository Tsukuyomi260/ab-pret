export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  export const formatDate = (date) => {
    return new Intl.DateTimeFormat('fr-BJ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };
  
  export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  export const validatePhone = (phone) => {
    // Format téléphone Bénin
    const re = /^(\+229|229)?[0-9]{8}$/;
    return re.test(phone.replace(/\s/g, ''));
  };
  
  export const calculateLoanInterest = (principal, rate, months) => {
    const monthlyRate = rate / 100 / 12;
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalAmount: Math.round(monthlyPayment * months),
      totalInterest: Math.round((monthlyPayment * months) - principal)
    };
  };

/**
 * Formate l'affichage d'un email
 * @param {string} email - L'email à formater
 * @returns {string} - L'email formaté pour l'affichage
 */
export const formatEmailForDisplay = (email) => {
  if (!email) return 'Non défini';
  
  // Si c'est un email temporaire, afficher un message plus clair
  if (email.includes('user.') && email.includes('@gmail.com')) {
    return 'Email temporaire (non défini)';
  }
  
  return email;
};

/**
 * Vérifie si un email est temporaire
 * @param {string} email - L'email à vérifier
 * @returns {boolean} - True si l'email est temporaire
 */
export const isTemporaryEmail = (email) => {
  if (!email) return true;
  return email.includes('user.') && email.includes('@gmail.com');
};