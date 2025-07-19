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