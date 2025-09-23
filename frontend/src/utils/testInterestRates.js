// Script de test pour vérifier la nouvelle logique des taux d'intérêt
import { LOAN_CONFIG } from './loanConfig.js';

export const testInterestRates = () => {
  console.log('🧪 Test de la nouvelle logique des taux d\'intérêt...\n');

  const testCases = [
    // Tests pour 25 jours (25% peu importe le montant)
    { amount: 5000, duration: 25, expectedRate: 25, description: '25 jours - 5,000 FCFA' },
    { amount: 15000, duration: 25, expectedRate: 25, description: '25 jours - 15,000 FCFA' },
    { amount: 25000, duration: 25, expectedRate: 25, description: '25 jours - 25,000 FCFA' },
    { amount: 100000, duration: 25, expectedRate: 25, description: '25 jours - 100,000 FCFA' },
    
    // Tests pour 30 jours avec montant < 20,000 (30%)
    { amount: 5000, duration: 30, expectedRate: 30, description: '30 jours - 5,000 FCFA (< 20,000)' },
    { amount: 15000, duration: 30, expectedRate: 30, description: '30 jours - 15,000 FCFA (< 20,000)' },
    { amount: 19999, duration: 30, expectedRate: 30, description: '30 jours - 19,999 FCFA (< 20,000)' },
    
    // Tests pour 30 jours avec montant >= 20,000 (25%)
    { amount: 20000, duration: 30, expectedRate: 25, description: '30 jours - 20,000 FCFA (>= 20,000)' },
    { amount: 25000, duration: 30, expectedRate: 25, description: '30 jours - 25,000 FCFA (>= 20,000)' },
    { amount: 100000, duration: 30, expectedRate: 25, description: '30 jours - 100,000 FCFA (>= 20,000)' },
    
    // Tests pour les autres durées (taux fixes)
    { amount: 10000, duration: 5, expectedRate: 6, description: '5 jours - 10,000 FCFA' },
    { amount: 10000, duration: 10, expectedRate: 10, description: '10 jours - 10,000 FCFA' },
    { amount: 10000, duration: 15, expectedRate: 15, description: '15 jours - 10,000 FCFA' },
  ];

  let passedTests = 0;
  let totalTests = testCases.length;

  console.log('📊 Résultats des tests :\n');

  testCases.forEach((testCase, index) => {
    const actualRate = LOAN_CONFIG.getInterestRate(testCase.duration, testCase.amount);
    const interestAmount = LOAN_CONFIG.calculateInterest(testCase.amount, testCase.duration);
    const totalAmount = LOAN_CONFIG.calculateTotalAmount(testCase.amount, testCase.duration);
    
    const passed = actualRate === testCase.expectedRate;
    if (passed) passedTests++;

    console.log(`${index + 1}. ${testCase.description}`);
    console.log(`   Montant: ${testCase.amount.toLocaleString()} FCFA`);
    console.log(`   Durée: ${testCase.duration} jours`);
    console.log(`   Taux attendu: ${testCase.expectedRate}%`);
    console.log(`   Taux calculé: ${actualRate}%`);
    console.log(`   Intérêts: ${interestAmount.toLocaleString()} FCFA`);
    console.log(`   Total à rembourser: ${totalAmount.toLocaleString()} FCFA`);
    console.log(`   Résultat: ${passed ? '✅ PASS' : '❌ FAIL'}\n`);
  });

  console.log(`📈 Résumé des tests:`);
  console.log(`   Tests réussis: ${passedTests}/${totalTests}`);
  console.log(`   Taux de réussite: ${Math.round((passedTests / totalTests) * 100)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 Tous les tests sont passés ! La nouvelle logique fonctionne correctement.');
  } else {
    console.log('\n⚠️  Certains tests ont échoué. Vérifiez la logique des taux d\'intérêt.');
  }

  return passedTests === totalTests;
};

// Fonction pour tester des cas spécifiques
export const testSpecificCase = (amount, duration) => {
  console.log(`\n🔍 Test spécifique:`);
  console.log(`   Montant: ${amount.toLocaleString()} FCFA`);
  console.log(`   Durée: ${duration} jours`);
  
  const rate = LOAN_CONFIG.getInterestRate(duration, amount);
  const interest = LOAN_CONFIG.calculateInterest(amount, duration);
  const total = LOAN_CONFIG.calculateTotalAmount(amount, duration);
  
  console.log(`   Taux d'intérêt: ${rate}%`);
  console.log(`   Montant des intérêts: ${interest.toLocaleString()} FCFA`);
  console.log(`   Total à rembourser: ${total.toLocaleString()} FCFA`);
  
  return { rate, interest, total };
};

// Afficher les instructions au chargement
if (typeof window !== 'undefined') {
  console.log(`
🧪 Instructions pour tester les nouveaux taux d'intérêt :

1. Test complet :
   testInterestRates()

2. Test d'un cas spécifique :
   testSpecificCase(15000, 30)  // 15,000 FCFA sur 30 jours
   testSpecificCase(25000, 30)  // 25,000 FCFA sur 30 jours
   testSpecificCase(10000, 25)  // 10,000 FCFA sur 25 jours

3. Règles appliquées :
   - 25 jours : 25% (peu importe le montant)
   - 30 jours + montant >= 20,000 : 25%
   - 30 jours + montant < 20,000 : 30%
  `);
}
