const http = require('http');

// Simuler la fonction generateOTP de supabaseAPI.js
async function generateOTP(phoneNumber, type = 'registration') {
  try {
    console.log('[OTP] Envoi OTP via Vonage...');
    
    // Générer un code OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Envoyer OTP via Vonage (simulation de l'appel depuis React)
    const response = await makeRequest('/api/sms/send-otp', {
      phoneNumber,
      otp: otpCode,
      type
    });
    
    if (response.success) {
      console.log('[OTP] ✅ OTP envoyé avec succès');
      return {
        success: true,
        requestId: response.message_id || 'vonage-' + Date.now(),
        message: 'Code OTP envoyé par SMS'
      };
    } else {
      console.error('[OTP] ❌ Erreur envoi OTP:', response.error);
      return {
        success: false,
        error: response.error || 'Erreur lors de l\'envoi du code OTP'
      };
    }
  } catch (error) {
    console.error('[OTP] ❌ Erreur génération OTP:', error.message);
    return {
      success: false,
      error: 'Erreur de génération OTP'
    };
  }
}

// Fonction pour faire des requêtes HTTP (simulation d'axios)
function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3000, // Via le proxy React
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          reject(new Error('Erreur parsing JSON: ' + error.message));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Test du processus de création de compte
async function testCreateAccount() {
  console.log('🧪 Test du processus de création de compte...');
  
  try {
    // Simuler les données utilisateur
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+22912345678',
      email: 'john.doe@example.com',
      password: 'password123'
    };
    
    console.log('📱 Numéro de téléphone:', userData.phoneNumber);
    
    // Étape 1: Générer et envoyer OTP
    const otpResult = await generateOTP(userData.phoneNumber, 'registration');
    
    if (otpResult.success) {
      console.log('✅ OTP généré avec succès');
      console.log('📋 Request ID:', otpResult.requestId);
      console.log('💬 Message:', otpResult.message);
    } else {
      console.log('❌ Erreur génération OTP:', otpResult.error);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testCreateAccount();

