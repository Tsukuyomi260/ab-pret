// =====================================================
// TEST D'INSCRIPTION COMPLÈTE
// =====================================================

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// Configuration
const API_BASE_URL = 'http://localhost:5000';
const TEST_PHONE = '+22953489846'; // Votre numéro de test

async function testInscription() {
  console.log('🧪 Test d\'inscription complète...\n');
  
  try {
    // Test 1: Statut du serveur
    console.log('1️⃣ Vérification du serveur :');
    const statusResponse = await axios.get(`${API_BASE_URL}/api/debug/status`);
    console.log('   ✅ Serveur accessible');
    console.log('   📋 Configuration:', statusResponse.data);
    console.log('');
    
    // Test 2: Envoi SMS OTP
    console.log('2️⃣ Test d\'envoi SMS OTP :');
    const otpResponse = await axios.post(`${API_BASE_URL}/api/sms/send-otp`, {
      phoneNumber: TEST_PHONE,
      otp: '123456',
      userName: 'Test User'
    });
    console.log('   ✅ SMS OTP envoyé');
    console.log('   📋 Réponse:', otpResponse.data);
    console.log('');
    
    // Test 3: Démarrage vérification Vonage
    console.log('3️⃣ Test de démarrage vérification Vonage :');
    const verifyResponse = await axios.post(`${API_BASE_URL}/api/sms/start-verification`, {
      phoneNumber: TEST_PHONE
    });
    console.log('   ✅ Vérification démarrée');
    console.log('   📋 Request ID:', verifyResponse.data.request_id);
    console.log('');
    
    // Test 4: Vérification de code
    console.log('4️⃣ Test de vérification de code :');
    const checkResponse = await axios.post(`${API_BASE_URL}/api/sms/check-verification`, {
      requestId: verifyResponse.data.request_id,
      code: '123456'
    });
    console.log('   ✅ Vérification terminée');
    console.log('   📋 Status:', checkResponse.data.status);
    console.log('');
    
    console.log('🎉 Tous les tests sont passés !');
    console.log('\n📝 Prochaines étapes :');
    console.log('   1. Vérifiez que vous avez reçu les SMS');
    console.log('   2. Testez l\'inscription dans l\'application web');
    console.log('   3. Vérifiez que l\'utilisateur est créé dans Supabase');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Le serveur n\'est pas démarré. Démarrez-le avec :');
      console.log('   npm run start:api');
    }
  }
}

// Exécuter le test
testInscription();
