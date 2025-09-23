// Configuration des prêts AB CAMPUS FINANCE
export const LOAN_CONFIG = {
  // Durées disponibles (en jours)
  durations: [
    { value: 5, label: '5 jours', days: 5 },
    { value: 10, label: '10 jours', days: 10 },
    { value: 15, label: '15 jours', days: 15 },
    { value: 25, label: '25 jours', days: 25 },
    { value: 30, label: '30 jours', days: 30 }
  ],

  // Taux d'intérêt selon la durée (en jours)
  // Note: Pour 30 jours, le taux dépend du montant (voir getInterestRate)
  interestRates: {
    5: 6,   // 6% pour 5 jours
    10: 10, // 10% pour 10 jours
    15: 15, // 15% pour 15 jours
    25: 25, // 25% pour 25 jours (peu importe le montant)
    30: 25  // 25% pour 30 jours (si montant >= 20,000), sinon 30%
  },

  // Montants min/max
  amounts: {
    min: 1000,   // 1,000 FCFA minimum
    max: 500000  // 500,000 FCFA maximum
  },

  // Revenus mensuels min/max
  monthlyIncome: {
    min: 10000,   // 10,000 FCFA minimum
    max: 2000000  // 2,000,000 FCFA maximum
  },

  // Calcul du taux selon la durée et le montant
  getInterestRate: (durationDays, amount = 0) => {
    // Pour 25 jours : 25% peu importe le montant
    if (durationDays === 25) {
      return 25;
    }
    
    // Pour 30 jours : taux dépend du montant
    if (durationDays === 30) {
      return amount >= 20000 ? 25 : 30; // 25% si >= 20,000, sinon 30%
    }
    
    // Pour les autres durées : taux fixe
    return LOAN_CONFIG.interestRates[durationDays] || 25; // 25% par défaut
  },

  // Calcul des intérêts
  calculateInterest: (amount, durationDays) => {
    const rate = LOAN_CONFIG.getInterestRate(durationDays, amount);
    return (amount * rate) / 100;
  },

  // Calcul du montant total à rembourser
  calculateTotalAmount: (amount, durationDays) => {
    const interest = LOAN_CONFIG.calculateInterest(amount, durationDays);
    return amount + interest;
  },

  // Calcul du montant à rembourser (paiement unique pour tous les prêts)
  calculatePaymentAmount: (totalAmount, durationDays) => {
    return totalAmount; // Paiement unique à la fin de la période
  },

  // Validation des données
  validateLoan: (amount, durationDays) => {
    const errors = [];

    if (amount < LOAN_CONFIG.amounts.min) {
      errors.push(`Le montant minimum est de ${LOAN_CONFIG.amounts.min.toLocaleString()} FCFA`);
    }

    if (amount > LOAN_CONFIG.amounts.max) {
      errors.push(`Le montant maximum est de ${LOAN_CONFIG.amounts.max.toLocaleString()} FCFA`);
    }

    const validDurations = LOAN_CONFIG.durations.map(d => d.days);
    if (!validDurations.includes(durationDays)) {
      errors.push('Durée de prêt non valide');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Validation du revenu mensuel
  validateMonthlyIncome: (income) => {
    const errors = [];

    if (income < LOAN_CONFIG.monthlyIncome.min) {
      errors.push(`Le revenu mensuel minimum est de ${LOAN_CONFIG.monthlyIncome.min.toLocaleString()} FCFA`);
    }

    if (income > LOAN_CONFIG.monthlyIncome.max) {
      errors.push(`Le revenu mensuel maximum est de ${LOAN_CONFIG.monthlyIncome.max.toLocaleString()} FCFA`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}; 