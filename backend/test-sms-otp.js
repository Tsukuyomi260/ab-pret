const fetch = require('node-fetch');

async function testSMSOTP() {
  console.log('🧪 Test envoi SMS OTP...\n');

  try {
    // Test 1: Statut du serveur
    console.log('1️⃣ Vérification du serveur API...');
    const statusResponse = await fetch('http://localhost:5000/api/debug/status');
    const statusData = await statusResponse.json();
    console.log('📊 Statut serveur:', statusData);

    // Test 2: Envoi OTP
    console.log('\n2️⃣ Test envoi OTP...');
    const otpResponse = await fetch('http://localhost:5000/api/sms/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: '+22953489846',
        type: 'registration'
      })
    });

    const otpData = await otpResponse.json();
    console.log('📱 Réponse OTP:', otpData);

    if (otpData.success) {
      console.log('✅ OTP envoyé avec succès !');
      console.log('📋 Message ID:', otpData.message_id);
    } else {
      console.log('❌ Erreur envoi OTP:', otpData.error);
    }

  } catch (error) {
    console.error('❌ Erreur test:', error.message);
  }
}

// Exécuter le test
testSMSOTP();
