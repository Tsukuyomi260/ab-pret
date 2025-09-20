const http = require('http');

function testOTPEndpoint() {
  console.log('🧪 Test de l\'endpoint OTP...');
  
  const postData = JSON.stringify({
    phoneNumber: '+22912345678',
    otp: '123456',
    userName: 'Test User'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/sms/send-otp',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📡 Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('📤 Réponse du serveur:', JSON.stringify(result, null, 2));
        
        if (result.success) {
          console.log('✅ Endpoint OTP fonctionne correctement');
        } else {
          console.log('❌ Erreur:', result.error);
        }
      } catch (error) {
        console.error('❌ Erreur parsing JSON:', error.message);
        console.log('📤 Réponse brute:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erreur de connexion:', error.message);
  });

  req.write(postData);
  req.end();
}

testOTPEndpoint();
