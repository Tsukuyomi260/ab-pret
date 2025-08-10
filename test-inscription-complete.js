const fetch = require('node-fetch');

async function testInscriptionComplete() {
  console.log('🧪 Test inscription complète...\n');

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
        otp: '123456',
        type: 'registration'
      })
    });

    const otpData = await otpResponse.json();
    console.log('📱 Réponse OTP:', otpData);

    if (otpData.success) {
      console.log('✅ OTP envoyé avec succès !');
    } else {
      console.log('❌ Erreur envoi OTP:', otpData.error);
    }

    // Test 3: Message de bienvenue
    console.log('\n3️⃣ Test message de bienvenue...');
    const welcomeResponse = await fetch('http://localhost:5000/api/sms/send-welcome', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: '+22953489846',
        userName: 'Test Utilisateur'
      })
    });

    const welcomeData = await welcomeResponse.json();
    console.log('📱 Réponse Welcome:', welcomeData);

    if (welcomeData.success) {
      console.log('✅ Message de bienvenue envoyé !');
    } else {
      console.log('❌ Erreur message de bienvenue:', welcomeData.error);
    }

    console.log('\n🎉 Test inscription terminé !');
    console.log('📝 En mode echo, les SMS sont simulés dans les logs du serveur.');

  } catch (error) {
    console.error('❌ Erreur test:', error.message);
  }
}

// Exécuter le test
testInscriptionComplete();
