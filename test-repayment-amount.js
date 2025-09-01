// Test pour vérifier que le montant exact est calculé et transmis au remboursement
const { LOAN_CONFIG } = require('./src/utils/loanConfig.js');

console.log('🧮 Test du montant exact de remboursement\n');

// Simuler un prêt avec différentes durées
const testCases = [
  { amount: 5000, duration: 10, expectedInterest: 500, expectedTotal: 5500 },
  { amount: 10000, duration: 15, expectedInterest: 1500, expectedTotal: 11500 },
  { amount: 20000, duration: 30, expectedInterest: 5000, expectedTotal: 25000 }
];

testCases.forEach((testCase, index) => {
  console.log(`📊 Test ${index + 1}: ${testCase.amount}f pour ${testCase.duration} jours`);
  
  // 1. Calcul lors de la demande de prêt (LoanRequest.jsx)
  const interestRate = LOAN_CONFIG.getInterestRate(testCase.duration);
  const interestAmount = LOAN_CONFIG.calculateInterest(testCase.amount, testCase.duration);
  const totalAmount = LOAN_CONFIG.calculateTotalAmount(testCase.amount, testCase.duration);
  
  console.log(`   📈 Taux d'intérêt: ${interestRate}%`);
  console.log(`   💰 Intérêts: ${interestAmount}f`);
  console.log(`   💵 Total: ${totalAmount}f`);
  
  // 2. Stockage en base (ce qui est sauvegardé)
  const storedLoan = {
    amount: testCase.amount,
    interest_rate: interestRate,
    duration: testCase.duration
  };
  
  // 3. Calcul lors du remboursement (Repayment.jsx)
  const repaymentTotalAmount = storedLoan.amount * (1 + storedLoan.interest_rate / 100);
  const remainingAmount = Math.max(0, repaymentTotalAmount - 0); // Aucun paiement effectué
  
  console.log(`   🔄 Calcul remboursement: ${storedLoan.amount} * (1 + ${storedLoan.interest_rate}/100) = ${repaymentTotalAmount}f`);
  console.log(`   💳 Montant à rembourser: ${remainingAmount}f`);
  
  // 4. Vérification
  const isExact = Math.abs(totalAmount - repaymentTotalAmount) < 0.01;
  const matchesExpected = Math.abs(remainingAmount - testCase.expectedTotal) < 0.01;
  
  console.log(`   ✅ Calcul exact: ${isExact ? 'OUI' : 'NON'}`);
  console.log(`   ✅ Correspond à l'attendu: ${matchesExpected ? 'OUI' : 'NON'}`);
  
  if (!isExact) {
    console.log(`   ❌ ERREUR: Différence de ${Math.abs(totalAmount - repaymentTotalAmount)}f`);
  }
  
  console.log('');
});

console.log('🎯 Conclusion:');
console.log('   - Le montant calculé lors de la demande de prêt doit être EXACTEMENT le même');
console.log('   - Le montant utilisé pour le remboursement doit être EXACTEMENT le même');
console.log('   - Aucune différence ne doit être tolérée');
