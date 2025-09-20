// =====================================================
// TEST D'INTÉGRATION VONAGE
// =====================================================

const { Vonage } = require('@vonage/server-sdk');
require('dotenv').config();

// Configuration Vonage
const vonage = new Vonage({
  apiKey: process.env.REACT_APP_VONAGE_API_KEY || "5991994e",
  apiSecret: process.env.REACT_APP_VONAGE_API_SECRET || "TXqA0XxEzJQWBtfI"
});

const BRAND_NAME = process.env.REACT_APP_VONAGE_BRAND_NAME || "AB Campus Finance";

async function testVonageIntegration() {
  console.log('🧪 Test d\'intégration Vonage...\n');
  
  // Test 1: Configuration
  console.log('1️⃣ Vérification de la configuration :');
  console.log(`   API Key: ${process.env.REACT_APP_VONAGE_API_KEY ? '✅ Configurée' : '❌ Manquante'}`);
  console.log(`   API Secret: ${process.env.REACT_APP_VONAGE_API_SECRET ? '✅ Configurée' : '❌ Manquante'}`);
  console.log(`   Brand Name: ${BRAND_NAME}`);
  console.log('');
  
  // Test 2: Envoi SMS simple
  console.log('2️⃣ Test d\'envoi SMS simple :');
  try {
    const testPhone = '+22953489846'; // Votre numéro de test
    const testMessage = 'Test SMS Vonage - AB Campus Finance';
    
    console.log(`   📱 Envoi à: ${testPhone}`);
    console.log(`   📝 Message: ${testMessage}`);
    
    const result = await vonage.message.sendSms(BRAND_NAME, testPhone, testMessage);
    
    if (result.messages[0].status === '0') {
      console.log('   ✅ SMS envoyé avec succès !');
      console.log(`   📋 Message ID: ${result.messages[0]['message-id']}`);
    } else {
      console.log('   ❌ Échec de l\'envoi SMS');
      console.log(`   📋 Erreur: ${result.messages[0]['error-text']}`);
    }
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }
  console.log('');
  
  // Test 3: Démarrage vérification
  console.log('3️⃣ Test de démarrage de vérification :');
  try {
    const testPhone = '+22953489846'; // Votre numéro de test
    
    console.log(`   📱 Démarrage vérification pour: ${testPhone}`);
    
    const result = await vonage.verify.start({
      number: testPhone,
      brand: BRAND_NAME
    });
    
    console.log('   ✅ Vérification démarrée !');
    console.log(`   📋 Request ID: ${result.request_id}`);
    
    // Stocker le request_id pour le test suivant
    global.testRequestId = result.request_id;
    
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }
  console.log('');
  
  // Test 4: Vérification du code (simulation)
  if (global.testRequestId) {
    console.log('4️⃣ Test de vérification de code (simulation) :');
    try {
      const testCode = '123456'; // Code de test
      
      console.log(`   🔍 Vérification du code: ${testCode}`);
      console.log(`   📋 Request ID: ${global.testRequestId}`);
      
      const result = await vonage.verify.check(global.testRequestId, testCode);
      
      console.log('   ✅ Vérification terminée !');
      console.log(`   📋 Status: ${result.status}`);
      
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    }
    console.log('');
  }
  
  // Test 5: Test du serveur API
  console.log('5️⃣ Test du serveur API :');
  try {
    const axios = require('axios');
    
    // Test du statut du serveur
    const statusResponse = await axios.get('http://localhost:5000/api/debug/status');
    console.log('   ✅ Serveur API accessible');
    console.log('   📋 Configuration:', statusResponse.data);
    
  } catch (error) {
    console.log(`   ❌ Erreur serveur: ${error.message}`);
    console.log('   💡 Assurez-vous que le serveur est démarré avec: npm run start:api');
  }
  console.log('');
  
  console.log('🎉 Tests terminés !');
  console.log('\n📝 Prochaines étapes :');
  console.log('   1. Vérifiez que les SMS sont reçus');
  console.log('   2. Testez l\'inscription d\'un utilisateur');
  console.log('   3. Configurez les variables d\'environnement si nécessaire');
}

// Exécuter les tests
testVonageIntegration().catch(error => {
  console.error('❌ Erreur lors des tests:', error);
  process.exit(1);
});
