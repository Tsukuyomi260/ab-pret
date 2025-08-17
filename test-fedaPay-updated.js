// Test de la route FedaPay mise à jour
const testFedaPayRoute = async () => {
  console.log('🧪 Test de la route FedaPay mise à jour...\n');

  const testData = {
    amount: 5000, // 50 FCFA en centimes
    loanId: 'test-loan-123',
    userId: 'test-user-456',
    description: 'Test de remboursement',
    customerEmail: 'test@example.com',
    customerName: 'John Doe',
    customerPhone: '+2250701234567'
  };

  try {
    console.log('📤 Envoi de la requête...');
    console.log('Données:', JSON.stringify(testData, null, 2));

    const response = await fetch('http://localhost:5000/api/fedapay/create-transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();

    console.log('\n📥 Réponse reçue:');
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Body:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n✅ Test réussi !');
      console.log('URL de redirection:', result.url);
      console.log('Transaction ID:', result.transaction_id);
      console.log('Public Key:', result.public_key ? 'CONFIGURÉE' : 'NON CONFIGURÉE');
    } else {
      console.log('\n❌ Test échoué !');
      console.log('Erreur:', result.error);
      if (result.details) {
        console.log('Détails:', result.details);
      }
    }

  } catch (error) {
    console.error('\n💥 Erreur lors du test:', error.message);
  }
};

// Test des variables d'environnement
const testEnvironment = () => {
  console.log('🔧 Test des variables d\'environnement...\n');
  
  const envVars = [
    'FEDAPAY_SECRET_KEY',
    'FEDAPAY_PUBLIC_KEY', 
    'FEDAPAY_ENVIRONMENT',
    'NODE_ENV'
  ];

  envVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      if (varName.includes('KEY')) {
        console.log(`${varName}: ${value.substring(0, 10)}...`);
      } else {
        console.log(`${varName}: ${value}`);
      }
    } else {
      console.log(`${varName}: NON CONFIGURÉE`);
    }
  });
};

// Test de la structure de la réponse
const testResponseStructure = (result) => {
  console.log('\n🔍 Vérification de la structure de réponse...');
  
  const requiredFields = ['success', 'url', 'transaction_id'];
  const optionalFields = ['public_key'];
  
  requiredFields.forEach(field => {
    if (result.hasOwnProperty(field)) {
      console.log(`✅ ${field}: présent`);
    } else {
      console.log(`❌ ${field}: manquant`);
    }
  });

  optionalFields.forEach(field => {
    if (result.hasOwnProperty(field)) {
      console.log(`✅ ${field}: présent`);
    } else {
      console.log(`⚠️  ${field}: optionnel, non présent`);
    }
  });
};

// Test complet
const runCompleteTest = async () => {
  console.log('🚀 Test complet de la route FedaPay mise à jour\n');
  console.log('=' .repeat(60));
  
  testEnvironment();
  console.log('\n' + '=' .repeat(60));
  
  await testFedaPayRoute();
  
  console.log('\n' + '=' .repeat(60));
  console.log('📋 Instructions pour la production:');
  console.log('1. Configurez FEDAPAY_SECRET_KEY avec votre vraie clé');
  console.log('2. Configurez FEDAPAY_PUBLIC_KEY avec votre vraie clé publique');
  console.log('3. Définissez FEDAPAY_ENVIRONMENT=live pour la production');
  console.log('4. Testez avec de petits montants d\'abord');
  console.log('5. Vérifiez les webhooks dans votre dashboard FedaPay');
};

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  runCompleteTest();
}

module.exports = {
  testFedaPayRoute,
  testEnvironment,
  testResponseStructure,
  runCompleteTest
};
