// Configuration des prêts AB PRET
export const LOAN_CONFIG = {
  // Durées disponibles (en semaines)
  durations: [
    { value: 1, label: '1 semaine', weeks: 1 },
    { value: 2, label: '2 semaines', weeks: 2 },
    { value: 4, label: '1 mois', weeks: 4 }
  ],

  // Taux d'intérêt selon la durée
  interestRates: {
    shortTerm: 10, // 10% pour les prêts de 1-2 semaines
    longTerm: 35   // 35% pour les prêts de plus d'un mois
  },

  // Montants min/max
  amounts: {
    min: 5000,   // 5,000 FCFA minimum
    max: 500000  // 500,000 FCFA maximum
  },

  // Revenus mensuels min/max
  monthlyIncome: {
    min: 10000,   // 10,000 FCFA minimum
    max: 2000000  // 2,000,000 FCFA maximum
  },

  // Calcul du taux selon la durée
  getInterestRate: (durationWeeks) => {
    return durationWeeks <= 2 ? LOAN_CONFIG.interestRates.shortTerm : LOAN_CONFIG.interestRates.longTerm;
  },

  // Calcul des intérêts
  calculateInterest: (amount, durationWeeks) => {
    const rate = LOAN_CONFIG.getInterestRate(durationWeeks);
    return (amount * rate) / 100;
  },

  // Calcul du montant total à rembourser
  calculateTotalAmount: (amount, durationWeeks) => {
    const interest = LOAN_CONFIG.calculateInterest(amount, durationWeeks);
    return amount + interest;
  },

  // Calcul du montant mensuel (si applicable)
  calculateMonthlyPayment: (totalAmount, durationWeeks) => {
    if (durationWeeks <= 4) {
      return totalAmount; // Paiement unique
    }
    // Pour les prêts plus longs, diviser par le nombre de mois
    const months = Math.ceil(durationWeeks / 4);
    return totalAmount / months;
  },

  // Validation des données
  validateLoan: (amount, durationWeeks) => {
    const errors = [];

    if (amount < LOAN_CONFIG.amounts.min) {
      errors.push(`Le montant minimum est de ${LOAN_CONFIG.amounts.min.toLocaleString()} FCFA`);
    }

    if (amount > LOAN_CONFIG.amounts.max) {
      errors.push(`Le montant maximum est de ${LOAN_CONFIG.amounts.max.toLocaleString()} FCFA`);
    }

    const validDurations = LOAN_CONFIG.durations.map(d => d.weeks);
    if (!validDurations.includes(durationWeeks)) {
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