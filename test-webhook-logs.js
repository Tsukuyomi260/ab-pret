const http = require('http');
const crypto = require('crypto');

console.log('🧪 Test du webhook FedaPay...');
console.log('Envoyez un webhook de test, puis vérifiez les logs du serveur...\n');

const secret = 'wh_sandbox_YTWtffvhtj2eouWrn8rSxtlk';
const payload = {
  entity: {
    id: 'txn_test_002',
    status: 'approved',
    amount: 25000,
    metadata: {
      loan_id: 2,
      user_id: 2,
      type: 'loan_repayment'
    },
    payment_method: { brand: 'MTN', type: 'mobile_money' },
    paid_at: new Date().toISOString()
  }
};

const rawBody = JSON.stringify(payload);
const signature = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');

console.log('📤 Envoi du webhook...');
console.log('Signature:', signature);
console.log('Payload:', JSON.stringify(payload, null, 2));

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/fedapay/webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(rawBody),
    'x-fedapay-signature': signature,
    'User-Agent': 'FedaPay-Webhook/1.0'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('\n📊 Réponse du serveur:');
    console.log('Status:', res.statusCode);
    console.log('Body:', data);
    
    if (res.statusCode === 200) {
      console.log('\n✅ Webhook envoyé avec succès !');
      console.log('🔍 Vérifiez maintenant les logs du serveur...');
    } else {
      console.log('\n❌ Erreur dans le webhook');
    }
  });
});

req.on('error', (e) => {
  console.error('💥 Erreur de connexion:', e.message);
});

req.write(rawBody);
req.end(); 