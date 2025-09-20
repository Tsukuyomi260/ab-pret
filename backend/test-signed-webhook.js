const http = require('http');
const crypto = require('crypto');

// Remplacez 'VOTRE_CLE_WEBHOOK_REELLE' par votre vraie clé de signature webhook FedaPay
const secret = process.env.FEDAPAY_SECRET_KEY || 'wh_sandbox_FFuTdToDn2qOK81TcEnXSprb';

const payload = {
  entity: {
    id: 'txn_test_001',
    status: 'approved',
    amount: 15000,
    metadata: {
      loan_id: 1,
      user_id: 1,
      type: 'loan_repayment'
    },
    payment_method: { brand: 'MTN', type: 'mobile_money' },
    paid_at: new Date().toISOString()
  }
};

const rawBody = JSON.stringify(payload);
const signature = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');

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
    console.log('Status:', res.statusCode);
    console.log('Body:', data);
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
});

req.write(rawBody);
req.end(); 